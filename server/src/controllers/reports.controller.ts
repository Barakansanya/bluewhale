// server/src/controllers/reports.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { convertPDFToFormat } from '../services/pdfConverter.service';

// Helper to convert BigInt to string
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const {
      company,
      reportType,
      sector,
      year,
      search,
      sortBy = 'publishDate',
      order = 'desc',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (company) {
      const companyRecord = await prisma.company.findUnique({
        where: { ticker: company as string }
      });
      if (companyRecord) {
        where.companyId = companyRecord.id;
      }
    }

    if (reportType) {
      where.reportType = reportType;
    }

    if (year) {
      where.fiscalYear = parseInt(year as string);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { reportType: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Filter by sector
    if (sector) {
      const companiesInSector = await prisma.company.findMany({
        where: { sector: sector as any },
        select: { id: true }
      });
      where.companyId = {
        in: companiesInSector.map(c => c.id)
      };
    }

    // Get reports with company data
    const reports = await prisma.companyReport.findMany({
      where,
      include: {
        company: {
          select: {
            ticker: true,
            name: true,
            sector: true
          }
        }
      },
      orderBy: { [sortBy as string]: order },
      skip,
      take: limitNum
    });

    const total = await prisma.companyReport.count({ where });

    res.json({
      success: true,
      data: {
        reports: serializeBigInt(reports),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

export const getCompanyReports = async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    const { limit = '5' } = req.query;

    const company = await prisma.company.findUnique({
      where: { ticker: ticker.toUpperCase() }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const reports = await prisma.companyReport.findMany({
      where: { companyId: company.id },
      orderBy: { publishDate: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: serializeBigInt(reports)
    });
  } catch (error: any) {
    console.error('Get company reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company reports'
    });
  }
};

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    const report = await prisma.companyReport.findUnique({
      where: { id }
    });

    if (!report || !report.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Convert to requested format
    const result = await convertPDFToFormat(
      report.fileUrl,
      format as 'pdf' | 'excel' | 'csv',
      report.fileName || 'report.pdf'
    );

    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Conversion failed'
      });
    }

    // Set appropriate headers
    const mimeTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[format as keyof typeof mimeTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);

  } catch (error: any) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report'
    });
  }
};

export const getReportFilters = async (req: Request, res: Response) => {
  try {
    // Get unique values for filters
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        ticker: true,
        name: true,
        sector: true
      },
      orderBy: { name: 'asc' }
    });

    const reportTypes = await prisma.companyReport.findMany({
      select: { reportType: true },
      distinct: ['reportType']
    });

    const years = await prisma.companyReport.findMany({
      select: { fiscalYear: true },
      distinct: ['fiscalYear'],
      orderBy: { fiscalYear: 'desc' }
    });

    const sectors = [...new Set(companies.map(c => c.sector))];

    res.json({
      success: true,
      data: {
        companies: companies.map(c => ({ ticker: c.ticker, name: c.name })),
        reportTypes: reportTypes.map(r => r.reportType).filter(Boolean),
        years: years.map(y => y.fiscalYear).filter(Boolean),
        sectors: sectors
      }
    });
  } catch (error: any) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters'
    });
  }
};