// ============================================
// FILE: server/src/jobs/syncCron.ts
// ============================================
import cron from 'node-cron';
import { SyncService } from '../services/sync.service';

const syncService = new SyncService();

// Run every hour at minute 0
export const startSyncCron = () => {
  console.log('⏰ Scheduling hourly data sync...');
  
  cron.schedule('0 * * * *', async () => {
    console.log(`🕐 [${new Date().toISOString()}] Starting scheduled sync...`);
    try {
      await syncService.syncAllCompanies();
    } catch (error) {
      console.error('❌ Scheduled sync failed:', error);
    }
  });

  console.log('✅ Cron job scheduled: Runs every hour at minute 0');
};