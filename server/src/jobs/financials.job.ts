// FILE: server/src/jobs/financials.job.ts
// STANDALONE — weekly cron to refresh financial statements for all companies.
// Runs every Sunday at 04:00 (one hour after the full price sync at 03:00).

import cron from 'node-cron';
import { syncAllFinancials } from '../services/financials.service';

export function startFinancialsJob(): void {
  // Run once on startup to populate the DB on first deploy
  console.log('📊 Running initial financials sync on startup...');
  syncAllFinancials()
    .then(() => console.log('✅ Startup financials sync complete'))
    .catch(err => console.error('❌ Startup financials sync failed:', err.message));

  // Weekly refresh — every Sunday at 04:00
  cron.schedule('0 4 * * 0', () => {
    console.log('📅 Weekly financials sync starting (Sunday 04:00)...');
    syncAllFinancials()
      .then(() => console.log('✅ Weekly financials sync complete'))
      .catch(err => console.error('❌ Weekly financials sync failed:', err.message));
  });

  console.log('📅 Financials job scheduled — every Sunday at 04:00');
}
