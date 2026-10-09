# StudyMate AI — Personalized Tutoring & Adaptive Learning

An AI-powered study companion that processes course materials (PDF, PPT, MP4) and creates a source-grounded knowledge base with adaptive assessments, mastery tracking, and personalized study plans.

---

## Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- (Optional) OpenAI API key for LLM-powered answers

### 1. Backend

```powershell
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Set encoding for Windows
$env:PYTHONIOENCODING="utf-8"

# Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at **http://localhost:8000**. On first run it auto-seeds the demo database.

### 2. Frontend

```powershell
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

The frontend starts at **http://localhost:5173** and proxies API calls to the backend.

### 3. Open the App

1. Navigate to **http://localhost:5173**
2. Click **"Continue as Demo Student"**
3. Explore the full demo with the pre-loaded Operating Systems course

---

## Environment Variables

Copy `.env.example` to `.env` in the project root:

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key (optional) | *(empty = demo mode)* |
| `DATABASE_URL` | Database connection string | `sqlite:///./studymate.db` |
| `EMBEDDING_MODEL` | Embedding model name | `text-embedding-3-small` |
| `LLM_MODEL` | LLM model name | `gpt-4o-mini` |

**Demo mode** works fully without an API key using built-in content.

---

## Demo Flow

1. **Login** → Continue as Demo Student
2. **Dashboard** → See mastery stats, weak areas, recommendations
3. **Knowledge Base** → Browse topics, concepts, source citations
4. **AI Tutor** → Ask questions, get source-grounded answers with citations
5. **Assessments** → Generate quiz, answer questions, see scores
6. **Progress** → View charts, radar plots, mastery heatmap
7. **Study Plan** → Get personalized daily plan, generate flashcards
8. **Evaluation** → Run RAG evaluation pipeline with metrics
9. **Upload** → Upload your own PDF/PPT files

---

## Implemented Features

- Multimodal upload (PDF, PPT, MP4)
- Source-grounded RAG with citations
- Knowledge base with topic tree
- AI Tutor chat with citation chips
- Adaptive quiz generation + verification
- Mastery tracking (Bayesian Knowledge Tracing)
- Misconception detection
- Personalized study plan with forgetting curves
- Flashcard + notes generation
- Progress dashboard with Recharts
- RAG evaluation pipeline
- Multilingual support (English/Tamil/Hindi)
- Demo mode with full OS course
- Course flow graph visualization

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python FastAPI |
| Database | SQLite (SQLAlchemy ORM) |
| AI | OpenAI API (with demo fallback) |
| RAG | In-memory vector search (numpy) |
