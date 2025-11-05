// ============================================
// FILE: server/src/controllers/watchlist.controller.ts
// ============================================
import { Request, Response } from 'express';
import { WatchlistService } from '../services/watchlist.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const watchlistService = new WatchlistService();

export class WatchlistController {
  async getWatchlists(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const watchlists = await watchlistService.getUserWatchlists(userId);
      sendSuccess(res, watchlists);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getDefault(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const watchlist = await watchlistService.getDefaultWatchlist(userId);
      sendSuccess(res, watchlist);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { companyId, targetPrice, notes } = req.body;

      if (!companyId) {
        sendError(res, 'Company ID is required', 400);
        return;
      }

      const item = await watchlistService.addToWatchlist(userId, companyId, {
        targetPrice,
        notes,
      });

      sendSuccess(res, item, 'Added to watchlist', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;

      await watchlistService.removeFromWatchlist(userId, itemId);
      sendSuccess(res, null, 'Removed from watchlist');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const { targetPrice, notes } = req.body;

      const updated = await watchlistService.updateWatchlistItem(userId, itemId, {
        targetPrice,
        notes,
      });

      sendSuccess(res, updated, 'Watchlist item updated');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
}