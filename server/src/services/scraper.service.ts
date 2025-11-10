// server/src/services/scraper.service.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../config/database';
import pdfParse from 'pdf-parse';

interface ScrapedData {
  ticker: string;
  financials?: any;
  metrics?: any;
  news?: any[];
  reports?: any[];
  error?: string;
}

class ScraperService {
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private readonly REQUEST_DELAY = 2000; // 2 seconds between requests
  
  // JSE-listed companies investor relations URLs
  private readonly COMPANY_IR_URLS: Record<string, string> = {
    'NPN': 'https://www.naspers.com/investors',
    'APN': 'https://www.aspenpharma.com/investors',
    'CPI': 'https://www.capitecbank.co.za/investors',
    'FSR': 'https://www.firstrand.co.za/investors',
    'SBK': 'https://www.standardbank.com/sbg/standard-bank-group/investor-relations',
    'NED': 'https://www.nedbank.co.za/content/nedbank/desktop/gt/en/investorrelations.html',
    'ABG': 'https://www.absa.africa/absaafrica/investor-relations/',
    'GFI': 'https://www.goldfields.com/investors.php',
    'AGL': 'https://www.anglogoldashanti.com/investors/',
    'SOL': 'https://www.sasol.com/investor-centre',
    'BTI': 'https://www.bat.com/group/sites/UK__9D9KCY.nsf/vwPagesWebLive/DOAWWGJV',
    'SHP': 'https://www.shoprite.co.za/pages/investor-relations.html',
    'PIK': 'https://www.picknpay.co.za/investor-relations',
    'WHL': 'https://www.woolworthsholdings.co.za/investors/',
    'MRP': 'https://www.mrpricegroup.com/investor-centre'
  };

  // Scrape company financial data from primary source
  async scrapeCompanyData(ticker: string): Promise<ScrapedData> {
    console.log(`🕷️ Starting scrape for ${ticker}...`);
    
    try {
      const url = this.COMPANY_IR_URLS[ticker];
      
      if (!url) {
        console.log(`⚠️ No IR URL configured for ${ticker}, falling back to API`);
        return await this.fallbackToAPI(ticker);
      }

      // Scrape the investor relations page
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      
      const scrapedData: ScrapedData = {
        ticker,
        financials: await this.extractFinancials($, url),
        metrics: await this.extractMetrics($),
        news: await this.extractNews($),
        reports: await this.extractReports($, url)
      };

      console.log(`✅ Successfully scraped ${ticker}`);
      return scrapedData;
      
    } catch (error: any) {
      console.error(`❌ Scraping failed for ${ticker}:`, error.message);
      
      // Fallback to API on scraping failure
      return await this.fallbackToAPI(ticker);
    }
  }

  // Fetch HTML page with proper headers
  private async fetchPage(url: string): Promise<string> {
    await this.delay(this.REQUEST_DELAY);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000
    });
    
    return response.data;
  }

  // Extract financial statements from page
  private async extractFinancials($: cheerio.CheerioAPI, baseUrl: string): Promise<any> {
    const financials: any = {
      revenue: null,
      netIncome: null,
      assets: null,
      liabilities: null,
      equity: null
    };

    // Look for financial tables
    $('table').each((i, table) => {
      const $table = $(table);
      const text = $table.text().toLowerCase();
      
      // Revenue detection
      if (text.includes('revenue') || text.includes('turnover')) {
        const revenue = this.extractNumber($table.text());
        if (revenue) financials.revenue = revenue;
      }
      
      // Net income detection
      if (text.includes('net income') || text.includes('profit')) {
        const netIncome = this.extractNumber($table.text());
        if (netIncome) financials.netIncome = netIncome;
      }
      
      // Balance sheet items
      if (text.includes('total assets')) {
        const assets = this.extractNumber($table.text());
        if (assets) financials.assets = assets;
      }
      
      if (text.includes('total liabilities')) {
        const liabilities = this.extractNumber($table.text());
        if (liabilities) financials.liabilities = liabilities;
      }
      
      if (text.includes('total equity') || text.includes('shareholders equity')) {
        const equity = this.extractNumber($table.text());
        if (equity) financials.equity = equity;
      }
    });

    return financials;
  }

  // Extract key metrics from page
  private async extractMetrics($: cheerio.CheerioAPI): Promise<any> {
    const metrics: any = {
      pe: null,
      pb: null,
      roe: null,
      roa: null,
      debtToEquity: null
    };

    // Look for metrics in various formats
    $('div, section, table').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      
      if (text.includes('p/e ratio') || text.includes('pe ratio')) {
        const pe = this.extractNumber(text);
        if (pe && pe > 0 && pe < 1000) metrics.pe = pe;
      }
      
      if (text.includes('price to book') || text.includes('p/b ratio')) {
        const pb = this.extractNumber(text);
        if (pb && pb > 0 && pb < 100) metrics.pb = pb;
      }
      
      if (text.includes('roe') || text.includes('return on equity')) {
        const roe = this.extractNumber(text);
        if (roe && roe > -100 && roe < 100) metrics.roe = roe;
      }
      
      if (text.includes('roa') || text.includes('return on assets')) {
        const roa = this.extractNumber(text);
        if (roa && roa > -100 && roa < 100) metrics.roa = roa;
      }
      
      if (text.includes('debt to equity') || text.includes('d/e ratio')) {
        const de = this.extractNumber(text);
        if (de && de >= 0 && de < 10) metrics.debtToEquity = de;
      }
    });

    return metrics;
  }

  // Extract news/announcements
  private async extractNews($: cheerio.CheerioAPI): Promise<any[]> {
    const news: any[] = [];
    
    // Look for news sections
    $('article, .news-item, .announcement').each((i, elem) => {
      const $elem = $(elem);
      const title = $elem.find('h2, h3, .title').first().text().trim();
      const date = $elem.find('.date, time').first().text().trim();
      const link = $elem.find('a').first().attr('href');
      
      if (title) {
        news.push({
          title,
          date: date || new Date().toISOString(),
          link: link || '#'
        });
      }
    });
    
    return news.slice(0, 5); // Return latest 5 news items
  }

  // Extract report links
  private async extractReports($: cheerio.CheerioAPI, baseUrl: string): Promise<any[]> {
    const reports: any[] = [];
    
    // Look for PDF links
    $('a[href$=".pdf"]').each((i, elem) => {
      const $link = $(elem);
      const title = $link.text().trim();
      const href = $link.attr('href');
      
      if (href && (title.toLowerCase().includes('annual') || 
                   title.toLowerCase().includes('interim') ||
                   title.toLowerCase().includes('financial'))) {
        
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        
        reports.push({
          title,
          url: fullUrl,
          type: title.toLowerCase().includes('annual') ? 'ANNUAL' : 'INTERIM'
        });
      }
    });
    
    return reports;
  }

  // Extract numbers from text (handles millions/billions notation)
  private extractNumber(text: string): number | null {
    // Remove common text, keep only numbers
    const cleaned = text.replace(/[^\d.\-,mMbB]/g, '');
    
    // Match patterns like "123.45M" or "1.23B"
    const match = cleaned.match(/([\d.,]+)\s*([mMbB])?/);
    
    if (match) {
      let num = parseFloat(match[1].replace(/,/g, ''));
      
      // Handle millions/billions
      if (match[2]) {
        const multiplier = match[2].toLowerCase();
        if (multiplier === 'm') num *= 1_000_000;
        if (multiplier === 'b') num *= 1_000_000_000;
      }
      
      return num;
    }
    
    return null;
  }

  // Fallback to FMP API when scraping fails
  private async fallbackToAPI(ticker: string): Promise<ScrapedData> {
    console.log(`🔄 Using API fallback for ${ticker}...`);
    
    const FMP_KEY = process.env.FMP_API_KEY;
    if (!FMP_KEY) {
      throw new Error('FMP_API_KEY not configured');
    }

    try {
      // Fetch from FMP API
      const [profile, metrics, financials] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}.JO?apikey=${FMP_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/key-metrics/${ticker}.JO?apikey=${FMP_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}.JO?apikey=${FMP_KEY}`)
      ]);

      const profileData = profile.data[0] || {};
      const metricsData = metrics.data[0] || {};
      const financialsData = financials.data[0] || {};

      return {
        ticker,
        financials: {
          revenue: financialsData.revenue,
          netIncome: financialsData.netIncome,
          assets: metricsData.totalAssets,
          liabilities: metricsData.totalLiabilities,
          equity: metricsData.totalEquity
        },
        metrics: {
          pe: metricsData.peRatio,
          pb: metricsData.pbRatio,
          roe: metricsData.roe,
          roa: metricsData.roa,
          debtToEquity: metricsData.debtToEquity
        }
      };
      
    } catch (error: any) {
      console.error(`❌ API fallback failed for ${ticker}:`, error.message);
      return { ticker, error: error.message };
    }
  }

  // Save scraped data to database
  async saveScrapedData(data: ScrapedData): Promise<void> {
    const { ticker, financials, metrics, news, reports } = data;

    // Update company metrics
    if (metrics) {
      await prisma.companyMetrics.upsert({
        where: { 
          companyId_metricDate: {
            companyId: (await prisma.company.findUnique({ where: { ticker } }))!.id,
            metricDate: new Date()
          }
        },
        create: {
          company: { connect: { ticker } },
          metricDate: new Date(),
          peRatio: metrics.pe,
          pbRatio: metrics.pb,
          roe: metrics.roe,
          roa: metrics.roa,
          debtToEquity: metrics.debtToEquity
        },
        update: {
          peRatio: metrics.pe,
          pbRatio: metrics.pb,
          roe: metrics.roe,
          roa: metrics.roa,
          debtToEquity: metrics.debtToEquity
        }
      });
    }

    // Save reports if found
    if (reports && reports.length > 0) {
      for (const report of reports) {
        await prisma.companyReport.create({
          data: {
            company: { connect: { ticker } },
            title: report.title,
            reportType: report.type,
            fileUrl: report.url,
            publishDate: new Date()
          }
        });
      }
    }

    console.log(`💾 Saved scraped data for ${ticker}`);
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Scrape all companies
  async scrapeAllCompanies(): Promise<void> {
    const companies = await prisma.company.findMany({
      select: { ticker: true }
    });

    console.log(`🕷️ Starting bulk scrape for ${companies.length} companies...`);

    for (const company of companies) {
      try {
        const data = await this.scrapeCompanyData(company.ticker);
        await this.saveScrapedData(data);
        console.log(`✅ ${company.ticker} complete`);
      } catch (error: any) {
        console.error(`❌ Failed to process ${company.ticker}:`, error.message);
      }
    }

    console.log(`✨ Bulk scrape complete!`);
  }
}

export default new ScraperService();