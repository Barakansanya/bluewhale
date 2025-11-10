// ============================================
// server/src/routes/scraper.routes.ts
// ============================================
import { Router } from 'express';
import { scrapeCompany, scrapeAll } from '../controllers/scraper.controller';

const router = Router();

// Scrape single company
router.post('/company/:ticker', scrapeCompany);

// Scrape all companies
router.post('/all', scrapeAll);

export default router;