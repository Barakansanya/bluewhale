// FILE: server/src/services/sync.service.ts
import axios from 'axios';
import { prisma } from '../config/database';
import { env } from '../config/env';

export class SyncService {
  private fmpApiKey = env.FMP_API_KEY || process.env.FMP_API_KEY;
  private fmpBaseUrl = 'https://financialmodelingprep.com/api/v3';

  async syncCompanyData(ticker: string) {
    try {
      console.log(`🔄 Syncing ${ticker}...`);

      // Get company from database
      const company = await prisma.company.findUnique({
        where: { ticker }
      });

      if (!company) {
        console.log(`❌ ${ticker} not found in database`);
        return { success: false, message: 'Company not found' };
      }

      // Fetch real-time quote from FMP
      const quoteUrl = `${this.fmpBaseUrl}/quote/${ticker}?apikey=${this.fmpApiKey}`;
      const quoteResponse = await axios.get(quoteUrl);
      const quote = quoteResponse.data[0];

      if (quote) {
        // Update company price data
        await prisma.company.update({
          where: { id: company.id },
          data: {
            lastPrice: quote.price || company.lastPrice,
            priceChangePercent: quote.changesPercentage || company.priceChangePercent,
            marketCap: quote.marketCap || company.marketCap,
            volume: quote.volume || company.volume,
            updatedAt: new Date()
          }
        });
      }

      // Fetch key metrics - using metrics (not companyMetrics)
      const metricsUrl = `${this.fmpBaseUrl}/key-metrics/${ticker}?period=annual&apikey=${this.fmpApiKey}`;
      const metricsResponse = await axios.get(metricsUrl);
      const metricsData = metricsResponse.data[0];

      if (metricsData) {
        // Check if metrics relation exists
        const metricsModel = (prisma as any).companyMetrics;
        
        if (metricsModel) {
          await metricsModel.upsert({
            where: { companyId: company.id },
            update: {
              peRatio: metricsData.peRatio || null,
              pbRatio: metricsData.pbRatio || null,
              psRatio: metricsData.priceToSalesRatio || null,
              roe: metricsData.roe ? metricsData.roe * 100 : null,
              roa: metricsData.roa ? metricsData.roa * 100 : null,
              currentRatio: metricsData.currentRatio || null,
              debtToEquity: metricsData.debtToEquity || null,
              dividendYield: metricsData.dividendYield ? metricsData.dividendYield * 100 : null,
              updatedAt: new Date()
            },
            create: {
              companyId: company.id,
              peRatio: metricsData.peRatio || null,
              pbRatio: metricsData.pbRatio || null,
              psRatio: metricsData.priceToSalesRatio || null,
              roe: metricsData.roe ? metricsData.roe * 100 : null,
              roa: metricsData.roa ? metricsData.roa * 100 : null,
              currentRatio: metricsData.currentRatio || null,
              debtToEquity: metricsData.debtToEquity || null,
              dividendYield: metricsData.dividendYield ? metricsData.dividendYield * 100 : null
            }
          });
        }
      }

      // Fetch historical prices (1 year)
      const historicalUrl = `${this.fmpBaseUrl}/historical-price-full/${ticker}?apikey=${this.fmpApiKey}`;
      const historicalResponse = await axios.get(historicalUrl);
      const historical = historicalResponse.data.historical;

      if (historical && historical.length > 0) {
        // Delete old historical data
        await prisma.historicalPrice.deleteMany({
          where: { companyId: company.id }
        });

        // Insert last 365 days
        const last365 = historical.slice(0, 365).map((day: any) => ({
          companyId: company.id,
          date: new Date(day.date),
          open: day.open,
          high: day.high,
          low: day.low,
          close: day.close,
          volume: BigInt(day.volume || 0)
        }));

        await prisma.historicalPrice.createMany({
          data: last365
        });
      }

      console.log(`✅ ${ticker} synced successfully`);
      return { success: true, message: `${ticker} synced` };

    } catch (error: any) {
      console.error(`❌ Error syncing ${ticker}:`, error.message);
      return { success: false, message: error.message };
    }
  }

  async syncAllCompanies() {
    console.log('🌊 Starting bulk sync for all companies...');
    
    const companies = await prisma.company.findMany({
      select: { ticker: true }
    });

    const results = {
      success: 0,
      failed: 0,
      total: companies.length
    };

    for (const company of companies) {
      const result = await this.syncCompanyData(company.ticker);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✨ Bulk sync complete: ${results.success}/${results.total} successful`);
    return results;
  }
}