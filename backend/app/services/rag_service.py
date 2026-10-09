"""
StudyMate AI - RAG Service
Handles retrieval-augmented generation with source grounding
"""
import os
import json
import numpy as np
from typing import List, Dict, Optional, Tuple
import hashlib


class RAGService:
    """RAG service with demo fallback when OpenAI is unavailable."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.has_api = bool(self.api_key and self.api_key.strip())
        self.client = None
        if self.has_api:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except Exception:
                self.has_api = False

        # In-memory vector store for demo
        self.vectors: Dict[str, np.ndarray] = {}
        self.chunks: Dict[str, dict] = {}

    def _simple_embedding(self, text: str) -> np.ndarray:
        """Create a simple deterministic embedding for demo mode using character-level hashing."""
        # Use a simple but somewhat meaningful embedding:
        # Compute word-level features
        words = text.lower().split()
        vec = np.zeros(128)
        for i, word in enumerate(words):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16)
            for j in range(128):
                vec[j] += ((h >> (j % 64)) & 1) * (1.0 / (1 + i * 0.1))
        # Normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    async def get_embedding(self, text: str) -> np.ndarray:
        """Get embedding vector for text."""
        if self.has_api and self.client:
            try:
                model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
                response = self.client.embeddings.create(input=text, model=model)
                return np.array(response.data[0].embedding)
            except Exception:
                pass
        return self._simple_embedding(text)

    def index_chunk(self, chunk_id: str, chunk_data: dict, embedding: np.ndarray):
        """Index a chunk with its embedding."""
        self.vectors[chunk_id] = embedding
        self.chunks[chunk_id] = chunk_data

    async def retrieve(self, query: str, course_id: str, top_k: int = 5,
                       topic_filter: Optional[str] = None) -> List[dict]:
        """Retrieve most relevant chunks for a query."""
        query_vec = await self.get_embedding(query)

        scores = []
        for chunk_id, vec in self.vectors.items():
            chunk = self.chunks[chunk_id]
            if chunk.get("course_id") != course_id:
                continue
            if topic_filter and chunk.get("topic") != topic_filter:
                continue

            # Cosine similarity
            sim = np.dot(query_vec, vec) / (np.linalg.norm(query_vec) * np.linalg.norm(vec) + 1e-8)

            # Boost for keyword matches
            query_words = set(query.lower().split())
            content_words = set(chunk.get("content", "").lower().split())
            keyword_overlap = len(query_words & content_words) / (len(query_words) + 1)
            sim += keyword_overlap * 0.3

            scores.append((chunk_id, sim, chunk))

        scores.sort(key=lambda x: x[1], reverse=True)
        return [s[2] for s in scores[:top_k]]

    async def generate_answer(self, query: str, context_chunks: List[dict],
                              language: str = "en") -> dict:
        """Generate a source-grounded answer."""
        if not context_chunks:
            return {
                "answer": "I couldn't find enough information about this topic in your uploaded course material.",
                "is_grounded": False,
                "citations": [],
                "suggest_outside": True
            }

        # Build context with source info
        context_parts = []
        citations = []
        for i, chunk in enumerate(context_chunks):
            source_info = self._format_source(chunk)
            context_parts.append(f"[Source {i+1}: {source_info}]\n{chunk['content']}")
            citations.append({
                "index": i + 1,
                "source_type": chunk.get("source_type", "unknown"),
                "source_name": chunk.get("source_name", "Unknown"),
                "page_number": chunk.get("page_number"),
                "slide_number": chunk.get("slide_number"),
                "timestamp_start": chunk.get("video_timestamp_start") or chunk.get("timestamp_start"),
                "timestamp_end": chunk.get("video_timestamp_end") or chunk.get("timestamp_end"),
                "topic": chunk.get("topic"),
                "content_preview": chunk["content"][:100] + "..."
            })

        context_text = "\n\n".join(context_parts)

        if self.has_api and self.client:
            answer = await self._llm_answer(query, context_text, citations, language)
        else:
            answer = self._demo_answer(query, context_chunks, citations, language)

        return answer

    async def _llm_answer(self, query: str, context: str, citations: list, language: str) -> dict:
        """Generate answer using OpenAI API."""
        lang_instruction = ""
        if language != "en":
            lang_map = {"ta": "Tamil", "hi": "Hindi"}
            lang_instruction = f"\nRespond in {lang_map.get(language, 'English')}. Keep citations in English."

        try:
            model = os.getenv("LLM_MODEL", "gpt-4o-mini")
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are StudyMate AI, an academic tutor. Answer the student's question using ONLY the provided course material. If the material doesn't contain enough information, say so clearly.

Rules:
1. Use ONLY information from the provided sources
2. Reference sources using [Source N] notation
3. Be concise but thorough
4. If the question cannot be answered from the material, state: "I couldn't find enough information about this topic in your uploaded course material."
{lang_instruction}"""
                    },
                    {
                        "role": "user",
                        "content": f"Course Material:\n{context}\n\nQuestion: {query}"
                    }
                ],
                temperature=0.3,
                max_tokens=800
            )
            answer_text = response.choices[0].message.content
            is_grounded = "couldn't find enough" not in answer_text.lower()
            return {
                "answer": answer_text,
                "is_grounded": is_grounded,
                "citations": citations if is_grounded else [],
                "suggest_outside": not is_grounded
            }
        except Exception as e:
            return self._demo_answer(query, [], citations, language)

    def _demo_answer(self, query: str, chunks: List[dict], citations: list, language: str) -> dict:
        """Generate a demo answer from chunk content directly."""
        if not chunks:
            return {
                "answer": "I couldn't find enough information about this topic in your uploaded course material.",
                "is_grounded": False,
                "citations": [],
                "suggest_outside": True
            }

        # Build answer from most relevant chunks
        query_lower = query.lower()
        answer_parts = []

        for chunk in chunks[:3]:
            content = chunk.get("content", "")
            if len(content) > 50:
                answer_parts.append(content)

        if answer_parts:
            combined = " ".join(answer_parts)
            # Trim to reasonable length
            if len(combined) > 1200:
                combined = combined[:1200] + "..."

            # Add source references
            source_refs = []
            for c in citations[:3]:
                source_refs.append(f"[{c['source_name']} — {self._format_citation_label(c)}]")

            answer = f"{combined}\n\n**Sources:** {', '.join(source_refs)}"

            return {
                "answer": answer,
                "is_grounded": True,
                "citations": citations,
                "suggest_outside": False
            }

        return {
            "answer": "I couldn't find enough information about this topic in your uploaded course material.",
            "is_grounded": False,
            "citations": [],
            "suggest_outside": True
        }

    def _format_source(self, chunk: dict) -> str:
        st = chunk.get("source_type", "")
        name = chunk.get("source_name", "Unknown")
        if st == "pdf":
            return f"{name}, Page {chunk.get('page_number', '?')}"
        elif st == "pptx":
            return f"{name}, Slide {chunk.get('slide_number', '?')}"
        elif st == "video":
            return f"{name}, {chunk.get('video_timestamp_start') or chunk.get('timestamp_start', '?')}"
        return name

    def _format_citation_label(self, citation: dict) -> str:
        st = citation.get("source_type", "")
        if st == "pdf":
            return f"Page {citation.get('page_number', '?')}"
        elif st == "pptx":
            return f"Slide {citation.get('slide_number', '?')}"
        elif st == "video":
            return f"{citation.get('timestamp_start', '?')}"
        return "Source"


# Singleton
rag_service = RAGService()
