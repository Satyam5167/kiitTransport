import pool from '../utils/db.js'

//this function will send back driver's name , phone , status , vehicle
export const getDriverDetails = async () => {
    const res = await pool.query(`
        SELECT 
        u.name,
        u.phone,
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

