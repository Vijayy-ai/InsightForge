import os
from typing import Dict, Any, List, Optional
import pandas as pd
import logging
from datetime import datetime
from ..utils.visualization import VisualizationService
from llama_index.core import ServiceContext
from llama_index.llms.cohere import Cohere

logger = logging.getLogger(__name__)

class ReportAgent:
    def __init__(self):
        self.llm = Cohere(
            api_key=os.getenv("COHERE_API_KEY"),
            model="command-nightly"
        )
        self.service_context = ServiceContext.from_defaults(llm=self.llm)
        self.viz_service = VisualizationService()
        self.data_frame = None
        self.analysis_agent = None 