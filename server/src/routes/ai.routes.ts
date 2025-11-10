// ============================================
// FILE: server/src/routes/ai.routes.ts
// ============================================
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  analyzeSentiment,
  summarizeReport,
  calculateDCF,
  askQuestion,
} from '../controllers/ai.controller';

const router = Router();

// All AI routes require authentication
router.post('/sentiment', authenticate, analyzeSentiment);
router.post('/summarize', authenticate, summarizeReport);
router.post('/dcf', authenticate, calculateDCF);
router.post('/ask', authenticate, askQuestion);

export default router;