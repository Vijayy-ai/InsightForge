import cohere
from ..core.config import get_settings
import asyncio
from typing import Dict, Any

settings = get_settings()

class AsyncCohereClient:
    def __init__(self):
        self.client = cohere.Client(settings.COHERE_API_KEY)
    
    async def generate(self, prompt: str) -> str:
        """Async wrapper for Cohere generate"""
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.generate(
                    prompt=prompt,
                    model='command',
                    max_tokens=1000,
                    temperature=0.7,
                    k=0,
                    stop_sequences=[],
                    return_likelihoods='NONE'
                )
            )
            return response.generations[0].text if response.generations else "No analysis generated."
        except Exception as e:
            print(f"Cohere API error: {str(e)}")
            return "Analysis generation failed. Please try again."

def get_cohere_client():
    return AsyncCohereClient() 