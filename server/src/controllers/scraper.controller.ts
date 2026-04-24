// server/src/controllers/scraper.controller.ts

import { Request, Response } from 'express';
import { scrapeCompanyData, scrapeAllCompanies, scrapeSENSAnnouncements } from '../services/scraper.service';

export const scrapeCompany = async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    
    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: 'Ticker is required'
      });
    }

    const data = await scrapeCompanyData(ticker.toUpperCase());

    return res.status(200).json({
      success: true,
      data,
      message: `${ticker} scraped successfully`
    });
  } catch (error: any) {
    console.error('Scrape company error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to scrape company'
    });
  }
};

export const scrapeAll = async (req: Request, res: Response) => {
  try {
    // Run in background
    scrapeAllCompanies().catch(err => {
      console.error('Bulk scrape error:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'Bulk scrape started in background. Check server logs for progress.'
    });
  } catch (error: any) {
    console.error('Scrape all error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to start bulk scrape'
    });
  }
};

export const getSENS = async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    
    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: 'Ticker is required'
      });
    }

    const result = await scrapeSENSAnnouncements(ticker.toUpperCase());

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to scrape SENS'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: `SENS announcements for ${ticker} retrieved`
    });
  } catch (error: any) {
    console.error('SENS scrape error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to scrape SENS'
    });
  }
};