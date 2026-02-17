import pool from '../utils/db.js';

export const updateBusLocation = async (req, res) => {
    const { bus_id, lat, lng, speed, heading } = req.body;

    if (!bus_id || !lat || !lng) {
        return res.status(400).json({ message: "Missing required fields: bus_id, lat, lng" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Update or Insert into bus_last_locations
        const checkRes = await client.query('SELECT 1 FROM bus_last_locations WHERE bus_id = $1', [bus_id]);

        if (checkRes.rowCount > 0) {
            await client.query(`
                UPDATE bus_last_locations 
                SET lat = $1, lng = $2, speed_m_s = $3, heading_deg = $4, updated_at = NOW()
                WHERE bus_id = $5
            `, [lat, lng, speed || 0, heading || 0, bus_id]);
        } else {
            // Check if bus exists first to avoid foreign key error if we want to be safe, 
            // but relying on DB constraint is also fine (will throw error).
            await client.query(`
                INSERT INTO bus_last_locations (bus_id, lat, lng, speed_m_s, heading_deg, timestamp)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [bus_id, lat, lng, speed || 0, heading || 0]);
        }

        // 2. Insert into bus_locations_history (Audit log)
        await client.query(`
            INSERT INTO bus_locations_history (bus_id, lat, lng, speed_m_s, heading_deg, timestamp)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [bus_id, lat, lng, speed || 0, heading || 0]);

        await client.query('COMMIT');

        res.json({ message: "Location updated successfully" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error updating location:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    } finally {
        client.release();
    }
};
