import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def build_timeline():
    authentication = pd.read_csv(DATA_DIR / "authentication_logs.csv")
    file_access = pd.read_csv(DATA_DIR / "file_access_logs.csv")
    network = pd.read_csv(DATA_DIR / "network_logs.csv")

    authentication_events = pd.DataFrame({
        "timestamp": authentication["timestamp"],
        "user": authentication["user"],
        "event_type": "AUTHENTICATION",
        "action": authentication["action"],
        "details": authentication["ip_address"] + " - " + authentication["status"]
    })

    file_events = pd.DataFrame({
        "timestamp": file_access["timestamp"],
        "user": file_access["user"],
        "event_type": "FILE_ACCESS",
        "action": file_access["action"],
        "details": file_access["file_name"]
    })

    network_events = pd.DataFrame({
        "timestamp": network["timestamp"],
        "user": network["user"],
        "event_type": "NETWORK",
        "action": "NETWORK_ACTIVITY",
        "details": network["destination_ip"] + " - " + network["bytes_sent"].astype(str) + " bytes"
    })

    timeline = pd.concat(
        [authentication_events, file_events, network_events],
        ignore_index=True
    )

    timeline["timestamp"] = pd.to_datetime(timeline["timestamp"])

    timeline = timeline.sort_values("timestamp")

    timeline["timestamp"] = timeline["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

    return timeline.to_dict(orient="records")