import {
    getDriverDetails
} from '../controllers/adminController.js'
import express from 'express'
const router = express.Router()

router.get('/drivers', getDriverDetails)

export default router;

