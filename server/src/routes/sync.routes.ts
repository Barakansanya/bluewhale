// ============================================
// FILE: server/src/routes/sync.routes.ts
// ============================================
import { Router, Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { successResponse, errorResponse } from '../utils/response.utils';

const router = Router();
const syncService = new SyncService();

// Sync single company (no auth for testing)
router.post('/company/:ticker', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    const result = await syncService.syncCompanyData(ticker.toUpperCase());
    
    if (result.success) {
      return successResponse(res, result, 'Company data synced successfully');
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Sync all companies (no auth for testing)
router.post('/all', async (req: Request, res: Response) => {
  try {
    const results = await syncService.syncAllCompanies();
    return successResponse(res, results, 'Bulk sync completed');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;