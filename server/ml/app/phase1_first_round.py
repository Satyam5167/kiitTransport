import pandas as pd
from datetime import datetime, timedelta
from io import StringIO

def phase1_first_round(file_content: str, buses: int, shuttles: int):
    BUS_CAPACITY = 60
    SHUTTLE_CAPACITY = 20
    BUS_MIN_THRESHOLD = 20

    df = pd.read_csv(StringIO(file_content))

    df["students"] = (
        pd.to_numeric(df["students"], errors="coerce")
        .fillna(0)
        .astype(int)
    )

    df["Predicted"] = (df["students"] * 0.9).astype(int)

    demand = (
        df.groupby(["hostel", "hour"])["Predicted"]
        .sum()
        .reset_index()
    )

    first_round_assignments = []
    hostel_summary = []
    vehicle_state = []

    for hour, hour_df in demand.groupby("hour"):
        hour = int(float(hour))
        time_slot = f"{hour:02d}:00"

        hour_df = hour_df.sort_values("Predicted", ascending=False)

        buses_pool = [{"id": f"B{i+1}", "used": False} for i in range(buses)]
        shuttles_pool = [{"id": f"S{i+1}", "used": False} for i in range(shuttles)]

        start_time = (
            datetime.strptime(str(hour), "%H") - timedelta(minutes=30)
        ).strftime("%H:%M")

        end_time_bus = (
            datetime.strptime(start_time, "%H:%M") + timedelta(minutes=20)
        ).strftime("%H:%M")

        end_time_shuttle = (
            datetime.strptime(start_time, "%H:%M") + timedelta(minutes=15)
        ).strftime("%H:%M")

        hostel_state = {}

        # =========================
        # PASS 1 — EXACTLY ONE VEHICLE PER HOSTEL (OLD LOGIC)
        # =========================
        for _, row in hour_df.iterrows():
            hostel = row["hostel"]
            students = int(row["Predicted"])

            assigned = False
            served = 0
            remaining = students

            prefer_bus = students >= BUS_MIN_THRESHOLD

            if prefer_bus:
                for bus in buses_pool:
                    if not bus["used"]:
                        bus["used"] = True
                        carried = min(BUS_CAPACITY, remaining)
                        served = carried
                        remaining -= carried
                        assigned = True

                        first_round_assignments.append({
                            "vehicle_id": bus["id"],
                            "vehicle_type": "Bus",
                            "round": 1,
                            "hostel": hostel,
                            "time_slot": time_slot,
                            "predicted_students": students,
                            "students_assigned": carried,
                            "capacity_used": carried,
                            "capacity_total": BUS_CAPACITY,
                            "start_time": start_time,
                            "end_time": end_time_bus
                        })
                        break

            if not assigned:
                for shuttle in shuttles_pool:
                    if not shuttle["used"]:
                        shuttle["used"] = True
                        carried = min(SHUTTLE_CAPACITY, remaining)
                        served = carried
                        remaining -= carried
                        assigned = True

                        first_round_assignments.append({
                            "vehicle_id": shuttle["id"],
                            "vehicle_type": "Shuttle",
                            "round": 1,
                            "hostel": hostel,
                            "time_slot": time_slot,
                            "predicted_students": students,
                            "students_assigned": carried,
                            "capacity_used": carried,
                            "capacity_total": SHUTTLE_CAPACITY,
                            "start_time": start_time,
                            "end_time": end_time_shuttle
                        })
                        break

            hostel_state[hostel] = {
                "predicted": students,
                "served": served,
                "remaining": remaining
            }

        # =========================
        # PASS 2 — ONE SHUTTLE ENHANCEMENT (OLD LOGIC)
        # =========================
        for hostel, state in hostel_state.items():
            if state["remaining"] <= 0:
                continue

            for shuttle in shuttles_pool:
                if not shuttle["used"]:
                    shuttle["used"] = True
                    carried = min(SHUTTLE_CAPACITY, state["remaining"])
                    state["served"] += carried
                    state["remaining"] -= carried

                    first_round_assignments.append({
                        "vehicle_id": shuttle["id"],
                        "vehicle_type": "Shuttle",
                        "round": 1,
                        "hostel": hostel,
                        "time_slot": time_slot,
                        "predicted_students": state["predicted"],
                        "students_assigned": carried,
                        "capacity_used": carried,
                        "capacity_total": SHUTTLE_CAPACITY,
                        "start_time": start_time,
                        "end_time": end_time_shuttle
                    })
                    break

                # =========================
        # PASS 3 — SURPLUS VEHICLE REDISTRIBUTION (IMPROVED)
        # =========================
        unused_buses = [b for b in buses_pool if not b["used"]]
        unused_shuttles = [s for s in shuttles_pool if not s["used"]]

        remaining_hostels = [
            (h, s) for h, s in hostel_state.items() if s["remaining"] > 0
        ]

        # Sort once in descending order
        remaining_hostels.sort(key=lambda x: x[1]["remaining"], reverse=True)

                # ---------- Allocate Buses Fairly (Top-to-Bottom Once) ----------
        remaining_hostels = [
            (h, s) for h, s in hostel_state.items() if s["remaining"] > 0
        ]

        remaining_hostels.sort(key=lambda x: x[1]["remaining"], reverse=True)

        bus_index = 0

        for bus in unused_buses:
            if not remaining_hostels:
                break

            if bus_index >= len(remaining_hostels):
                break

            hostel, state = remaining_hostels[bus_index]

            if state["remaining"] <= 0:
                bus_index += 1
                continue

            bus["used"] = True
            carried = min(BUS_CAPACITY, state["remaining"])

            state["served"] += carried
            state["remaining"] -= carried

            first_round_assignments.append({
                "vehicle_id": bus["id"],
                "vehicle_type": "Bus",
                "round": 1,
                "hostel": hostel,
                "time_slot": time_slot,
                "predicted_students": state["predicted"],
                "students_assigned": carried,
                "capacity_used": carried,
                "capacity_total": BUS_CAPACITY,
                "start_time": start_time,
                "end_time": end_time_bus
            })

            bus_index += 1

            # Remove hostel if fully served
            if state["remaining"] <= 0:
                remaining_hostels = [
                    (h, s) for h, s in remaining_hostels if s["remaining"] > 0
                ]

        # ---------- Allocate Shuttles After Buses ----------
        for shuttle in unused_shuttles:
            if not remaining_hostels:
                break

            remaining_hostels.sort(key=lambda x: x[1]["remaining"], reverse=True)

            hostel, state = remaining_hostels[0]

            if state["remaining"] <= 0:
                break

            shuttle["used"] = True
            carried = min(SHUTTLE_CAPACITY, state["remaining"])

            state["served"] += carried
            state["remaining"] -= carried

            first_round_assignments.append({
                "vehicle_id": shuttle["id"],
                "vehicle_type": "Shuttle",
                "round": 1,
                "hostel": hostel,
                "time_slot": time_slot,
                "predicted_students": state["predicted"],
                "students_assigned": carried,
                "capacity_used": carried,
                "capacity_total": SHUTTLE_CAPACITY,
                "start_time": start_time,
                "end_time": end_time_shuttle
            })

            if state["remaining"] <= 0:
                remaining_hostels = [
                    (h, s) for h, s in remaining_hostels if s["remaining"] > 0
                ]

        # =========================
        # FINAL SUMMARY
        # =========================
        for hostel, state in hostel_state.items():
            hostel_summary.append({
                "hostel": hostel,
                "time_slot": time_slot,
                "predicted_students": state["predicted"],
                "served_in_first_round": state["served"],
                "remaining_after_first_round": state["remaining"],
                "status_after_round_1": (
                    "Fully Served" if state["remaining"] == 0 else
                    "Partially Served" if state["served"] > 0 else
                    "Pending"
                )
            })

        for bus in buses_pool:
            if bus["used"]:
                vehicle_state.append({
                    "vehicle_id": bus["id"],
                    "vehicle_type": "Bus",
                    "time_slot": time_slot,
                    "rounds_completed": 1,
                    "available_from_time": end_time_bus,
                    "can_do_second_round": True
                })

        for shuttle in shuttles_pool:
            if shuttle["used"]:
                vehicle_state.append({
                    "vehicle_id": shuttle["id"],
                    "vehicle_type": "Shuttle",
                    "time_slot": time_slot,
                    "rounds_completed": 1,
                    "available_from_time": end_time_shuttle,
                    "can_do_second_round": True
                })

    return {
        "result": {
            "first_round_assignments": first_round_assignments,
            "hostel_first_round_summary": hostel_summary,
            "vehicle_state_after_round_1": vehicle_state
        }
    }