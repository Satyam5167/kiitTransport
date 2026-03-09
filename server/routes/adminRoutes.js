import express from 'express'
import {
    getDriverDetails,
    getTotalActiveIdleMaintenanceBuses,
    getCurrentAllocation,
    updateBusRoute   // ✅ ADD THIS
} from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { updateBusStatus } from '../controllers/adminController.js'

const router = express.Router()

router.get('/getDriverDetails',authMiddleware, getDriverDetails)
router.get('/getTotalActiveIdleMaintenanceBuses', authMiddleware, getTotalActiveIdleMaintenanceBuses)
router.get('/getCurrentAllocation', authMiddleware, getCurrentAllocation);
router.patch('/updateBusStatus', authMiddleware, updateBusStatus);
router.patch('/updateBusRoute', authMiddleware, updateBusRoute);

export default router