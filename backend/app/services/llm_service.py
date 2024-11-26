import pandas as pd
from typing import Dict, Any
import logging
from ..core.cohere_client import get_cohere_client

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.cohere_client = get_cohere_client()

    async def generate_analysis(self, df: pd.DataFrame, query: str) -> str:
        """Generate analysis using LLM"""
        try:
            # Create a prompt with data summary and user query
            prompt = self._create_analysis_prompt(df, query)
            
            # Generate analysis using Cohere
            response = await self.cohere_client.generate(prompt=prompt)
            
            if not response:
                return "Unable to generate analysis."
                
            return response
            
        except Exception as e:
            logger.error(f"LLM analysis generation failed: {str(e)}")
            return f"Analysis generation failed: {str(e)}"

    def _create_analysis_prompt(self, df: pd.DataFrame, query: str) -> str:
        """Create a prompt for the LLM"""
        try:
            # Get basic statistics
            stats = df.describe().to_dict()
            columns = list(df.columns)
            data_types = df.dtypes.to_dict()
            
            # Create the prompt
            prompt = f"""Analyze the following dataset and answer this query: {query}

Data Summary:
- Columns: {', '.join(columns)}
- Rows: {len(df)}
- Data Types: {data_types}

Statistical Summary:
{stats}

Please provide:
1. Key Insights
2. Trends and Patterns
3. Notable Observations
4. Recommendations

Format the response in clear sections with bullet points."""

            return prompt
            
        except Exception as e:
            logger.error(f"Prompt creation failed: {str(e)}")
            return f"Failed to create analysis prompt: {str(e)}" 