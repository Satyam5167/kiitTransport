import pool from '../utils/db.js'

export const getBusRoutes=async()=>{
    const result=await pool.query(`
        SELECT
        b.id AS bus_id,
        b.code AS bus_code,
        b.status,
        JSON_AGG(
        JSON_BUILD_OBJECT(
        'seq', bs.seq,
        'stop_id', s.id,
        'name', s.name,
        'lat', s.lat,
        'lng', s.lng
        )
        ORDER BY bs.seq
        ) AS route
        FROM buses b
        JOIN bus_stops bs ON bs.bus_id = b.id
        JOIN stops s ON s.id = bs.stop_id
        GROUP BY b.id, b.code, b.status
        ORDER BY b.id
        `)

    return result.rows
}