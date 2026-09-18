from fastapi import FastAPI, UploadFile, File, Form
from evidence.evidence_service import save_evidence, verify_evidence
from evidence.timeline_service import build_timeline
from ml.anomaly_detector import detect_anomalies

app = FastAPI(title="CYBERMIND")

@app.get("/")
def home():
    return {
        "message": "CYBERMIND Backend is Running"
    }

@app.post("/evidence/upload")
def upload_evidence(file: UploadFile = File(...)):
    result = save_evidence(file)
    return result

@app.post("/evidence/verify")
def verify_uploaded_evidence(
    filename: str = Form(...),
    original_hash: str = Form(...)
):
    return verify_evidence(filename, original_hash)

@app.get("/timeline")
def get_timeline():
    return {
        "status": "Timeline generated successfully",
        "events": build_timeline()
    }

@app.get("/anomaly/detect")
def detect_behavioral_anomalies():
    return {
        "status": "Anomaly detection completed",
        "results": detect_anomalies()
    }