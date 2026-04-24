// ================================
// server/src/routes/scraper.routes.ts
// ================================

import { Router } from 'express';
import { scrapeCompany, scrapeAll, getSENS } from '../controllers/scraper.controller';

const router = Router();

// Scrape single company
router.post('/company/:ticker', scrapeCompany);

// Scrape all companies (runs in background)
router.post('/all', scrapeAll);

// Get SENS announcements for a company
router.get('/sens/:ticker', getSENS);

export default router;