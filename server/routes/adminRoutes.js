import express from 'express'
import {
    getDriverDetails
} from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

router.get('/drivers',authMiddleware, getDriverDetails)

export default router;

