from llama_index.core import VectorStoreIndex, Document
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from typing import Dict, Any, List
import os

class ReportAgent:
    def __init__(self, llm):
        self.llm = llm
        self.tools = []
        self.agent = None

    def create_index_from_data(self, data: Dict[str, Any]) -> VectorStoreIndex:
        # Convert data to documents
        documents = [
            Document(text=str(record), metadata={"type": data["type"]})
            for record in data["data"]
        ]
        return VectorStoreIndex.from_documents(documents)

    def setup_tools(self, data: Dict[str, Any]):
        # Create index and query engine
        index = self.create_index_from_data(data)
        query_engine = index.as_query_engine()

        # Create tools
        tools = [
            QueryEngineTool(
                query_engine=query_engine,
                metadata=ToolMetadata(
                    name="data_analyzer",
                    description="Analyzes data and provides insights"
                )
            ),
        ]

        # Create agent
        self.agent = ReActAgent.from_tools(tools, llm=self.llm)

    async def generate_report(self, query: str) -> Dict[str, Any]:
        if not self.agent:
            raise ValueError("Agent not initialized. Call setup_tools first.")

        # Generate report using agent
        response = await self.agent.aquery(query)
        return {
            "analysis": str(response),
            "source_nodes": [node.text for node in response.source_nodes]
        } 