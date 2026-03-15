import express from 'express';
import { runAll, upload } from '../controllers/mlController.js';

const router = express.Router();

router.post('/run-all', upload.single('file'), runAll);

export default router;