import express from 'express';
import { updateBusLocation } from '../controllers/simulationController.js';

const router = express.Router();

router.post('/location', updateBusLocation);

export default router;
