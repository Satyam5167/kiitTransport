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

    for time_slot in hostels_by_time:
        hostels = hostels_by_time[time_slot]
        vehicles = vehicles_by_time.get(time_slot, [])

        hostels.sort(
            key=lambda x: (
                x["remaining_after_first_round"],
                x["predicted_students"]
            ),
            reverse=True
        )

        vehicles.sort(
            key=lambda x: 0 if x["vehicle_type"] == "Bus" else 1
        )

        used_vehicles = set()

        for hostel in hostels:
            remaining = hostel["remaining_after_first_round"]

            for vehicle in vehicles:
                if vehicle["vehicle_id"] in used_vehicles:
                    continue

                if vehicle["vehicle_type"] == "Bus" and remaining < 20:
                    continue

                capacity = 60 if vehicle["vehicle_type"] == "Bus" else 20
                assigned = min(capacity, remaining)

                start_time = vehicle["available_from_time"]
                arrival_time = (
                    datetime.strptime(start_time, "%H:%M")
                    + timedelta(minutes=20)
                ).strftime("%H:%M")

                second_round_assignments.append({
                    "vehicle_id": vehicle["vehicle_id"],
                    "vehicle_type": vehicle["vehicle_type"],
                    "round": 2,
                    "from_hostel": vehicle.get("last_served_hostel", "Unknown"),
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
                used_vehicles.add(vehicle["vehicle_id"])
                break

    for hostel in hostel_summary:
        if hostel["remaining_after_first_round"] == 0:
            hostel["status_after_round_1"] = "Fully Served"
        elif hostel["remaining_after_first_round"] > 0 and hostel["served_in_first_round"] > 0:
            hostel["status_after_round_1"] = "Partially Served"
        else:
            hostel["status_after_round_1"] = "Pending"

    return {
        "second_round_assignments": second_round_assignments,
        "hostel_first_round_summary": hostel_summary
    }
