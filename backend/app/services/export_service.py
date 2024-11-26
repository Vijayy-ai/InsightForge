from typing import Dict, Any, Optional
import pdfkit
import json
from jinja2 import Template
from pathlib import Path
import logging
from ..schemas.export import ExportOptions
from ..core.exceptions import ExportError

logger = logging.getLogger(__name__)

class ExportService:
    def __init__(self):
        self.template_dir = Path("app/templates")
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)

    async def export_report(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> Dict[str, Any]:
        """Export report in specified format with customizations"""
        try:
            if options.format == 'pdf':
                return await self._export_pdf(report_data, options)
            elif options.format == 'html':
                return await self._export_html(report_data, options)
            else:
                return await self._export_json(report_data, options)
        except Exception as e:
            logger.error(f"Export failed: {str(e)}")
            raise ExportError(f"Failed to export report: {str(e)}")

    async def _export_pdf(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> Dict[str, Any]:
        """Export report as PDF"""
        try:
            # Generate HTML first
            html_content = await self._generate_html(report_data, options)
            
            # Configure PDF options
            pdf_options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
                'custom-header': [
                    ('Accept-Encoding', 'gzip')
                ],
                'no-outline': None,
                'enable-local-file-access': None
            }

            # Add theme-specific options
            if options.customizations:
                if options.customizations.theme == 'dark':
                    pdf_options['--custom-css'] = self._get_dark_theme_css()

            # Generate PDF
            output_path = self.temp_dir / f"report_{report_data['id']}.pdf"
            pdfkit.from_string(html_content, str(output_path), options=pdf_options)
            
            return {
                "file_path": str(output_path),
                "mime_type": "application/pdf"
            }
            
        except Exception as e:
            logger.error(f"PDF export failed: {str(e)}")
            raise ExportError(f"Failed to generate PDF: {str(e)}")

    async def _export_html(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> Dict[str, Any]:
        """Export report as HTML"""
        try:
            html_content = await self._generate_html(report_data, options)
            output_path = self.temp_dir / f"report_{report_data['id']}.html"
            output_path.write_text(html_content)
            
            return {
                "file_path": str(output_path),
                "mime_type": "text/html"
            }
            
        except Exception as e:
            logger.error(f"HTML export failed: {str(e)}")
            raise ExportError(f"Failed to generate HTML: {str(e)}")

    async def _export_json(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> Dict[str, Any]:
        """Export report as JSON"""
        try:
            # Filter data based on options
            filtered_data = self._filter_report_data(report_data, options)
            return {
                "data": filtered_data,
                "mime_type": "application/json"
            }
            
        except Exception as e:
            logger.error(f"JSON export failed: {str(e)}")
            raise ExportError(f"Failed to generate JSON: {str(e)}")

    def _filter_report_data(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> Dict[str, Any]:
        """Filter report data based on export options"""
        filtered_data = report_data.copy()
        
        if not options.includeVisualizations:
            filtered_data.pop('visualizations', None)
            
        if not options.includeTables:
            filtered_data.pop('data_tables', None)
            
        return filtered_data

    def _get_dark_theme_css(self) -> str:
        """Get CSS for dark theme"""
        return """
            body { background-color: #1a1a1a; color: #ffffff; }
            .visualization { background-color: #2d2d2d; }
            table { border-color: #404040; }
            th { background-color: #333333; }
        """

    async def _generate_html(
        self,
        report_data: Dict[str, Any],
        options: ExportOptions
    ) -> str:
        """Generate HTML content for report"""
        template_path = self.template_dir / "report_template.html"
        template = Template(template_path.read_text())
        
        return template.render(
            report=report_data,
            options=options.dict(),
            dark_mode=options.customizations.theme == 'dark' if options.customizations else False
        ) 