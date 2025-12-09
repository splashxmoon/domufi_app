from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import os
from pathlib import Path

from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class KnowledgeBase:

    def __init__(self):
        self.ready = False
        self.memory_path = Path("memory")
        self.memory_path.mkdir(exist_ok=True)
        self.conversations = {}
        self.learned_patterns = {}
        self.user_preferences = {}

    async def initialize(self):
        logger.info("Initializing knowledge base...")

        try:

            await self._load_memory()
            self.ready = True
            logger.info("✅ Knowledge base initialized")
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {e}", exc_info=True)
            self.ready = True

    async def cleanup(self):
        await self._save_memory()

    def is_ready(self) -> bool:
        return self.ready

    async def _load_memory(self):
        try:
            memory_file = self.memory_path / "knowledge.json"
            if memory_file.exists():
                with open(memory_file, 'r') as f:
                    data = json.load(f)
                    self.conversations = data.get("conversations", {})
                    self.learned_patterns = data.get("patterns", {})
                    self.user_preferences = data.get("preferences", {})
        except Exception as e:
            logger.warning(f"Could not load memory: {e}")

    async def _save_memory(self):
        try:
            memory_file = self.memory_path / "knowledge.json"
            data = {
                "conversations": self.conversations,
                "patterns": self.learned_patterns,
                "preferences": self.user_preferences,
                "last_updated": datetime.utcnow().isoformat()
            }
            with open(memory_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving memory: {e}")

    async def get_conversation_context(self, session_id: str, limit: int = 10) -> List[Dict]:
        conversations = self.conversations.get(session_id, [])
        return conversations[-limit:] if conversations else []

    async def add_to_conversation(self, session_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        if session_id not in self.conversations:
            self.conversations[session_id] = []

        self.conversations[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        })


        if len(self.conversations[session_id]) > settings.max_memory_size:
            self.conversations[session_id] = self.conversations[session_id][-settings.max_memory_size:]

    async def learn_from_interaction(self, interaction: Dict[str, Any]):
        try:

            intent = interaction.get("intent")
            entities = interaction.get("entities", {})


            if intent:
                if intent not in self.learned_patterns:
                    self.learned_patterns[intent] = {"count": 0, "entities": {}}
                self.learned_patterns[intent]["count"] += 1


                for entity_type, entity_value in entities.items():
                    if entity_type not in self.learned_patterns[intent]["entities"]:
                        self.learned_patterns[intent]["entities"][entity_type] = {}
                    if entity_value not in self.learned_patterns[intent]["entities"][entity_type]:
                        self.learned_patterns[intent]["entities"][entity_type][entity_value] = 0
                    self.learned_patterns[intent]["entities"][entity_type][entity_value] += 1


            user_id = interaction.get("user_id")
            if user_id:
                if user_id not in self.user_preferences:
                    self.user_preferences[user_id] = {}


                if intent:
                    if "preferred_intents" not in self.user_preferences[user_id]:
                        self.user_preferences[user_id]["preferred_intents"] = {}
                    if intent not in self.user_preferences[user_id]["preferred_intents"]:
                        self.user_preferences[user_id]["preferred_intents"][intent] = 0
                    self.user_preferences[user_id]["preferred_intents"][intent] += 1


            if len(self.learned_patterns) % 10 == 0:
                await self._save_memory()

        except Exception as e:
            logger.error(f"Error learning from interaction: {e}", exc_info=True)

    async def get_knowledge(self, topic: str) -> Dict[str, Any]:

        return {
            "topic": topic,
            "knowledge": f"Information about {topic}",
            "source": "knowledge_base"
        }

    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        return self.user_preferences.get(user_id, {})
