"""
StudyMate AI - Assessment Service
Handles quiz generation, verification, and scoring
"""
import os
import json
import random
import uuid
import hashlib
from typing import List, Dict, Optional
from datetime import datetime, timezone


class AssessmentService:
    """Assessment generation with verification pipeline."""

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
        self.generated_question_hashes = set()

    def _question_hash(self, question_text: str) -> str:
        return hashlib.md5(question_text.lower().strip().encode()).hexdigest()

    def _is_duplicate(self, question_text: str) -> bool:
        h = self._question_hash(question_text)
        if h in self.generated_question_hashes:
            return True
        self.generated_question_hashes.add(h)
        return False

    async def generate_questions(self, chunks: List[dict], topics: List[str],
                                  difficulty: str, count: int,
                                  question_types: List[str]) -> List[dict]:
        """Generate assessment questions from source material."""
        if self.has_api and self.client:
            return await self._llm_generate(chunks, topics, difficulty, count, question_types)
        return self._demo_generate(chunks, topics, difficulty, count, question_types)

    async def _llm_generate(self, chunks, topics, difficulty, count, question_types) -> List[dict]:
        """Generate questions using OpenAI."""
        context = "\n\n".join([
            f"[{c.get('source_name', 'Source')}, {c.get('topic', 'General')}]: {c['content']}"
            for c in chunks[:10]
        ])

        types_str = ", ".join(question_types)
        try:
            model = os.getenv("LLM_MODEL", "gpt-4o-mini")
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": f"""Generate exactly {count} quiz questions from the provided course material.
Topics: {', '.join(topics)}
Difficulty: {difficulty}
Question types allowed: {types_str}

Return JSON array. Each question object:
{{
  "question_text": "...",
  "question_type": "mcq|short_answer|numerical",
  "options": ["A", "B", "C", "D"] (for MCQ only, null otherwise),
  "correct_answer": "...",
  "explanation": "...",
  "topic": "...",
  "subtopic": "...",
  "difficulty": "{difficulty}",
  "source_citation": "source description"
}}

Rules:
- Questions must be answerable from the material
- MCQ must have exactly one correct answer
- Explanations must reference the source material
- Vary question difficulty slightly around the target"""
                    },
                    {"role": "user", "content": f"Course Material:\n{context}"}
                ],
                temperature=0.7,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            questions = result.get("questions", result.get("quiz", []))
            if isinstance(questions, list):
                # Filter duplicates
                unique = []
                for q in questions:
                    if not self._is_duplicate(q.get("question_text", "")):
                        q["id"] = str(uuid.uuid4())
                        unique.append(q)
                return unique[:count]
        except Exception:
            pass
        return self._demo_generate(chunks, topics, difficulty, count, question_types)

    def _demo_generate(self, chunks, topics, difficulty, count, question_types) -> List[dict]:
        """Generate demo questions from built-in question bank."""
        questions = []
        bank = self._get_question_bank()

        # Filter by topic
        available = [q for q in bank if q["topic"] in topics]
        if not available:
            available = bank

        # Filter by difficulty (loosely)
        diff_map = {"easy": 1, "medium": 2, "hard": 3, "adaptive": 2}
        target_diff = diff_map.get(difficulty, 2)

        # Filter by type
        if question_types:
            typed = [q for q in available if q["question_type"] in question_types]
            if typed:
                available = typed

        random.shuffle(available)

        for q in available[:count]:
            if not self._is_duplicate(q["question_text"]):
                q["id"] = str(uuid.uuid4())
                questions.append(q)

        # If we need more questions, generate variations
        while len(questions) < count and available:
            base = random.choice(available)
            variant = dict(base)
            variant["id"] = str(uuid.uuid4())
            variant["question_text"] = base["question_text"].replace(".", "?").rstrip("?") + "?"
            if not self._is_duplicate(variant["question_text"]):
                questions.append(variant)

        return questions[:count]

    def verify_question(self, question: dict, chunks: List[dict]) -> dict:
        """Verify a question against source material."""
        # Check if answer is supported by chunks
        answer_text = question.get("correct_answer", "").lower()
        supported = False
        for chunk in chunks:
            content = chunk.get("content", "").lower()
            # Simple keyword check
            answer_words = answer_text.split()
            matching = sum(1 for w in answer_words if w in content)
            if matching > len(answer_words) * 0.3:
                supported = True
                break

        # Check MCQ validity
        valid_mcq = True
        if question.get("question_type") == "mcq":
            options = question.get("options", [])
            if len(options) < 2:
                valid_mcq = False

        return {
            "supported_by_source": supported,
            "valid_format": valid_mcq,
            "quality_score": 0.8 if supported and valid_mcq else 0.4,
            "passed": supported and valid_mcq
        }

    def score_answer(self, question: dict, user_answer: str) -> dict:
        """Score a student's answer."""
        correct_answer = question.get("correct_answer", "")
        q_type = question.get("question_type", "mcq")

        if q_type == "mcq":
            is_correct = user_answer.strip().upper() == correct_answer.strip().upper()
        elif q_type == "numerical":
            try:
                is_correct = abs(float(user_answer) - float(correct_answer)) < 0.01
            except (ValueError, TypeError):
                is_correct = False
        else:
            # Short answer - keyword matching
            user_words = set(user_answer.lower().split())
            correct_words = set(correct_answer.lower().split())
            # Remove common words
            stop_words = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or"}
            user_words -= stop_words
            correct_words -= stop_words
            if correct_words:
                overlap = len(user_words & correct_words) / len(correct_words)
                is_correct = overlap >= 0.5
            else:
                is_correct = False

        return {
            "is_correct": is_correct,
            "correct_answer": correct_answer,
            "explanation": question.get("explanation", ""),
            "source_citation": question.get("source_citation", ""),
            "topic": question.get("topic", ""),
        }

    def _get_question_bank(self) -> List[dict]:
        """Built-in question bank for demo mode."""
        return [
            {
                "question_text": "Which of the following is NOT a state in the process state diagram?",
                "question_type": "mcq",
                "options": ["Ready", "Running", "Sleeping", "Waiting"],
                "correct_answer": "Sleeping",
                "explanation": "The five process states are: New, Ready, Running, Waiting, and Terminated. 'Sleeping' is not a standard process state in the process state diagram.",
                "topic": "Process Management",
                "subtopic": "Process States",
                "difficulty": "easy",
                "source_citation": "Operating Systems Textbook — Page 48",
                "source_type": "pdf",
                "source_location": "page:48"
            },
            {
                "question_text": "What information is stored in a Process Control Block (PCB)?",
                "question_type": "short_answer",
                "options": None,
                "correct_answer": "Process state, program counter, CPU registers, CPU scheduling information, memory management information, accounting information, and I/O status information",
                "explanation": "The PCB contains all the information needed to start or restart a process, including its state, program counter, registers, scheduling info, memory info, accounting data, and I/O status.",
                "topic": "Process Management",
                "subtopic": "Process Control Block",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 51",
                "source_type": "pdf",
                "source_location": "page:51"
            },
            {
                "question_text": "What is the main overhead of context switching?",
                "question_type": "mcq",
                "options": [
                    "Memory allocation",
                    "The system does no useful work during the switch",
                    "Network latency",
                    "Disk I/O"
                ],
                "correct_answer": "The system does no useful work during the switch",
                "explanation": "Context-switch time is pure overhead because the system does no useful work while switching. The time is spent saving and restoring process states.",
                "topic": "Process Management",
                "subtopic": "Context Switching",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 67",
                "source_type": "pdf",
                "source_location": "page:67"
            },
            {
                "question_text": "Which of the following is shared between threads of the same process?",
                "question_type": "mcq",
                "options": [
                    "Stack",
                    "Program counter",
                    "Code section and data section",
                    "Register set"
                ],
                "correct_answer": "Code section and data section",
                "explanation": "Threads share code section, data section, and OS resources (like open files). Each thread has its own stack, program counter, and register set.",
                "topic": "Threads",
                "subtopic": "Thread Concept",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 85",
                "source_type": "pdf",
                "source_location": "page:85"
            },
            {
                "question_text": "What are the three requirements for a solution to the critical-section problem?",
                "question_type": "short_answer",
                "options": None,
                "correct_answer": "Mutual Exclusion, Progress, and Bounded Waiting",
                "explanation": "A solution to the critical-section problem must satisfy: Mutual Exclusion (only one process in CS at a time), Progress (selection cannot be postponed indefinitely), and Bounded Waiting (a bound on waiting).",
                "topic": "Synchronization",
                "subtopic": "Critical Section Problem",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 120",
                "source_type": "pdf",
                "source_location": "page:120"
            },
            {
                "question_text": "A binary semaphore can have values in the range:",
                "question_type": "mcq",
                "options": ["0 and 1", "0 to N", "-1 to 1", "Any integer"],
                "correct_answer": "0 and 1",
                "explanation": "A binary semaphore (mutex lock) can only have values 0 or 1. A counting semaphore can range over an unrestricted integer domain.",
                "topic": "Synchronization",
                "subtopic": "Semaphores",
                "difficulty": "easy",
                "source_citation": "Operating Systems Textbook — Page 128",
                "source_type": "pdf",
                "source_location": "page:128"
            },
            {
                "question_text": "Which of the following is a necessary condition for deadlock?",
                "question_type": "mcq",
                "options": [
                    "Starvation",
                    "Circular Wait",
                    "Priority Inversion",
                    "Aging"
                ],
                "correct_answer": "Circular Wait",
                "explanation": "The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. All four must hold simultaneously.",
                "topic": "Deadlocks",
                "subtopic": "Necessary Conditions",
                "difficulty": "easy",
                "source_citation": "Operating Systems Textbook — Page 142",
                "source_type": "pdf",
                "source_location": "page:142"
            },
            {
                "question_text": "In the Banker's Algorithm, what does the Need matrix represent?",
                "question_type": "mcq",
                "options": [
                    "Currently allocated resources",
                    "Maximum possible allocation",
                    "Remaining resource need (Max - Allocation)",
                    "Available resources in the system"
                ],
                "correct_answer": "Remaining resource need (Max - Allocation)",
                "explanation": "In the Banker's Algorithm, Need[i][j] = Max[i][j] - Allocation[i][j], representing the remaining resources each process may need to complete.",
                "topic": "Deadlocks",
                "subtopic": "Banker's Algorithm",
                "difficulty": "hard",
                "source_citation": "Operating Systems Textbook — Page 155",
                "source_type": "pdf",
                "source_location": "page:155"
            },
            {
                "question_text": "What is the difference between deadlock prevention and deadlock avoidance?",
                "question_type": "short_answer",
                "options": None,
                "correct_answer": "Prevention ensures one of four necessary conditions never holds. Avoidance allows all conditions but makes careful allocation decisions to stay in safe states.",
                "explanation": "Prevention is restrictive and reduces utilization by ensuring at least one condition cannot hold. Avoidance requires knowledge of future requests and dynamically checks for safe states before granting resources.",
                "topic": "Deadlocks",
                "subtopic": "Handling Strategies",
                "difficulty": "hard",
                "source_citation": "OS Lecture Slides — Slide 45",
                "source_type": "pptx",
                "source_location": "slide:45"
            },
            {
                "question_text": "A Resource Allocation Graph without cycles indicates:",
                "question_type": "mcq",
                "options": [
                    "Deadlock exists",
                    "Deadlock may exist",
                    "No deadlock exists",
                    "Cannot determine"
                ],
                "correct_answer": "No deadlock exists",
                "explanation": "If a Resource Allocation Graph contains no cycles, then no process is deadlocked. If there is a cycle, deadlock may exist (but not necessarily).",
                "topic": "Deadlocks",
                "subtopic": "Resource Allocation Graph",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 146",
                "source_type": "pdf",
                "source_location": "page:146"
            },
            {
                "question_text": "What is a page fault?",
                "question_type": "short_answer",
                "options": None,
                "correct_answer": "A page fault occurs when a process accesses a page that is not currently in memory, triggering the operating system to load the page from disk.",
                "explanation": "In demand paging, pages are loaded only when needed. When a process tries to access a page not in physical memory, a page fault interrupt occurs, and the OS fetches the page from secondary storage.",
                "topic": "Memory Management",
                "subtopic": "Virtual Memory",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 195",
                "source_type": "pdf",
                "source_location": "page:195"
            },
            {
                "question_text": "Which page replacement algorithm is optimal but impractical?",
                "question_type": "mcq",
                "options": ["FIFO", "LRU", "Optimal (OPT)", "Clock"],
                "correct_answer": "Optimal (OPT)",
                "explanation": "The Optimal algorithm replaces the page that will not be used for the longest time in the future. It's theoretical because it requires future knowledge of page references.",
                "topic": "Memory Management",
                "subtopic": "Page Replacement",
                "difficulty": "medium",
                "source_citation": "Operating Systems Textbook — Page 205",
                "source_type": "pdf",
                "source_location": "page:205"
            },
            {
                "question_text": "In paging, logical memory is divided into fixed-size units called:",
                "question_type": "mcq",
                "options": ["Segments", "Frames", "Pages", "Blocks"],
                "correct_answer": "Pages",
                "explanation": "Paging divides physical memory into frames and logical memory into pages of the same size. A page table maps logical pages to physical frames.",
                "topic": "Memory Management",
                "subtopic": "Paging",
                "difficulty": "easy",
                "source_citation": "Operating Systems Textbook — Page 180",
                "source_type": "pdf",
                "source_location": "page:180"
            },
            {
                "question_text": "What mechanism does a monitor use for synchronization beyond mutual exclusion?",
                "question_type": "mcq",
                "options": [
                    "Spinlocks",
                    "Condition variables",
                    "Busy waiting",
                    "Priority queues"
                ],
                "correct_answer": "Condition variables",
                "explanation": "A monitor provides mutual exclusion automatically. For additional synchronization, it uses condition variables with wait() and signal() operations.",
                "topic": "Synchronization",
                "subtopic": "Monitors",
                "difficulty": "hard",
                "source_citation": "Operating Systems Textbook — Page 135",
                "source_type": "pdf",
                "source_location": "page:135"
            },
            {
                "question_text": "How many processes can be in the 'Running' state on a single-core processor at any instant?",
                "question_type": "numerical",
                "options": None,
                "correct_answer": "1",
                "explanation": "Only one process can be running on any processor core at any instant. Multiple processes can be ready or waiting, but only one executes at a time on a single core.",
                "topic": "Process Management",
                "subtopic": "Process States",
                "difficulty": "easy",
                "source_citation": "Operating Systems Textbook — Page 48",
                "source_type": "pdf",
                "source_location": "page:48"
            },
        ]


# Singleton
assessment_service = AssessmentService()
