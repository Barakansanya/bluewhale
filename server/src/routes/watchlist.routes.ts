// ============================================
// FILE: server/src/routes/watchlist.routes.ts
// ============================================
import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const watchlistController = new WatchlistController();

// All watchlist routes require authentication
router.use(authenticate);

router.get('/', (req, res) => watchlistController.getWatchlists(req, res));
router.get('/default', (req, res) => watchlistController.getDefault(req, res));
router.post('/items', (req, res) => watchlistController.addItem(req, res));
router.delete('/items/:itemId', (req, res) => watchlistController.removeItem(req, res));
router.patch('/items/:itemId', (req, res) => watchlistController.updateItem(req, res));

export default router;