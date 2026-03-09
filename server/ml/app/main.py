from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from .phase1_first_round import phase1_first_round
from .phase2_reassignment import phase2_reassignment

app = FastAPI(
    title="Transport Allocation Engine",
    description="Phase-1 + Phase-2 Combined Execution",
    version="2.0"
)

# -----------------------------
# ✅ CORS CONFIGURATION
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {
        "status": "running",
        "available_endpoints": ["run-all"]
    }

# -----------------------------
# RUN PHASE 1 + PHASE 2 TOGETHER
# -----------------------------
@app.post("/api/ml/run-all")
async def run_full_allocation(
    buses: int = Form(...),
    shuttles: int = Form(...),
    file: UploadFile = File(...)
):
    file_content = (await file.read()).decode("utf-8")

    # 🔵 Run Phase 1
    phase1_result = phase1_first_round(
        file_content=file_content,
        buses=buses,
        shuttles=shuttles,
    )

    phase1_clean = phase1_result.get("result", {})

    # 🔵 Run Phase 2 immediately
    phase2_result = phase2_reassignment(phase1_clean)

    # -----------------------------
    # BUILD BUS TIMETABLE
    # -----------------------------
    phase1_assignments = phase1_clean.get("first_round_assignments", [])
    phase2_assignments = phase2_result.get("second_round_assignments", [])

    bus_timetable = []

    # Phase 1
    for item in phase1_assignments:
        bus_timetable.append({
            "vehicle_id": item["vehicle_id"],
            "vehicle_type": item["vehicle_type"],
            "round": 1,
            "to_hostel": item["hostel"],
            "start_time": item["start_time"],
            "end_time": item["end_time"]
        })

    # Phase 2
    for item in phase2_assignments:
        bus_timetable.append({
            "vehicle_id": item["vehicle_id"],
            "vehicle_type": item["vehicle_type"],
            "round": 2,
            "to_hostel": item["to_hostel"],
            "start_time": item["start_time"],
            "end_time": item["arrival_time"]
        })

    # Sort by vehicle + time
    bus_timetable.sort(
        key=lambda x: (x["vehicle_id"], x["start_time"])
    )

    return {
    "result": {
        "phase1": phase1_clean,
        "phase2": phase2_result,
        "bus_timetable": bus_timetable
    }
}