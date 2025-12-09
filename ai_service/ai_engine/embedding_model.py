from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from datetime import datetime
import asyncio

from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class AdvancedEmbeddingModel:

    def __init__(self):
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.ready = False
        self.embedding_cache = {}
        self.model_name = settings.embedding_model

    async def initialize(self):
        logger.info(f"Loading embedding model: {self.model_name}")
        try:

            self.model = SentenceTransformer(self.model_name, device=self.device)
            self.ready = True
            logger.info(f"[OK] Embedding model loaded on {self.device}")
        except Exception as e:
            logger.error(f"[ERROR] Error loading embedding model: {e}", exc_info=True)
            raise

    async def cleanup(self):
        self.model = None
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready and self.model is not None

    async def encode(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        if not self.is_ready():
            raise RuntimeError("Embedding model not initialized")


        uncached_texts = []
        uncached_indices = []
        embeddings = [None] * len(texts)

        for i, text in enumerate(texts):
            text_key = text.lower().strip()
            if text_key in self.embedding_cache:
                embeddings[i] = self.embedding_cache[text_key]
            else:
                uncached_texts.append(text)
                uncached_indices.append(i)


        if uncached_texts:
            try:
                new_embeddings = self.model.encode(
                    uncached_texts,
                    batch_size=batch_size,
                    show_progress_bar=False,
                    convert_to_numpy=True,
                    normalize_embeddings=True
                )


                for idx, text in enumerate(uncached_texts):
                    text_key = text.lower().strip()
                    embedding = new_embeddings[idx]
                    self.embedding_cache[text_key] = embedding
                    embeddings[uncached_indices[idx]] = embedding

            except Exception as e:
                logger.error(f"Error encoding texts: {e}", exc_info=True)

                for idx in uncached_indices:
                    embeddings[idx] = np.random.rand(384).astype(np.float32)

        return np.array([emb for emb in embeddings if emb is not None])

    async def similarity(self, text1: str, text2: str) -> float:
        embeddings = await self.encode([text1, text2])
        if len(embeddings) < 2:
            return 0.0


        dot_product = np.dot(embeddings[0], embeddings[1])
        return float(dot_product)

    async def find_most_similar(
        self,
        query: str,
        candidates: List[str],
        top_k: int = 5,
        threshold: float = 0.5
    ) -> List[Tuple[str, float]]:
        if not candidates:
            return []

        query_embedding = await self.encode([query])
        if len(query_embedding) == 0:
            return []

        candidate_embeddings = await self.encode(candidates)


        similarities = np.dot(candidate_embeddings, query_embedding[0])


        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= threshold:
                results.append((candidates[idx], score))

        return results

    async def batch_similarity(
        self,
        queries: List[str],
        candidates: List[str],
        top_k: int = 5
    ) -> List[List[Tuple[str, float]]]:
        query_embeddings = await self.encode(queries)
        candidate_embeddings = await self.encode(candidates)


        similarities = np.dot(candidate_embeddings, query_embeddings.T)

        results = []
        for i, query in enumerate(queries):
            query_sims = similarities[:, i]
            top_indices = np.argsort(query_sims)[::-1][:top_k]
            results.append([
                (candidates[idx], float(query_sims[idx]))
                for idx in top_indices
            ])

        return results

    def get_embedding_dimension(self) -> int:
        if self.model:
            return self.model.get_sentence_embedding_dimension()
        return 384
