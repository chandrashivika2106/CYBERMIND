import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies():

    data = pd.DataFrame([
        {
            "login_hour": 9,
            "files_accessed": 12,
            "bytes_transferred": 1500,
            "new_ip": 0
        },
        {
            "login_hour": 10,
            "files_accessed": 15,
            "bytes_transferred": 1800,
            "new_ip": 0
        },
        {
            "login_hour": 11,
            "files_accessed": 18,
            "bytes_transferred": 2200,
            "new_ip": 0
        },
        {
            "login_hour": 9,
            "files_accessed": 14,
            "bytes_transferred": 1700,
            "new_ip": 0
        },
        {
            "login_hour": 10,
            "files_accessed": 20,
            "bytes_transferred": 2500,
            "new_ip": 0
        },
        {
            "login_hour": 14,
            "files_accessed": 16,
            "bytes_transferred": 2000,
            "new_ip": 0
        },
        {
            "login_hour": 2,
            "files_accessed": 250,
            "bytes_transferred": 500000000,
            "new_ip": 1
        }
    ])

    features = [
        "login_hour",
        "files_accessed",
        "bytes_transferred",
        "new_ip"
    ]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.20,
        random_state=42
    )

    data["prediction"] = model.fit_predict(data[features])

    data["status"] = data["prediction"].apply(
        lambda x: "ANOMALOUS" if x == -1 else "NORMAL"
    )

    data["reasons"] = ""

    for i, row in data.iterrows():

        reasons = []

        if row["login_hour"] < 6 or row["login_hour"] > 22:
            reasons.append("Login occurred outside normal hours")

        if row["files_accessed"] > 100:
            reasons.append("Unusually high number of files accessed")

        if row["bytes_transferred"] > 100000000:
            reasons.append("Large data transfer detected")

        if row["new_ip"] == 1:
            reasons.append("New IP address detected")

        data.at[i, "reasons"] = ", ".join(reasons)

    results = []

    for _, row in data.iterrows():

        results.append({
            "login_hour": int(row["login_hour"]),
            "files_accessed": int(row["files_accessed"]),
            "bytes_transferred": int(row["bytes_transferred"]),
            "new_ip": int(row["new_ip"]),
            "status": row["status"],
            "reasons": row["reasons"]
        })

    return results