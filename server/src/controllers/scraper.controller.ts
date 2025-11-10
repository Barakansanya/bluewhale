// server/src/controllers/scraper.controller.ts
import { Request, Response } from 'express';
import scraperService from '../services/scraper.service';

export const scrapeCompany = async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    
    console.log(`🔄 Manual scrape requested for ${ticker}`);
    
    const data = await scraperService.scrapeCompanyData(ticker);
    await scraperService.saveScrapedData(data);
    
    res.json({
      success: true,
      message: `Successfully scraped ${ticker}`,
      data
    });
    
  } catch (error: any) {
    console.error('❌ Scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const scrapeAll = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Bulk scrape requested');
    
    // Run in background
    scraperService.scrapeAllCompanies().catch(console.error);
    
    res.json({
      success: true,
      message: 'Bulk scrape started in background'
    });
    
  } catch (error: any) {
    console.error('❌ Bulk scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};