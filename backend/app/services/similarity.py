from __future__ import annotations

from sentence_transformers import SentenceTransformer, util


class SimilarityService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self.model = SentenceTransformer(model_name)

    def cosine_similarity(self, text_a: str, text_b: str) -> float:
        embedding_a = self.model.encode(text_a, convert_to_tensor=True)
        embedding_b = self.model.encode(text_b, convert_to_tensor=True)
        similarity = util.cos_sim(embedding_a, embedding_b).item()
        return max(0.0, min(1.0, float(similarity)))
