# CYBERMIND

## Project structure

- `backend/` — FastAPI, evidence hashing/verification, timeline reconstruction, anomaly detection
- `data/` — forensic CSV datasets
- `frontend/` — React + Vite professional dashboard

## Run locally

### Terminal 1 — backend

From the `backend` directory:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000

### Terminal 2 — frontend

From the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

The Vite proxy forwards `/api/*` requests to the FastAPI backend.
