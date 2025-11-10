// ============================================
// FILE: server/src/services/companies.service.ts
// ============================================
import prisma from '../config/database';
import { Prisma, Sector } from '@prisma/client';

interface ScreenerFilters {
  sector?: Sector;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export class CompaniesService {
  async getAll(filters: ScreenerFilters = {}) {
    const {
      sector,
      minMarketCap,
      maxMarketCap,
      minPE,
      maxPE,
      minDividendYield,
      maxDividendYield,
      sortBy = 'marketCap',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
      search,
    } = filters;

    const where: Prisma.CompanyWhereInput = {
      isActive: true,
      ...(sector && { sector }),
      ...(minMarketCap && { marketCap: { gte: minMarketCap } }),
      ...(maxMarketCap && { marketCap: { lte: maxMarketCap } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { ticker: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get companies with their metrics
    const companies = await prisma.company.findMany({
      where,
      include: {
        metrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by PE and Dividend Yield if needed (since these are in metrics)
    let filteredCompanies = companies;

    if (minPE || maxPE || minDividendYield || maxDividendYield) {
      filteredCompanies = companies.filter((company) => {
        const metric = company.metrics[0];
        if (!metric) return false;

        if (minPE && (!metric.peRatio || metric.peRatio < minPE)) return false;
        if (maxPE && (!metric.peRatio || metric.peRatio > maxPE)) return false;
        if (minDividendYield && (!metric.dividendYield || metric.dividendYield < minDividendYield)) return false;
        if (maxDividendYield && (!metric.dividendYield || metric.dividendYield > maxDividendYield)) return false;

        return true;
      });
    }

    // Format response - flatten metrics
    const formattedCompanies = filteredCompanies.map((company) => ({
      ...company,
      metrics: company.metrics[0] || null,
    }));

    const total = await prisma.company.count({ where });

    return {
      companies: formattedCompanies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1,
        },
        financials: {
          orderBy: { fiscalYear: 'desc' },
          take: 5,
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return {
      ...company,
      metrics: company.metrics[0] || null,
    };
  }

  async getCompanyByTicker(ticker: string) {
    const company = await prisma.company.findUnique({
      where: { ticker: ticker.toUpperCase() },
      include: {
        metrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1
        },
        historicalPrices: {
          orderBy: { date: 'desc' },
          take: 365 // Last year of data
        }
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Convert Decimals to numbers for JSON serialization
    const converted: any = {
      ...company,
      marketCap: company.marketCap ? Number(company.marketCap) : null,
      lastPrice: company.lastPrice ? Number(company.lastPrice) : null,
      priceChange: company.priceChange ? Number(company.priceChange) : null,
      priceChangePercent: company.priceChangePercent ? Number(company.priceChangePercent) : null,
      volume: company.volume ? Number(company.volume) : null,
      metrics: company.metrics[0] ? {
        ...company.metrics[0],
        peRatio: company.metrics[0].peRatio ? Number(company.metrics[0].peRatio) : null,
        pbRatio: company.metrics[0].pbRatio ? Number(company.metrics[0].pbRatio) : null,
        psRatio: company.metrics[0].psRatio ? Number(company.metrics[0].psRatio) : null,
        evToEbitda: company.metrics[0].evToEbitda ? Number(company.metrics[0].evToEbitda) : null,
        roe: company.metrics[0].roe ? Number(company.metrics[0].roe) : null,
        roa: company.metrics[0].roa ? Number(company.metrics[0].roa) : null,
        roic: company.metrics[0].roic ? Number(company.metrics[0].roic) : null,
        grossMargin: company.metrics[0].grossMargin ? Number(company.metrics[0].grossMargin) : null,
        operatingMargin: company.metrics[0].operatingMargin ? Number(company.metrics[0].operatingMargin) : null,
        netMargin: company.metrics[0].netMargin ? Number(company.metrics[0].netMargin) : null,
        currentRatio: company.metrics[0].currentRatio ? Number(company.metrics[0].currentRatio) : null,
        quickRatio: company.metrics[0].quickRatio ? Number(company.metrics[0].quickRatio) : null,
        debtToEquity: company.metrics[0].debtToEquity ? Number(company.metrics[0].debtToEquity) : null,
        dividendYield: company.metrics[0].dividendYield ? Number(company.metrics[0].dividendYield) : null,
      } : null,
      historicalPrices: company.historicalPrices.map(price => ({
        ...price,
        volume: Number(price.volume),
      })),
    };

    return converted;
  }

  async getByTicker(ticker: string) {
    // This is just an alias for getCompanyByTicker
    return this.getCompanyByTicker(ticker);
  }

  async search(query: string) {
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { ticker: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    return companies;
  }
}