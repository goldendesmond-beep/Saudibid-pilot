import math
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.models.schemas import DocumentChunk

class ChromaVectorStore:
    """Production ChromaDB Vector Store Abstraction for Tender RAG & Semantic Retrieval."""

    def __init__(self, persist_directory: str = settings.CHROMA_PERSIST_DIR):
        self.persist_directory = persist_directory
        self._connected = False
        self._memory_chunks: Dict[str, DocumentChunk] = {}

    def connect(self) -> bool:
        """Connect to persistent ChromaDB client if chromadb package is available."""
        try:
            import chromadb
            self._client = chromadb.PersistentClient(path=self.persist_directory)
            self._collection = self._client.get_or_create_collection(
                name="tender_documents",
                metadata={"description": "Saudi Tender Dossiers and Clause Chunks"}
            )
            self._connected = True
            return True
        except Exception:
            self._connected = False
            return False

    def is_connected(self) -> bool:
        return self._connected

    def add_chunks(self, tender_id: str, chunks: List[DocumentChunk]) -> int:
        """Index tender specification chunks into ChromaDB."""
        if self._connected:
            ids = [c.id for c in chunks]
            documents = [c.content for c in chunks]
            metadatas = [{
                "tender_id": tender_id,
                "locator": c.locator,
                "chunk_index": c.chunk_index,
            } for c in chunks]
            self._collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

        for c in chunks:
            self._memory_chunks[c.id] = c
        return len(chunks)

    def query_semantic(self, query_text: str, top_k: int = 5, tender_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query semantic chunks with relevance scoring."""
        if self._connected:
            where_filter = {"tender_id": tender_id} if tender_id else None
            results = self._collection.query(
                query_texts=[query_text],
                n_results=top_k,
                where=where_filter
            )
            output = []
            if results and results.get("ids"):
                for idx, cid in enumerate(results["ids"][0]):
                    doc = results["documents"][0][idx] if results.get("documents") else ""
                    meta = results["metadatas"][0][idx] if results.get("metadatas") else {}
                    distance = results["distances"][0][idx] if results.get("distances") else 0.5
                    score = max(0.0, min(1.0, 1.0 - distance))
                    output.append({
                        "id": cid,
                        "content": doc,
                        "locator": meta.get("locator", ""),
                        "score": round(score, 2),
                    })
            return output

        # Deterministic token similarity fallback
        query_tokens = set(query_text.lower().split())
        scored: List[tuple[float, DocumentChunk]] = []

        for c in self._memory_chunks.values():
            if tender_id and c.tender_id != tender_id:
                continue
            chunk_tokens = set(c.content.lower().split())
            if not chunk_tokens:
                continue
            overlap = len(query_tokens.intersection(chunk_tokens))
            score = overlap / math.sqrt(len(query_tokens) * len(chunk_tokens) + 1e-5)
            scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "id": c.id,
                "content": c.content,
                "locator": c.locator,
                "score": round(min(1.0, s * 2), 2),
            }
            for s, c in scored[:top_k]
        ]

# Shared singleton
chroma_store = ChromaVectorStore()
