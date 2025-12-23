import pool from '../utils/db.js'
//this function will send back driver's name , phone , status , vehicle
export const getDriverDetails = async () => {
    const res = await pool.query(`
        SELECT 
        u.name,
        u.phone,
        b.code AS vehicle,
        b.active AS status
        FROM users u
        JOIN drivers d ON u.id = d.user_id
        JOIN buses b ON d.bus_id = b.id;
        `)
    return res.rows;
}