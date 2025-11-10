// ============================================
// FILE: server/src/routes/reports.routes.ts
// ============================================
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllReports,
  getReportById,
  createReport,
  saveReport,
  getSavedReports,
  removeSavedReport,
} from '../controllers/reports.controller';

const router = Router();

// Public routes
router.get('/', getAllReports);
router.get('/:id', getReportById);

// Protected routes
router.post('/', authenticate, createReport);
router.post('/save', authenticate, saveReport);
router.get('/saved/me', authenticate, getSavedReports);
router.delete('/saved/:id', authenticate, removeSavedReport);

export default router;