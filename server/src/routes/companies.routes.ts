// ============================================
// FILE: server/src/routes/companies.routes.ts
// ============================================
import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';

const router = Router();
const companiesController = new CompaniesController();

// Public routes (no auth required for now)
router.get('/', (req, res) => companiesController.getAll(req, res));
router.get('/search', (req, res) => companiesController.search(req, res));
router.get('/ticker/:ticker', (req, res) => companiesController.getByTicker(req, res));
router.get('/:id', (req, res) => companiesController.getById(req, res));

export default router;