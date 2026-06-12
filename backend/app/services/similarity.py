from __future__ import annotations

import math
import os
import re
from collections import Counter


class SimilarityService:
    def __init__(self) -> None:
        self.use_lightweight = (
            os.getenv("USE_LIGHTWEIGHT_SIMILARITY", "false").lower() == "true"
        )

        self.model = None

        if not self.use_lightweight:
            try:
                from sentence_transformers import SentenceTransformer

                self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            except Exception:
                self.use_lightweight = True
                self.model = None

    def cosine_similarity(self, text_a: str, text_b: str) -> float:
        if not text_a or not text_b:
            return 0.0

        if self.model is not None and not self.use_lightweight:
            embeddings = self.model.encode([text_a, text_b], normalize_embeddings=True)
            return float((embeddings[0] * embeddings[1]).sum())

        return self._lightweight_similarity(text_a, text_b)

    def _lightweight_similarity(self, text_a: str, text_b: str) -> float:
        tokens_a = self._tokenize(text_a)
        tokens_b = self._tokenize(text_b)

        if not tokens_a or not tokens_b:
            return 0.0

        counter_a = Counter(tokens_a)
        counter_b = Counter(tokens_b)

        common_tokens = set(counter_a) & set(counter_b)

        dot_product = sum(counter_a[token] * counter_b[token] for token in common_tokens)
        norm_a = math.sqrt(sum(value * value for value in counter_a.values()))
        norm_b = math.sqrt(sum(value * value for value in counter_b.values()))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        score = dot_product / (norm_a * norm_b)
        return max(0.0, min(1.0, score))

    def _tokenize(self, text: str) -> list[str]:
        text = text.lower()
        return re.findall(r"[a-zA-Z0-9+#.]+", text)