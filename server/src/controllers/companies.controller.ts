// ============================================
// FILE: server/src/controllers/companies.controller.ts
// ============================================
import { Request, Response } from 'express';
import { CompaniesService } from '../services/companies.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const companiesService = new CompaniesService();

export class CompaniesController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        sector: req.query.sector as any,
        minMarketCap: req.query.minMarketCap ? Number(req.query.minMarketCap) : undefined,
        maxMarketCap: req.query.maxMarketCap ? Number(req.query.maxMarketCap) : undefined,
        minPE: req.query.minPE ? Number(req.query.minPE) : undefined,
        maxPE: req.query.maxPE ? Number(req.query.maxPE) : undefined,
        minDividendYield: req.query.minDividendYield ? Number(req.query.minDividendYield) : undefined,
        maxDividendYield: req.query.maxDividendYield ? Number(req.query.maxDividendYield) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
      };

      const result = await companiesService.getAll(filters);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const company = await companiesService.getById(req.params.id);
      sendSuccess(res, company);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getByTicker(req: Request, res: Response): Promise<void> {
    try {
      const company = await companiesService.getByTicker(req.params.ticker);
      sendSuccess(res, company);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) {
        sendError(res, 'Search query is required', 400);
        return;
      }

      const companies = await companiesService.search(query);
      sendSuccess(res, companies);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}