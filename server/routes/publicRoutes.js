import express from 'express'
import {
    getBusRoutes,
    getStops,
    getBusesForRoutes
} from '../controllers/publicController.js'
const router = express.Router()

router.get('/getBusRoutes', getBusRoutes)
router.get('/getStops', getStops)
router.post('/getBusesForRoutes',getBusesForRoutes)

export default router