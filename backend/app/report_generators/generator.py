import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import pdfkit
from jinja2 import Template
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
from datetime import datetime
import logging
import os
from pathlib import Path
from docx import Document

# Configure logger
logger = logging.getLogger(__name__)

class ReportGenerator:
    def __init__(self, cohere_client):
        self.co = cohere_client
        self.logger = logger
        
        # Configure wkhtmltopdf path for Windows
        self.wkhtmltopdf_path = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
        
        # Configure PDF options
        self.pdf_options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'quiet': None  # Reduce console output
        }

        self.viz_templates = {
            'time_series': self._time_series_viz,
            'numerical': self._numerical_viz,
            'categorical': self._categorical_viz,
            'mixed': self._mixed_viz
        }
    
    async def generate_report(self, data: Dict[str, Any], query: str, format: str = "json") -> Dict[str, Any]:
        """Generate a complete report with analysis and visualizations"""
        try:
            # Validate input
            if not isinstance(data, dict):
                raise ValueError("Data must be a dictionary")
            if not isinstance(query, str):
                raise ValueError("Query must be a string")
            if not query.strip():
                raise ValueError("Query cannot be empty")

            self.logger.info(f"Starting report generation with format: {format}")
            self.logger.debug(f"Data: {data}")
            self.logger.debug(f"Query: {query}")

            # Ensure data has required structure
            if 'data' not in data:
                raise ValueError("Data must contain 'data' field")
            if 'type' not in data:
                raise ValueError("Data must contain 'type' field")

            # Generate analysis with error handling
            try:
                analysis = await self._generate_analysis(data, query)
                if not analysis:
                    raise ValueError("Failed to generate analysis")
            except Exception as e:
                self.logger.error(f"Analysis generation failed: {str(e)}")
                raise ValueError(f"Analysis generation failed: {str(e)}")

            # Generate visualizations if data is structured
            visualizations = None
            if data['type'] == 'structured' and isinstance(data['data'], (list, dict)):
                try:
                    df = pd.DataFrame(data['data'])
                    visualizations = self._create_visualization(df, data.get('metadata', {}), query)
                except Exception as e:
                    self.logger.warning(f"Failed to create visualizations: {str(e)}")
                    # Continue without visualizations

            # Generate formatted report
            content = None
            try:
                if format == "pdf":
                    content = self._generate_pdf_report(analysis, visualizations, data)
                elif format == "html":
                    content = self._generate_html_report(analysis, visualizations, data)
                elif format == "docx":
                    content = self._generate_docx_report(analysis, visualizations, data)
            except Exception as e:
                self.logger.error(f"Report formatting failed: {str(e)}")
                raise ValueError(f"Report formatting failed: {str(e)}")

            return {
                "status": "success",
                "format": format,
                "analysis": analysis,
                "content": content,
                "visualizations": visualizations,
                "metadata": data.get("metadata")
            }

        except Exception as e:
            self.logger.error(f"Report generation failed: {str(e)}")
            raise ValueError(f"Failed to generate report: {str(e)}")

    def _generate_text_report(self, analysis: str) -> str:
        """Generate a simple report for text data"""
        template = Template("""
        <div class="report">
            <h1>Text Analysis Report</h1>
            <div class="analysis">
                <h2>Analysis</h2>
                {{ analysis | replace('\n', '<br>') }}
            </div>
        </div>
        """)
        return template.render(analysis=analysis)

    async def _generate_analysis(self, data: Dict[str, Any], query: str) -> str:
        """Generate analysis using Cohere"""
        try:
            prompt = self._generate_analysis_prompt(data, query)
            self.logger.info(f"Generated prompt: {prompt}")
            
            response = self.co.generate(
                prompt=prompt,
                max_tokens=1000,
                temperature=0.7,
                k=0,
                stop_sequences=[],
                return_likelihoods='NONE'
            )
            
            if not response.generations:
                raise Exception("No response generated from Cohere")
                
            return response.generations[0].text
        except Exception as e:
            self.logger.error(f"Error in _generate_analysis: {str(e)}")
            raise Exception(f"Analysis generation failed: {str(e)}")

    def _generate_analysis_prompt(self, data: Dict[str, Any], query: str) -> str:
        """Generate analysis prompt for Cohere"""
        try:
            if data.get('type') == 'unstructured':
                # Handle unstructured (text) data
                text_content = data.get('data', {}).get('text', '')
                return f"""Analyze the following text and answer this question: {query}

                Text Content:
                {text_content[:1000]}  # Limit text length

                Please provide:
                1. Key Points
                2. Main Themes
                3. Insights
                4. Recommendations

                Format the response in clear sections with bullet points."""
            else:
                # Handle structured data
                metadata = data.get('metadata', {})
                stats = metadata.get('statistics', {})
                
                return f"""Analyze the following data and answer this question: {query}

                Data Statistics:
                - Rows: {stats.get('row_count', 'N/A')}
                - Columns: {stats.get('column_count', 'N/A')}
                
                Data Sample:
                {json.dumps(data.get('data', [])[:5], indent=2)}
                
                Please provide:
                1. Key Insights
                2. Detailed Analysis
                3. Business Implications
                4. Limitations and Considerations
                
                Format the response in clear sections with bullet points."""
        except Exception as e:
            self.logger.error(f"Error generating prompt: {str(e)}")
            raise Exception(f"Failed to generate analysis prompt: {str(e)}")

    def _create_visualization(self, data: Dict[str, Any], query: str) -> Dict[str, str]:
        """Create appropriate visualizations based on data type"""
        try:
            df = pd.DataFrame(data['data'])
            data_type = data.get('data_type', 'mixed')
            metadata = data.get('metadata', {})
            
            viz_func = self.viz_templates.get(data_type, self._mixed_viz)
            return viz_func(df, metadata, query)
        except Exception as e:
            raise Exception(f"Error creating visualization: {str(e)}")

    def _time_series_viz(self, df: pd.DataFrame, metadata: Dict[str, Any], query: str) -> Dict[str, str]:
        """Generate time series visualizations"""
        date_cols = metadata.get('date_columns', [])
        if not date_cols:
            return self._mixed_viz(df, metadata, query)
        
        date_col = date_cols[0]
        numeric_cols = metadata.get('numeric_columns', [])
        
        # Interactive plot
        fig = px.line(df, x=date_col, y=numeric_cols[0] if numeric_cols else None)
        interactive_plot = pio.to_html(fig, full_html=False)
        
        # Static plot
        plt.figure(figsize=(10, 6))
        sns.lineplot(data=df, x=date_col, y=numeric_cols[0] if numeric_cols else None)
        static_plot = self._fig_to_base64()
        
        return {
            "interactive": interactive_plot,
            "static": static_plot
        }

    def _numerical_viz(self, df: pd.DataFrame, metadata: Dict[str, Any], query: str) -> Dict[str, str]:
        """Generate numerical visualizations"""
        numeric_cols = metadata.get('numeric_columns', [])
        if not numeric_cols:
            return self._mixed_viz(df, metadata, query)
        
        # Interactive plot
        fig = px.histogram(df, x=numeric_cols[0])
        interactive_plot = pio.to_html(fig, full_html=False)
        
        # Static plot
        plt.figure(figsize=(10, 6))
        sns.histplot(data=df, x=numeric_cols[0])
        static_plot = self._fig_to_base64()
        
        return {
            "interactive": interactive_plot,
            "static": static_plot
        }

    def _categorical_viz(self, df: pd.DataFrame, metadata: Dict[str, Any], query: str) -> Dict[str, str]:
        """Generate categorical visualizations"""
        cat_cols = metadata.get('categorical_columns', [])
        if not cat_cols:
            return self._mixed_viz(df, metadata, query)
        
        # Interactive plot
        fig = px.bar(df[cat_cols[0]].value_counts())
        interactive_plot = pio.to_html(fig, full_html=False)
        
        # Static plot
        plt.figure(figsize=(10, 6))
        sns.countplot(data=df, x=cat_cols[0])
        static_plot = self._fig_to_base64()
        
        return {
            "interactive": interactive_plot,
            "static": static_plot
        }

    def _mixed_viz(self, df: pd.DataFrame, metadata: Dict[str, Any], query: str) -> Dict[str, str]:
        """Generate mixed type visualizations"""
        # Interactive plot
        fig = go.Figure()
        for col in df.select_dtypes(include=[np.number]).columns[:3]:
            fig.add_trace(go.Box(y=df[col], name=col))
        interactive_plot = pio.to_html(fig, full_html=False)
        
        # Static plot
        plt.figure(figsize=(10, 6))
        df.select_dtypes(include=[np.number]).boxplot()
        static_plot = self._fig_to_base64()
        
        return {
            "interactive": interactive_plot,
            "static": static_plot
        }

    def _fig_to_base64(self) -> str:
        """Convert matplotlib figure to base64 string"""
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        plt.close()
        buffer.seek(0)
        return base64.b64encode(buffer.getvalue()).decode()

    def _generate_html_report(self, analysis: str, visualizations: Dict[str, str], data: Dict[str, Any]) -> str:
        """Generate HTML report"""
        template = Template("""
        <div class="report">
            <h1>Data Analysis Report</h1>
            <div class="analysis">
                <h2>Analysis</h2>
                {{ analysis | replace('\n', '<br>') }}
            </div>
            <div class="visualizations">
                <h2>Visualizations</h2>
                <div class="interactive">{{ visualizations.interactive | safe }}</div>
            </div>
            <div class="metadata">
                <h2>Dataset Information</h2>
                <ul>
                    <li>Rows: {{ data.metadata.statistics.row_count }}</li>
                    <li>Columns: {{ data.metadata.statistics.column_count }}</li>
                </ul>
            </div>
        </div>
        """)
        
        return template.render(
            analysis=analysis,
            visualizations=visualizations,
            data=data
        )

    def _generate_pdf_report(self, analysis: str, visualizations: Dict[str, str], data: Dict[str, Any]) -> str:
        """Generate PDF report with proper configuration"""
        try:
            html_content = self._generate_html_report(analysis, visualizations, data)
            
            # Configure pdfkit with explicit Windows path
            config = pdfkit.configuration(wkhtmltopdf=self.wkhtmltopdf_path)
            
            self.logger.info(f"Using wkhtmltopdf from: {self.wkhtmltopdf_path}")
            
            # Generate PDF with configuration
            pdf_content = pdfkit.from_string(
                html_content, 
                False,  # Don't save to file
                options=self.pdf_options,
                configuration=config
            )
            
            return base64.b64encode(pdf_content).decode()
            
        except Exception as e:
            self.logger.error(f"PDF generation failed: {str(e)}")
            self.logger.error(f"wkhtmltopdf path: {self.wkhtmltopdf_path}")
            raise Exception(f"PDF generation failed: {str(e)}")

    def _generate_docx_report(self, analysis: str, visualizations: Dict[str, str], data: Dict[str, Any]) -> str:
        """Generate DOCX report"""
        doc = Document()
        doc.add_heading('Data Analysis Report', level=1)
        doc.add_heading('Analysis', level=2)
        doc.add_paragraph(analysis)

        # Add visualizations and metadata
        # ...

        # Save to a temporary file and return the path
        temp_path = '/tmp/report.docx'
        doc.save(temp_path)
        return temp_path