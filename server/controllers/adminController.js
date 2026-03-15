import * as adminQueries from '../queries/adminQueries.js'
import { getLatestAllocation } from '../utils/mlState.js'


// Get Driver Details
export const getDriverDetails = async (req, res) => {
    const { role } = req.user

    if (role !== 'admin')
        return res.status(403).json({ message: 'Unauthorized User' })

    try {
        const result = await adminQueries.getDriverDetails()
        return res.json(result)
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


// Get Total Active / Idle / Maintenance Buses
export const getTotalActiveIdleMaintenanceBuses = async (req, res) => {
    const { role } = req.user

    if (role !== 'admin')
        return res.status(403).json({ message: 'Unauthorized User' })

    try {
        const result = await adminQueries.getTotalActiveIdleMaintenanceBuses()
        return res.json(result)
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


// Get Latest ML Allocation
export const getCurrentAllocation = (req, res) => {
    const data = getLatestAllocation()

    if (!data)
        return res.status(404).json({ message: "No allocation yet" })

    return res.json(data)
}


// Update Bus Status (Active / Idle / Maintenance)
export const updateBusStatus = async (req, res) => {
    const { role } = req.user

    if (role !== 'admin')
        return res.status(403).json({ message: 'Unauthorized User' })

    const { busId, status } = req.body

    if (!busId || !status)
        return res.status(400).json({ message: 'Missing fields' })

    const allowedStatuses = ['active', 'idle', 'maintenance']

    if (!allowedStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status value' })

    try {
        await adminQueries.updateBusStatus(busId, status)
        return res.json({ message: 'Status updated successfully' })
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


// Update Bus Route (Source → Destination)
export const updateBusRoute = async (req, res) => {
    const { role } = req.user

    if (role !== 'admin')
        return res.status(403).json({ message: 'Unauthorized User' })

    const { busId, stopIds } = req.body

    if (!busId || !Array.isArray(stopIds) || stopIds.length !== 2)
        return res.status(400).json({ message: 'Exactly 2 stops required (Source & Destination)' })

    const [source, destination] = stopIds

    if (source === destination)
        return res.status(400).json({ message: 'Source and Destination cannot be same' })

    try {
        await adminQueries.updateBusRoute(busId, stopIds)
        return res.json({ message: 'Route updated successfully' })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Add New Vehicle
export const addVehicle = async (req, res) => {
    const { role } = req.user

    if (role !== 'admin')
        return res.status(403).json({ message: 'Unauthorized User' })

    const { vehicleCode, status, sourceId, destinationId } = req.body

    if (!vehicleCode || !status)
        return res.status(400).json({ message: 'Vehicle Code and Status are required' })

    try {
        const newBusId = await adminQueries.addVehicle(vehicleCode, sourceId, destinationId, status)
        return res.status(201).json({ message: 'Vehicle added successfully', busId: newBusId })
    } catch (e) {
        // Handle postgres unique constraint error for duplicate bus codes (e.code === '23505')
        if (e.code === '23505') {
            return res.status(400).json({ message: 'Vehicle code already exists' })
        }
        console.log(e.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}