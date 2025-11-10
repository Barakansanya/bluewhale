// ============================================
// FILE: server/src/controllers/sync.controller.ts
// ============================================
import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { successResponse, errorResponse } from '../utils/response.utils';

const syncService = new SyncService();

export const syncCompanyController = async (req: Request, res: Response) => {
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
};

export const syncAllCompaniesController = async (req: Request, res: Response) => {
  try {
    const results = await syncService.syncAllCompanies();
    return successResponse(res, results, 'Bulk sync completed');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};