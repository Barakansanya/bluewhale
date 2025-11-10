// ============================================
// FILE: server/src/services/reports.service.ts
// ============================================
import prisma from '../config/database';

interface ReportsFilters {
  companyId?: string;
  reportType?: string;
  fiscalYear?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class ReportsService {
  async getAll(filters: ReportsFilters = {}) {
    const {
      companyId,
      reportType,
      fiscalYear,
      search,
      page = 1,
      limit = 20,
    } = filters;

    try {
      // Build where clause manually to avoid issues
      const where: any = {};
      
      if (companyId) where.companyId = companyId;
      if (reportType) where.reportType = reportType;
      if (fiscalYear) where.fiscalYear = fiscalYear;
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
        ];
      }

      const reports = await prisma.companyReport.findMany({
        where,
        include: {
          company: true, // Include entire company object
        },
        orderBy: {
          publishDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.companyReport.count({ where });

      // Format the response to only include needed company fields
      const formattedReports = reports.map(report => ({
        ...report,
        company: {
          id: report.company.id,
          ticker: report.company.ticker,
          name: report.company.name,
          sector: report.company.sector,
        }
      }));

      return {
        reports: formattedReports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in ReportsService.getAll:', error);
      throw error;
    }
  }

  async getById(id: string) {
    const report = await prisma.companyReport.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async create(data: {
    companyId: string;
    title: string;
    reportType: string;
    fiscalYear?: number;
    publishDate: Date;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    summary?: string;
    keyPoints?: string[];
  }) {
    const report = await prisma.companyReport.create({
      data,
      include: {
        company: true,
      },
    });

    return report;
  }

  async saveReport(userId: string, reportId: string, notes?: string) {
    const saved = await prisma.savedReport.create({
      data: {
        userId,
        reportId,
        notes,
      },
    });

    return saved;
  }

  async getUserSavedReports(userId: string) {
    const savedReports = await prisma.savedReport.findMany({
      where: { userId },
      include: {
        report: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return savedReports;
  }

  async removeSavedReport(userId: string, reportId: string) {
    await prisma.savedReport.deleteMany({
      where: {
        userId,
        reportId,
      },
    });
  }
}