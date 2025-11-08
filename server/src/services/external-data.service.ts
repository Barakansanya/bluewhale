// ============================================
// FILE: server/src/services/external-data.service.ts
// ============================================
import axios from 'axios';

const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'; // Get free key from financialmodelingprep.com
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  price: number;
  changes: number;
  changesPercentage: number;
  currency: string;
  exchange: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  website: string;
  image: string;
  ipoDate: string;
  marketCap: number;
  volume: number;
  beta: number;
}

interface FMPFinancialRatios {
  symbol: string;
  date: string;
  currentRatio: number;
  quickRatio: number;
  debtEquityRatio: number;
  debtRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  priceToBookRatio: number;
  priceEarningsRatio: number;
  priceToSalesRatio: number;
  dividendYield: number;
  payoutRatio: number;
}

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
}

export class ExternalDataService {
  // ============================================
  // FMP - Company Profile & Fundamentals
  // ============================================
  
  async getCompanyProfile(symbol: string): Promise<FMPCompanyProfile | null> {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`
      );
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  }

  async getFinancialRatios(symbol: string): Promise<FMPFinancialRatios | null> {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/ratios/${symbol}?apikey=${FMP_API_KEY}&limit=1`
      );
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error fetching ratios for ${symbol}:`, error);
      return null;
    }
  }

  async getKeyMetrics(symbol: string) {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/key-metrics/${symbol}?apikey=${FMP_API_KEY}&limit=1`
      );
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error fetching key metrics for ${symbol}:`, error);
      return null;
    }
  }

  async getIncomeStatement(symbol: string, period: 'annual' | 'quarter' = 'annual') {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/income-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}&limit=5`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching income statement for ${symbol}:`, error);
      return [];
    }
  }

  async getBalanceSheet(symbol: string, period: 'annual' | 'quarter' = 'annual') {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/balance-sheet-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}&limit=5`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching balance sheet for ${symbol}:`, error);
      return [];
    }
  }

  async getCashFlowStatement(symbol: string, period: 'annual' | 'quarter' = 'annual') {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/cash-flow-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}&limit=5`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching cash flow for ${symbol}:`, error);
      return [];
    }
  }

  // ============================================
  // Yahoo Finance - Real-time Prices
  // ============================================

  async getYahooQuote(symbol: string): Promise<YahooQuote | null> {
    try {
      // Using Yahoo Finance unofficial API (free)
      // For production, consider using RapidAPI's Yahoo Finance endpoint
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: '1d',
          },
        }
      );

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        symbol: meta.symbol,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketChange: meta.regularMarketPrice - meta.previousClose,
        regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        regularMarketVolume: quote.volume[quote.volume.length - 1],
        regularMarketDayHigh: meta.regularMarketDayHigh,
        regularMarketDayLow: meta.regularMarketDayLow,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        marketCap: meta.marketCap || 0,
      };
    } catch (error) {
      console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalPrices(symbol: string, range: string = '1y') {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: range, // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
          },
        }
      );

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000),
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index],
      }));
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  }

  // ============================================
  // Combined Data Sync
  // ============================================

  async syncCompanyData(ticker: string) {
    console.log(`🔄 Syncing data for ${ticker}...`);

    try {
      // Fetch from both sources
      const [profile, ratios, yahooQuote] = await Promise.all([
        this.getCompanyProfile(ticker),
        this.getFinancialRatios(ticker),
        this.getYahooQuote(ticker),
      ]);

      if (!profile && !yahooQuote) {
        throw new Error(`No data found for ticker: ${ticker}`);
      }

      // Combine data
      const combinedData = {
        // Company basics (prefer FMP, fallback to Yahoo)
        ticker: ticker,
        name: profile?.companyName || ticker,
        sector: profile?.sector || 'OTHER',
        industry: profile?.industry || '',
        description: profile?.description || '',
        website: profile?.website || '',
        logoUrl: profile?.image || '',
        
        // Price data (prefer Yahoo for real-time)
        lastPrice: yahooQuote?.regularMarketPrice || profile?.price || 0,
        priceChange: yahooQuote?.regularMarketChange || profile?.changes || 0,
        priceChangePercent: yahooQuote?.regularMarketChangePercent || profile?.changesPercentage || 0,
        volume: yahooQuote?.regularMarketVolume || profile?.volume || 0,
        
        // Market data
        marketCap: yahooQuote?.marketCap || profile?.marketCap || 0,
        
        // Financial ratios (from FMP)
        metrics: ratios ? {
          peRatio: ratios.priceEarningsRatio,
          pbRatio: ratios.priceToBookRatio,
          psRatio: ratios.priceToSalesRatio,
          dividendYield: ratios.dividendYield * 100, // Convert to percentage
          roe: ratios.returnOnEquity * 100,
          roa: ratios.returnOnAssets * 100,
          currentRatio: ratios.currentRatio,
          quickRatio: ratios.quickRatio,
          debtToEquity: ratios.debtEquityRatio,
          grossMargin: ratios.grossProfitMargin * 100,
          operatingMargin: ratios.operatingProfitMargin * 100,
          netMargin: ratios.netProfitMargin * 100,
        } : null,
      };

      console.log(`✅ Successfully synced data for ${ticker}`);
      return combinedData;
    } catch (error: any) {
      console.error(`❌ Error syncing ${ticker}:`, error.message);
      throw error;
    }
  }

  // ============================================
  // JSE-specific ticker mapping
  // ============================================

  private jseToYahooMapping: { [key: string]: string } = {
    'APN': 'APN.JO',  // Aspen Pharmacare
    'NPN': 'NPN.JO',  // Naspers
    'SHP': 'SHP.JO',  // Shoprite
    'CPI': 'CPI.JO',  // Capitec
    'SOL': 'SOL.JO',  // Sasol
    'MTN': 'MTN.JO',  // MTN Group
    'AGL': 'AGL.JO',  // Anglo Platinum
    'NPH': 'NPH.JO',  // Northam Platinum
    'GFI': 'GFI.JO',  // Gold Fields
    'SBK': 'SBK.JO',  // Standard Bank
    'FSR': 'FSR.JO',  // FirstRand
    'VOD': 'VOD.JO',  // Vodacom
    'TBS': 'TBS.JO',  // Tiger Brands
    'AMS': 'AMS.JO',  // Anglo American
    'BHP': 'BHP.JO',  // BHP Group
  };

  getYahooTicker(jseTicker: string): string {
    return this.jseToYahooMapping[jseTicker] || `${jseTicker}.JO`;
  }
}