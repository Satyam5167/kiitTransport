import express from 'express'
import {
    getDriverDetails,
    getTotalActiveIdleMaintenanceBuses
} from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

router.get('/getDriverDetails',authMiddleware, getDriverDetails)
router.get('/getTotalActiveIdleMaintenanceBuses', authMiddleware, getTotalActiveIdleMaintenanceBuses)

export default router