import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

router.get('/buses/live', async (req, res) => {
    try {
        const query = `
      SELECT
        b.id as busId,
        b.code,
        l.lat,
        l.lng,
        l.speed_m_s,
        l.heading_deg,
        l.timestamp
      FROM buses b
      JOIN bus_last_locations l ON b.id = l.bus_id
    `;

        const result = await pool.query(query);

        // Map to required format (though query already close, just to be safe on casing)
        const buses = result.rows.map(row => ({
            busId: row.busid, // pg returns lowercase column names by default
            code: row.code,
            lat: row.lat,
            lng: row.lng,
            speed_m_s: row.speed_m_s,
            heading_deg: row.heading_deg,
            timestamp: row.timestamp
        }));

        res.json(buses);
    } catch (err) {
        console.error('Error fetching live buses:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
