// ============================================
// FILE: server/src/controllers/reports.controller.ts
// ============================================
import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';

const reportsService = new ReportsService();

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const filters = {
      companyId: req.query.companyId as string,
      reportType: req.query.reportType as string,
      fiscalYear: req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await reportsService.getAll(filters);
    
    // Convert BigInts in company data to numbers for JSON serialization
    const sanitized = {
      ...result,
      reports: result.reports.map(report => ({
        ...report,
        company: {
          ...report.company,
          volume: report.company.volume ? Number(report.company.volume) : null,
          marketCap: report.company.marketCap ? Number(report.company.marketCap) : null,
          lastPrice: report.company.lastPrice ? Number(report.company.lastPrice) : null,
          priceChange: report.company.priceChange ? Number(report.company.priceChange) : null,
          priceChangePercent: report.company.priceChangePercent ? Number(report.company.priceChangePercent) : null,
        }
      }))
    };
    
    return res.status(200).json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error in getAllReports:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await reportsService.getById(id);
    return res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const report = await reportsService.create(req.body);
    return res.status(201).json({ success: true, data: report, message: 'Report created successfully' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const saveReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { reportId, notes } = req.body;
    
    const saved = await reportsService.saveReport(userId, reportId, notes);
    return res.status(200).json({ success: true, data: saved, message: 'Report saved' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getSavedReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const reports = await reportsService.getUserSavedReports(userId);
    return res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const removeSavedReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    await reportsService.removeSavedReport(userId, id);
    return res.status(200).json({ success: true, data: null, message: 'Report removed from saved' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
