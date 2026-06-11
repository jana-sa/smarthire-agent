# SmartHire Agent (MVP)

SmartHire Agent is an end-to-end AI-assisted resume screening system.

It accepts a job description and multiple resumes (PDF/DOCX), then returns:
- Candidate fit score (`0-100`)
- Short explanation per candidate
- Ranked results

This implementation is intentionally modular and beginner-friendly.

## Architecture

Sequential multi-agent pipeline:

1. **Parser Agent**
   - Input: job description text
   - Output: structured JSON requirements (`skills`, `experience_years`, `qualifications`, `nice_to_have`)
2. **Scorer Agent**
   - Input: parsed requirements + each resume text
   - Output: score + explanation

Supporting tools/services:
- Resume file parser (PDF + DOCX)
- Embedding similarity service (sentence-transformers)
- Rule-based matching service

---

## Project Structure

```text
smarthire-agent/
  backend/
    app/
      agents/
      services/
      main.py
      schemas.py
      config.py
    requirements.txt
    Dockerfile
  frontend/
    src/
    package.json
    vite.config.js
  .env.example
```

---

## 1) Backend Setup (FastAPI)

### Prerequisites
- Python 3.11+
- `pip`

### Install

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Run API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2) Frontend Setup (React + Vite)

### Prerequisites
- Node.js 20+
- npm

### Install + Run

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: [http://localhost:5173](http://localhost:5173)

Set API URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

---

## 3) Environment Variables

Copy `.env.example` to `.env` (project root or backend root):

```bash
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-1.5-flash
SIMILARITY_WEIGHT=0.6
RULE_WEIGHT=0.4
```

If `GOOGLE_API_KEY` is missing, parser falls back to a simple heuristic parser.

---

## 4) API Usage

### Health
- `GET /health`

### Screen Candidates
- `POST /api/v1/screen`
- `multipart/form-data`:
  - `job_description_text` (optional string)
  - `job_description_file` (optional txt/pdf/docx)
  - `resumes` (one or many PDF/DOCX/TXT files)

Returns ranked candidates with score + explanation.

---

## 5) Deployment

### Render (quick MVP)

1. Create a new **Web Service** for backend.
2. Root dir: `backend`
3. Build command:
   - `pip install -r requirements.txt`
4. Start command:
   - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars (`GOOGLE_API_KEY`, etc).

For frontend, create a **Static Site**:
- Root dir: `frontend`
- Build command: `npm install && npm run build`
- Publish dir: `dist`
- Add `VITE_API_BASE_URL` pointing to backend URL.

### Google Cloud Run (backend)

```bash
cd backend
gcloud builds submit --tag gcr.io/<PROJECT_ID>/smarthire-backend
gcloud run deploy smarthire-backend \
  --image gcr.io/<PROJECT_ID>/smarthire-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Set environment variables in Cloud Run console.

---

## 6) Notes on Google ADK

This MVP uses an ADK-style modular agent architecture in code:
- `ParserAgent`
- `ScorerAgent`
- `ScreeningOrchestrator`

You can replace agent internals with direct Google ADK runtime calls without changing API contracts.

---

## 7) MVP Scoring Logic

`final_score = (semantic_similarity * 100 * similarity_weight) + (rule_score * 100 * rule_weight)`

Where:
- semantic similarity uses `all-MiniLM-L6-v2`
- rule score combines:
  - required skill coverage
  - years of experience check
  - qualification keyword matches

---

## 8) Next Improvements

- Add authentication and job posting history
- Batch async processing with Celery/RQ
- Better explanation traces
- Human feedback loop to improve scoring
- Bias/fairness checks before production use
