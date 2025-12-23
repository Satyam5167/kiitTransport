import express from 'express'
import {
    getDriverDetails,
    getTotalActiveBuses
} from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

router.get('/getDriverDetails',authMiddleware, getDriverDetails)
router.get('/getTotalActiveBuses', authMiddleware, getTotalActiveBuses)

export default router