// ============================================
// server/src/cron/scraperJobs.ts
// ============================================
import cron from 'node-cron';
import scraperService from '../services/scraper.service';

export const startScraperJobs = () => {
  // Daily scrape at 2 AM (South African time - SAST)
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Daily scraper job triggered at 2:00 AM SAST');
    
    try {
      await scraperService.scrapeAllCompanies();
      console.log('✅ Daily scrape completed successfully');
    } catch (error) {
      console.error('❌ Daily scrape failed:', error);
    }
  }, {
    timezone: 'Africa/Johannesburg'
  });

  console.log('✅ Scraper cron job scheduled: Daily at 2:00 AM SAST');
};