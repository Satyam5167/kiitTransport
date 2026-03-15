import pool from '../utils/db.js'

//this function will send back driver's name , phone , status , vehicle , and user id
export const getDriverDetails = async () => {
    const res = await pool.query(`
        SELECT 
        u.id,
        u.name,
        u.phone,
        d.bus_id,
        b.code AS vehicle,
        b.status AS status
        FROM users u
        JOIN drivers d ON u.id = d.user_id
        JOIN buses b ON d.bus_id = b.id
        `)
    return res.rows;
}

//this query will return the total number of active, idle and in maintenance buses
export const getTotalActiveIdleMaintenanceBuses = async() =>{
    const res = await pool.query(`
        SELECT
        COUNT(*) FILTER (WHERE status = 'active')       AS active_buses,
        COUNT(*) FILTER (WHERE status = 'idle')         AS idle_buses,
        COUNT(*) FILTER (WHERE status = 'maintenance')  AS maintenance_buses
        FROM buses
        `)
    return res.rows[0]
}

export const updateBusStatus = async (busId, status) => {
    await pool.query(
        `UPDATE buses SET status = $1 WHERE id = $2`,
        [status, busId]
    );
};

export const updateBusRoute = async (busId, stopIds) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Delete old route
        await client.query(
            `DELETE FROM bus_stops WHERE bus_id = $1`,
            [busId]
        );

        // Insert new route
        for (let i = 0; i < stopIds.length; i++) {
            await client.query(
                `INSERT INTO bus_stops (bus_id, stop_id, seq)
                 VALUES ($1, $2, $3)`,
                [busId, stopIds[i], i + 1]
            );
        }

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const addVehicle = async (vehicleCode, sourceId, destinationId, status) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insert new bus
        const busRes = await client.query(
            `INSERT INTO buses (code, status) VALUES ($1, $2) RETURNING id`,
            [vehicleCode, status]
        );
        const newBusId = busRes.rows[0].id;

        // Assign route if stops provided
        if (sourceId && destinationId && sourceId !== destinationId) {
            await client.query(
                `INSERT INTO bus_stops (bus_id, stop_id, seq) VALUES 
                 ($1, $2, 1), 
                 ($1, $3, 2)`,
                [newBusId, sourceId, destinationId]
            );
        }

        await client.query("COMMIT");
        return newBusId;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const getStops = async () => {
    const res = await pool.query(`SELECT id, name, lat, lng FROM stops ORDER BY name ASC`);
    return res.rows;
};

// Update driver name and/or assigned bus
export const updateDriver = async (userId, name, busId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (name) {
            await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [name, userId]);
        }
        if (busId) {
            await client.query(`UPDATE drivers SET bus_id = $1 WHERE user_id = $2`, [busId, userId]);
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Delete driver and unlink user from drivers table
export const deleteDriver = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM drivers WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Add a new driver (creates user + drivers row)
export const addDriver = async ({ name, email, phone, password_hash, busId }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert user
        const userRes = await client.query(
            `INSERT INTO users (name, email, password_hash, role, phone)
             VALUES ($1, $2, $3, 'driver', $4) RETURNING id`,
            [name, email, password_hash, phone || null]
        );
        const userId = userRes.rows[0].id;

        // 2. Generate a unique api_key
        const apiKey = `drv_${userId}_${Date.now()}`;

        // 3. Insert driver row
        await client.query(
            `INSERT INTO drivers (user_id, bus_id, api_key)
             VALUES ($1, $2, $3)`,
            [userId, busId || null, apiKey]
        );

        await client.query('COMMIT');
        return userId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};



