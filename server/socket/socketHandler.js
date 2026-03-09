import pool from '../utils/db.js';
import { startPolling } from '../services/locationService.js';

export default (io) => {
    // Start the polling service once
    startPolling(io);

    io.on('connection', async (socket) => {
        console.log('New client connected:', socket.id);

        // Send initial locations immediately
        try {
            const res = await pool.query(`
        SELECT
          b.id as bus_id,
          b.code,
          l.lat,
          l.lng,
          l.speed_m_s,
          l.heading_deg,
          l.timestamp
        FROM buses b
        JOIN bus_last_locations l ON b.id = l.bus_id
      `);

            const initialLocations = res.rows.map(row => ({
                busId: row.bus_id,
                code: row.code,
                lat: row.lat,
                lng: row.lng,
                speed: row.speed_m_s,
                heading: row.heading_deg,
                timestamp: row.timestamp
            }));

            socket.emit('initialBusLocations', initialLocations);
        } catch (err) {
            console.error('Error fetching initial locations:', err);
        }

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
