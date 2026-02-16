from fastapi import FastAPI, UploadFile, File, Form
from .phase1_first_round import phase1_first_round
from .phase2_reassignment import phase2_reassignment

LATEST_PHASE1_RESULT = None

app = FastAPI(
    title="Transport Allocation Engine",
    description="Phase-1 First Round Allocation + Phase-2 Reassignment",
    version="1.0"
)

@app.get("/")
def health():
    return {
        "status": "running",
        "available_phases": ["phase-1", "phase-2"]
    }

# -----------------------------
# PHASE 1 — FIRST ROUND
# -----------------------------
@app.post("/run-phase1")
async def run_phase1(
    buses: int = Form(...),
    shuttles: int = Form(...),
    file: UploadFile = File(...)
):
    global LATEST_PHASE1_RESULT

    file_content = (await file.read()).decode("utf-8")

    result = phase1_first_round(
        file_content=file_content,
        buses=buses,
        shuttles=shuttles,
    )

    LATEST_PHASE1_RESULT = result

    return {
        "message": "Phase 1 allocation completed",
        "phase": "First Round (Per Hour)",
        "result": result
    }


# -----------------------------
# PHASE 2 — REASSIGNMENT
# -----------------------------
@app.post("/run-phase2")
async def run_phase2():
    if LATEST_PHASE1_RESULT is None:
        return {
            "error": "Phase 1 must be executed before Phase 2"
        }

    result = phase2_reassignment(LATEST_PHASE1_RESULT)

    return {
        "message": "Phase 2 reassignment completed",
        "phase": "Second Round Reassignment",
        "result": result
    }
