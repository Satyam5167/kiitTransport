import express from 'express'
import {
    getDriverDetails,
    getTotalActiveIdleMaintenanceBuses,
    getCurrentAllocation,
    updateBusRoute,
    updateBusStatus,
    addVehicle
} from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/getDriverDetails',authMiddleware, getDriverDetails)
router.get('/getTotalActiveIdleMaintenanceBuses', authMiddleware, getTotalActiveIdleMaintenanceBuses)
router.get('/getCurrentAllocation', authMiddleware, getCurrentAllocation);
router.patch('/updateBusStatus', authMiddleware, updateBusStatus);
router.patch('/updateBusRoute', authMiddleware, updateBusRoute);
router.post('/addVehicle', authMiddleware, addVehicle);

export default router