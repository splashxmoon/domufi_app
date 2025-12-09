from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import json
import pickle
from pathlib import Path
from datetime import datetime
import asyncio

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("Warning: FAISS not available. Using simple in-memory vector store.")

from ai_engine.embedding_model import AdvancedEmbeddingModel
from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class SimpleVectorStore:

    def __init__(self, embedding_model: AdvancedEmbeddingModel):
        self.embedding_model = embedding_model
        self.vectors = []
        self.metadata = []
        self.dimension = 384
        self.ready = False
        self.storage_path = Path("memory/vector_store")
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def initialize(self):
        logger.info("Initializing simple vector store (FAISS not available)...")
        self.dimension = self.embedding_model.get_embedding_dimension()
        await self._load_from_disk()
        self.ready = True
        logger.info(f"Simple vector store initialized with {len(self.vectors)} vectors")

    async def cleanup(self):
        await self._save_to_disk()
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    async def add(self, text: str, metadata: Dict[str, Any], embedding: Optional[np.ndarray] = None) -> int:
        if embedding is None:
            embeddings = await self.embedding_model.encode([text])
            embedding = embeddings[0]

        embedding = embedding.astype('float32')
        self.vectors.append(embedding)

        metadata_entry = {
            "id": len(self.vectors) - 1,
            "text": text,
            "timestamp": datetime.utcnow().isoformat(),
            **metadata
        }
        self.metadata.append(metadata_entry)


        if len(self.vectors) % 10 == 0:
            await self._save_to_disk()

        return len(self.vectors) - 1

    async def search(self, query: str, top_k: int = 10, filter_metadata: Optional[Dict[str, Any]] = None, threshold: float = 0.5) -> List[Dict[str, Any]]:
        if not self.vectors:
            return []

        query_embedding = await self.embedding_model.encode([query])
        if len(query_embedding) == 0:
            return []

        query_vec = query_embedding[0]
        query_norm = np.linalg.norm(query_vec)


        similarities = []
        for i, vec in enumerate(self.vectors):
            vec_norm = np.linalg.norm(vec)
            if vec_norm > 0 and query_norm > 0:
                similarity = float(np.dot(query_vec, vec) / (query_norm * vec_norm))
                if similarity >= threshold:
                    similarities.append((i, similarity))


        similarities.sort(key=lambda x: x[1], reverse=True)


        results = []
        for idx, similarity in similarities[:top_k]:
            metadata_entry = self.metadata[idx].copy()
            metadata_entry["similarity"] = similarity

            if filter_metadata:
                match = all(metadata_entry.get(key) == value for key, value in filter_metadata.items())
                if not match:
                    continue

            results.append(metadata_entry)

        return results

    async def get_by_intent(self, intent: str, top_k: int = 10) -> List[Dict[str, Any]]:
        results = [entry for entry in self.metadata if entry.get("intent") == intent]
        return results[:top_k]

    async def learn_pattern(self, user_message: str, intent: str, entities: Dict[str, Any], response: str, confidence: float):
        await self.add(text=user_message, metadata={"type": "user_pattern", "intent": intent, "entities": json.dumps(entities), "confidence": confidence, "learned_at": datetime.utcnow().isoformat()})
        await self.add(text=response, metadata={"type": "response_pattern", "intent": intent, "entities": json.dumps(entities), "confidence": confidence, "learned_at": datetime.utcnow().isoformat()})

    async def update_metadata(self, vector_id: int, updates: Dict[str, Any]):
        if 0 <= vector_id < len(self.metadata):
            self.metadata[vector_id].update(updates)
            await self._save_to_disk()

    async def _save_to_disk(self):
        try:
            data_path = self.storage_path / "simple_store.pkl"
            with open(data_path, 'wb') as f:
                pickle.dump({"vectors": self.vectors, "metadata": self.metadata}, f)
        except Exception as e:
            logger.error(f"Error saving simple vector store: {e}")

    async def _load_from_disk(self):
        try:
            data_path = self.storage_path / "simple_store.pkl"
            if data_path.exists():
                with open(data_path, 'rb') as f:
                    data = pickle.load(f)
                    self.vectors = data.get("vectors", [])
                    self.metadata = data.get("metadata", [])
                logger.info(f"Loaded simple vector store: {len(self.vectors)} vectors")
        except Exception as e:
            logger.warning(f"Error loading simple vector store: {e}, starting fresh")
            self.vectors = []
            self.metadata = []


class VectorStore:

    def __init__(self, embedding_model: AdvancedEmbeddingModel):
        self.embedding_model = embedding_model
        self.index = None
        self.simple_store = None
        self.metadata = []
        self.dimension = 384
        self.ready = False
        self.storage_path = Path("memory/vector_store")
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def initialize(self):
        logger.info("Initializing vector store...")

        try:

            self.dimension = self.embedding_model.get_embedding_dimension()

            if FAISS_AVAILABLE:

                self.index = faiss.IndexFlatIP(self.dimension)


                await self._load_from_disk()

                self.ready = True
                logger.info(f"Vector store initialized with {self.index.ntotal} vectors")
            else:

                logger.warning("FAISS not available, using simple vector store")
                self.simple_store = SimpleVectorStore(self.embedding_model)
                await self.simple_store.initialize()
                self.ready = True
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}", exc_info=True)

            if FAISS_AVAILABLE:
                logger.warning("Falling back to simple vector store")
                self.simple_store = SimpleVectorStore(self.embedding_model)
                await self.simple_store.initialize()
                self.ready = True
            else:
                raise

    async def cleanup(self):
        await self._save_to_disk()
        self.ready = False

    def is_ready(self) -> bool:
        if self.simple_store:
            return self.simple_store.is_ready()
        return self.ready and self.index is not None

    async def add(
        self,
        text: str,
        metadata: Dict[str, Any],
        embedding: Optional[np.ndarray] = None
    ) -> int:
        if self.simple_store:
            return await self.simple_store.add(text, metadata, embedding)

        if not self.is_ready():
            raise RuntimeError("Vector store not initialized")


        if embedding is None:
            embeddings = await self.embedding_model.encode([text])
            embedding = embeddings[0]


        embedding = embedding.reshape(1, -1).astype('float32')


        faiss.normalize_L2(embedding)


        vector_id = self.index.ntotal
        self.index.add(embedding)


        metadata_entry = {
            "id": vector_id,
            "text": text,
            "timestamp": datetime.utcnow().isoformat(),
            **metadata
        }
        self.metadata.append(metadata_entry)


        if vector_id % 10 == 0:
            await self._save_to_disk()

        return vector_id

    async def search(
        self,
        query: str,
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None,
        threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        if self.simple_store:
            return await self.simple_store.search(query, top_k, filter_metadata, threshold)

        if not self.is_ready() or self.index.ntotal == 0:
            return []


        query_embedding = await self.embedding_model.encode([query])
        if len(query_embedding) == 0:
            return []

        query_embedding = query_embedding[0].reshape(1, -1).astype('float32')
        faiss.normalize_L2(query_embedding)


        similarities, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))

        results = []
        for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
            if idx == -1 or similarity < threshold:
                continue

            metadata_entry = self.metadata[idx].copy()
            metadata_entry["similarity"] = float(similarity)


            if filter_metadata:
                match = all(
                    metadata_entry.get(key) == value
                    for key, value in filter_metadata.items()
                )
                if not match:
                    continue

            results.append(metadata_entry)

        return results

    async def update_metadata(self, vector_id: int, updates: Dict[str, Any]):
        if self.simple_store:
            return await self.simple_store.update_metadata(vector_id, updates)

        if 0 <= vector_id < len(self.metadata):
            self.metadata[vector_id].update(updates)
            await self._save_to_disk()

    async def get_by_intent(
        self,
        intent: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        if self.simple_store:
            return await self.simple_store.get_by_intent(intent, top_k)

        results = [
            entry for entry in self.metadata
            if entry.get("intent") == intent
        ]
        return results[:top_k]

    async def learn_pattern(
        self,
        user_message: str,
        intent: str,
        entities: Dict[str, Any],
        response: str,
        confidence: float
    ):
        if self.simple_store:
            return await self.simple_store.learn_pattern(user_message, intent, entities, response, confidence)


        await self.add(
            text=user_message,
            metadata={
                "type": "user_pattern",
                "intent": intent,
                "entities": json.dumps(entities),
                "confidence": confidence,
                "learned_at": datetime.utcnow().isoformat()
            }
        )


        await self.add(
            text=response,
            metadata={
                "type": "response_pattern",
                "intent": intent,
                "entities": json.dumps(entities),
                "confidence": confidence,
                "learned_at": datetime.utcnow().isoformat()
            }
        )

    async def _save_to_disk(self):
        if self.simple_store:
            return await self.simple_store._save_to_disk()

        if not FAISS_AVAILABLE or self.index is None:
            return

        try:

            index_path = self.storage_path / "index.faiss"
            faiss.write_index(self.index, str(index_path))


            metadata_path = self.storage_path / "metadata.pkl"
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)

            logger.debug(f"Saved vector store: {self.index.ntotal} vectors")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}", exc_info=True)

    async def _load_from_disk(self):
        if not FAISS_AVAILABLE:
            return

        try:
            index_path = self.storage_path / "index.faiss"
            metadata_path = self.storage_path / "metadata.pkl"

            if index_path.exists() and metadata_path.exists():

                self.index = faiss.read_index(str(index_path))


                with open(metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)

                logger.info(f"Loaded vector store: {self.index.ntotal} vectors")
            else:
                logger.info("No existing vector store found, starting fresh")
        except Exception as e:
            logger.warning(f"Error loading vector store: {e}, starting fresh")
            self.index = faiss.IndexFlatIP(self.dimension)
            self.metadata = []
