from datetime import datetime, timedelta
from collections import defaultdict
import copy

def phase2_reassignment(phase1_output):
    hostel_summary = copy.deepcopy(
        phase1_output["hostel_first_round_summary"]
    )
    vehicle_state = phase1_output["vehicle_state_after_round_1"]

    second_round_assignments = []

    hostels_by_time = defaultdict(list)
    vehicles_by_time = defaultdict(list)

    for h in hostel_summary:
        if h["remaining_after_first_round"] > 0:
            hostels_by_time[h["time_slot"]].append(h)

    for v in vehicle_state:
        if v["can_do_second_round"]:
            vehicles_by_time[v["time_slot"]].append(v)

    # =========================
    # PHASE 2 — SAME AS PHASE 1 GREEDY LOGIC
    # =========================
    for time_slot in hostels_by_time:
        hostels = hostels_by_time[time_slot]
        vehicles = vehicles_by_time.get(time_slot, [])

        while True:

            # Remaining hostels only
            remaining_hostels = [
                h for h in hostels
                if h["remaining_after_first_round"] > 0
            ]

            if not remaining_hostels:
                break

            if not vehicles:
                break

            # Sort by remaining descending
            remaining_hostels.sort(
                key=lambda x: (
                    x["remaining_after_first_round"],
                    x["predicted_students"]
                ),
                reverse=True
            )

            # Prefer buses first
            vehicles.sort(
                key=lambda x: 0 if x["vehicle_type"] == "Bus" else 1
            )

            hostel = remaining_hostels[0]
            remaining = hostel["remaining_after_first_round"]

            selected_vehicle = None

            # Prefer Bus if remaining >= 20
            for v in vehicles:
                if v["vehicle_type"] == "Bus" and remaining >= 20:
                    selected_vehicle = v
                    break

            # Else use Shuttle
            if not selected_vehicle:
                for v in vehicles:
                    if v["vehicle_type"] == "Shuttle":
                        selected_vehicle = v
                        break

            # If still nothing, use any bus
            if not selected_vehicle:
                for v in vehicles:
                    if v["vehicle_type"] == "Bus":
                        selected_vehicle = v
                        break

            if not selected_vehicle:
                break

            capacity = 60 if selected_vehicle["vehicle_type"] == "Bus" else 20
            assigned = min(capacity, remaining)

            start_time = selected_vehicle["available_from_time"]
            arrival_time = (
                datetime.strptime(start_time, "%H:%M")
                + timedelta(minutes=20)
            ).strftime("%H:%M")

            second_round_assignments.append({
                "vehicle_id": selected_vehicle["vehicle_id"],
                "vehicle_type": selected_vehicle["vehicle_type"],
                "round": 2,
                "from_hostel": selected_vehicle.get("last_served_hostel", "Unknown"),
                "to_hostel": hostel["hostel"],
                "time_slot": time_slot,
                "students_assigned": assigned,
                "capacity_used": assigned,
                "capacity_total": capacity,
                "start_time": start_time,
                "arrival_time": arrival_time,
                "reason": "Reassigned to reduce remaining demand"
            })

            hostel["remaining_after_first_round"] -= assigned

            # Remove vehicle from pool (used once in phase 2)
            vehicles.remove(selected_vehicle)

    # =========================
    # FINAL STATUS AFTER PHASE 2
    # =========================
    hostel_final_summary = []

    for hostel in hostel_summary:
        remaining_students = hostel["remaining_after_first_round"]
        total_served = hostel["predicted_students"] - remaining_students

        if remaining_students == 0:
            final_status = "Fully Served"
        elif total_served > 0:
            final_status = "Partially Served"
        else:
            final_status = "Not Served"

        hostel_final_summary.append({
            "hostel": hostel["hostel"],
            "total_served": total_served,
            "remaining_students": remaining_students,
            "final_status": final_status
        })

    return {
        "second_round_assignments": second_round_assignments,
        "hostel_second_round_summary": hostel_final_summary
    }