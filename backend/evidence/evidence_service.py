import hashlib
from pathlib import Path

UPLOAD_DIR = Path("evidence/uploads")

def calculate_sha256(file_path):
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while chunk := file.read(4096):
            sha256.update(chunk)

    return sha256.hexdigest()

def save_evidence(file):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as output:
        output.write(file.file.read())

    file_hash = calculate_sha256(file_path)

    return {
        "filename": file.filename,
        "sha256": file_hash,
        "status": "Evidence stored successfully"
    }

def verify_evidence(filename, original_hash):
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        return {
            "filename": filename,
            "status": "Evidence not found"
        }

    current_hash = calculate_sha256(file_path)

    if current_hash == original_hash:
        return {
            "filename": filename,
            "original_hash": original_hash,
            "current_hash": current_hash,
            "integrity": "VERIFIED",
            "message": "Evidence has not been modified"
        }

    return {
        "filename": filename,
        "original_hash": original_hash,
        "current_hash": current_hash,
        "integrity": "FAILED",
        "message": "Possible evidence tampering detected"
    }