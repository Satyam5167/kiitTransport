import express from 'express';
import { runPhase1, runPhase2, upload } from '../controllers/mlController.js';

const router = express.Router();

// Route for Phase 1: Expects 'buses', 'shuttles' and a file named 'file'
router.post('/phase1', upload.single('file'), runPhase1);

// Route for Phase 2: No input required, runs on stored state in ML service
router.post('/phase2', runPhase2);

export default router;
