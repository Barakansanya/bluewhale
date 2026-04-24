// server/src/routes/reports.routes.ts

import { Router } from 'express';
import { 
  getAllReports, 
  getCompanyReports, 
  downloadReport,
  getReportFilters 
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get all reports with filters
router.get('/', authenticate, getAllReports);

// Get filter options
router.get('/filters', authenticate, getReportFilters);

// Get reports for specific company
router.get('/company/:ticker', authenticate, getCompanyReports);

// Download report in specific format
router.get('/:id/download', authenticate, downloadReport);

export default router;