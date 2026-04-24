// server/src/jobs/scraper.cron.ts

import cron from 'node-cron';
import { scrapeAllCompanies } from '../services/scraper.service';

export function startScraperCron() {
  // Run daily at 6 AM (after JSE market closes and data is available)
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Daily scraper cron job triggered at 6 AM');
    
    try {
      await scrapeAllCompanies();
      console.log('✅ Daily scraping complete');
    } catch (error) {
      console.error('❌ Daily scraping failed:', error);
    }
  });

  // Also run on weekdays at market close (5 PM)
  cron.schedule('0 17 * * 1-5', async () => {
    console.log('⏰ Market close scraper triggered at 5 PM');
    
    try {
      await scrapeAllCompanies();
      console.log('✅ Market close scraping complete');
    } catch (error) {
      console.error('❌ Market close scraping failed:', error);
    }
  });

  console.log('✅ Scraper cron jobs scheduled:');
  console.log('   - Daily at 6 AM (post-market data)');
  console.log('   - Weekdays at 5 PM (market close)');
}