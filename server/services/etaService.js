import pool from '../utils/db.js';

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const calculateETA = async (busId) => {
  try {
    // 1. Get current bus location
    const busRes = await pool.query(`
      SELECT lat, lng, speed_m_s
      FROM bus_last_locations
      WHERE bus_id = $1
    `, [busId]);

    if (busRes.rows.length === 0) {
      return [];
    }

    const busLoc = busRes.rows[0];
    const busLat = busLoc.lat;
    const busLng = busLoc.lng;
    // If speed is 0 or null, assume a default speed for ETA (undersirable but handles stopped buses)
    // Or better, just use a minimum speed to avoid division by zero.
    // Requirement says: speed_kmh = speed_m_s * 3.6
    let speedKmh = (busLoc.speed_m_s || 0) * 3.6;
    if (speedKmh < 1) speedKmh = 20; // Default to 20km/h if stopped, to give a rough estimate or stay infinite

    // 2. Get stops for this bus
    // Assuming bus_stops defines the sequence. 
    // We need to find "upcoming" stops. 
    // For simplicity in this iteration, we'll calculate distance to ALL stops in the sequence.
    // In a real circular route, knowing which is "next" is harder without previous state.
    // We will calculate distance to all stops and return ETAs. 
    // Ideally user wants ETA to upcoming stops.
    // We will simply calculate distance from current pos to stop. 
    // Note: This straight line distance is an approximation.
    
    const stopsRes = await pool.query(`
      SELECT s.id, s.name, s.lat, s.lng, bs.seq
      FROM stops s
      JOIN bus_stops bs ON s.id = bs.stop_id
      WHERE bs.bus_id = $1
      ORDER BY bs.seq
    `, [busId]);

    const etas = stopsRes.rows.map(stop => {
      const distKm = calculateDistance(busLat, busLng, stop.lat, stop.lng);
      const etaMinutes = (distKm / speedKmh) * 60;
      return {
        stopId: stop.id,
        stopName: stop.name,
        etaMinutes: Math.round(etaMinutes) // Round to nearest minute
      };
    });

    return etas;

  } catch (err) {
    console.error('Error calculating ETA:', err);
    return [];
  }
};
