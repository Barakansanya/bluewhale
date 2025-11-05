// ============================================
// FILE: server/src/services/watchlist.service.ts
// ============================================
import prisma from '../config/database';

export class WatchlistService {
  async getUserWatchlists(userId: string) {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            company: {
              include: {
                metrics: {
                  orderBy: { asOfDate: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return watchlists;
  }

  async getDefaultWatchlist(userId: string) {
    let watchlist = await prisma.watchlist.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      include: {
        items: {
          include: {
            company: {
              include: {
                metrics: {
                  orderBy: { asOfDate: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Create default watchlist if doesn't exist
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId,
          name: 'My Watchlist',
          isDefault: true,
        },
        include: {
          items: {
            include: {
              company: {
                include: {
                  metrics: {
                    orderBy: { asOfDate: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    return watchlist;
  }

  async addToWatchlist(userId: string, companyId: string, data?: { targetPrice?: number; notes?: string }) {
    // Get or create default watchlist
    const watchlist = await this.getDefaultWatchlist(userId);

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_companyId: {
          watchlistId: watchlist.id,
          companyId,
        },
      },
    });

    if (existing) {
      throw new Error('Company already in watchlist');
    }

    // Add to watchlist
    const item = await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        companyId,
        targetPrice: data?.targetPrice,
        notes: data?.notes,
      },
      include: {
        company: {
          include: {
            metrics: {
              orderBy: { asOfDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    return item;
  }

  async removeFromWatchlist(userId: string, itemId: string) {
    // Verify user owns this item
    const item = await prisma.watchlistItem.findUnique({
      where: { id: itemId },
      include: { watchlist: true },
    });

    if (!item || item.watchlist.userId !== userId) {
      throw new Error('Watchlist item not found');
    }

    await prisma.watchlistItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }

  async updateWatchlistItem(userId: string, itemId: string, data: { targetPrice?: number; notes?: string }) {
    // Verify user owns this item
    const item = await prisma.watchlistItem.findUnique({
      where: { id: itemId },
      include: { watchlist: true },
    });

    if (!item || item.watchlist.userId !== userId) {
      throw new Error('Watchlist item not found');
    }

    const updated = await prisma.watchlistItem.update({
      where: { id: itemId },
      data,
      include: {
        company: {
          include: {
            metrics: {
              orderBy: { asOfDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    return updated;
  }
}