import pool from './utils/db.js';

const BUS_ID = 2; // Change this to the ID of the bus you want to simulate
const UPDATE_INTERVAL_MS = 2000; // Update every 2 seconds
const SPEED_KMH = 40; // Simulated speed

// Fetch stops from DB
const getStops = async () => {
    const res = await pool.query('SELECT * FROM stops ORDER BY id');
    return res.rows;
};

// Calculate distance between two points (Haversine formula) in meters
const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in m
    return d;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

// Calculate bearing between two points
const getBearing = (startLat, startLng, destLat, destLng) => {
    startLat = deg2rad(startLat);
    startLng = deg2rad(startLng);
    destLat = deg2rad(destLat);
    destLng = deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    return (brng * 180 / Math.PI + 360) % 360; // in degrees
}

// Interpolate a point at a certain distance/fraction
const interpolatePoint = (start, end, fraction) => {
    const lat = start.lat + (end.lat - start.lat) * fraction;
    const lng = start.lng + (end.lng - start.lng) * fraction;
    return { lat, lng };
}


const simulate = async () => {
    const stops = await getStops();
    if (stops.length < 2) {
        console.error("Not enough stops to simulate a route.");
        process.exit(1);
    }

    console.log(`Starting simulation for Bus ID: ${BUS_ID}`);
    console.log(`Route has ${stops.length} stops.`);

    let currentStopIndex = 0;
    let nextStopIndex = 1;
    let progress = 0; // 0 to 1 between current and next stop

    setInterval(async () => {
        const start = stops[currentStopIndex];
        const end = stops[nextStopIndex];

        // Calculate distance between stops
        const dist = getDistanceFromLatLonInM(start.lat, start.lng, end.lat, end.lng);

        // Calculate distance covered in one interval
        // Speed (m/s) = (km/h) * 1000 / 3600
        const speedMS = (SPEED_KMH * 1000) / 3600;
        const distCovered = speedMS * (UPDATE_INTERVAL_MS / 1000);

        // Calculate fraction of distance covered
        const fractionStep = distCovered / dist;

        progress += fractionStep;

        if (progress >= 1) {
            // Reached next stop
            progress = 0;
            currentStopIndex = nextStopIndex;
            nextStopIndex = (nextStopIndex + 1) % stops.length; // Loop route
            console.log(`Reached stop: ${stops[currentStopIndex].name}`);
        }

        // Interpolate current position
        // We use the new currentStopIndex effectively if we just switched, but let's handle the movement smoothly
        // If we switched, start and end effectively eventually become the new segment. 
        // For simplicity, if progress wrapped, we update start/end in next tick or just handle overlap.
        // Let's just clamp progress and move to next segment in next tick logic above.

        // Re-evaluate start/end in case indices changed
        const currentStart = stops[currentStopIndex];
        const currentEnd = stops[nextStopIndex];

        // Get simulated position
        const currentPos = interpolatePoint(currentStart, currentEnd, progress);
        const bearing = getBearing(currentStart.lat, currentStart.lng, currentEnd.lat, currentEnd.lng);

        // console.log(`Simulating at: ${currentPos.lat.toFixed(5)}, ${currentPos.lng.toFixed(5)} Heading: ${bearing.toFixed(2)}`);

        // Send update to API
        try {
            const response = await fetch('http://localhost:3000/api/simulation/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bus_id: BUS_ID,
                    lat: currentPos.lat,
                    lng: currentPos.lng,
                    speed: speedMS,
                    heading: bearing
                })
            });
            const data = await response.json();
            // console.log("Update response:", data.message);
        } catch (e) {
            console.error("Failed to update location:", e.message);
        }

    }, UPDATE_INTERVAL_MS);
};

simulate();
