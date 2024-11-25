import cohere
from .config import get_settings
import asyncio
from typing import Dict, Any

settings = get_settings()

class AsyncCohereClient:
    def __init__(self):
        self.client = cohere.Client(settings.COHERE_API_KEY)
    
    async def generate(self, **kwargs) -> Dict[str, Any]:
        """Async wrapper for Cohere generate"""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, 
            lambda: self.client.generate(**kwargs)
        )
        return response

def get_cohere_client():
    return AsyncCohereClient() 