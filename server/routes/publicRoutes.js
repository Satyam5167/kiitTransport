import express from 'express'
import {
    getBusRoutes
} from '../controllers/publicController.js'
const router = express.Router()

router.get('/getBusRoutes', getBusRoutes)

export default router