import pool from '../utils/db.js';
import { calculateETA } from './etaService.js';

let intervalId = null;

// Store last known update times to detect changes
const lastUpdateTimes = new Map();

export const startPolling = (io) => {
    if (intervalId) return; // Already started

    console.log('Starting location polling service...');

    intervalId = setInterval(async () => {
        try {
            const res = await pool.query(`
        SELECT
          l.bus_id,
          b.code,
          l.lat,
          l.lng,
          l.speed_m_s,
          l.heading_deg,
          l.timestamp,
          l.updated_at
        FROM bus_last_locations l
        JOIN buses b ON l.bus_id = b.id
      `);

            for (const bus of res.rows) {
                const lastUpdateTime = lastUpdateTimes.get(bus.bus_id);
                const currentUpdateTime = new Date(bus.updated_at).getTime();

                // If it's a new bus or timestamp has changed
                if (!lastUpdateTime || currentUpdateTime > lastUpdateTime) {
                    lastUpdateTimes.set(bus.bus_id, currentUpdateTime);

                    // Emit location update
                    io.emit('busLocationUpdate', {
                        busId: bus.bus_id,
                        code: bus.code,
                        lat: bus.lat,
                        lng: bus.lng,
                        speed: bus.speed_m_s,
                        heading: bus.heading_deg,
                        timestamp: bus.timestamp
                    });

                    // Calculate and emit ETA
                    // We can do this asynchronously without awaiting to not block the loop
                    calculateETA(bus.bus_id).then(etas => {
                        if (etas.length > 0) {
                            io.emit('busETAUpdate', {
                                busId: bus.bus_id,
                                stops: etas
                            });
                        }
                    });
                }
            }

        } catch (err) {
            console.error('Error in location polling:', err);
        }
    }, 2000); // 2 seconds
};
