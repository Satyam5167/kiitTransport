import express from 'express';
import { runPhase1, runPhase2, upload } from '../controllers/mlController.js';

const router = express.Router();

router.post('/phase1', upload.single('file'), runPhase1);
router.post('/phase2', runPhase2);

export default router;