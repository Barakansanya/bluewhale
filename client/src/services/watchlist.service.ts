// ============================================
// FILE: client/src/services/watchlist.service.ts
// ============================================
import { api } from './api';
import { Watchlist, WatchlistItem } from '../types';

export const watchlistService = {
  async getAll(): Promise<Watchlist[]> {
    const response = await api.get<{ data: Watchlist[] }>('/watchlist');
    return response.data.data;
  },

  async getById(id: string): Promise<Watchlist> {
    const response = await api.get<{ data: Watchlist }>(`/watchlist/${id}`);
    return response.data.data;
  },

  async getDefault(): Promise<Watchlist> {
    const response = await api.get<{ data: Watchlist }>('/watchlist/default');
    return response.data.data;
  },

  async create(data: { name: string; description?: string }): Promise<Watchlist> {
    const response = await api.post<{ data: Watchlist }>('/watchlist', data);
    return response.data.data;
  },

  async addCompany(
    watchlistId: string,
    companyId: string,
    data?: { targetPrice?: number; notes?: string }
  ): Promise<WatchlistItem> {
    const response = await api.post<{ data: WatchlistItem }>(
      `/watchlist/${watchlistId}/items`,
      { companyId, ...data }
    );
    return response.data.data;
  },

  async removeCompany(watchlistId: string, itemId: string): Promise<void> {
    await api.delete(`/watchlist/${watchlistId}/items/${itemId}`);
  },

  async updateItem(
    watchlistId: string,
    itemId: string,
    data: { targetPrice?: number; notes?: string }
  ): Promise<WatchlistItem> {
    const response = await api.patch<{ data: WatchlistItem }>(
      `/watchlist/${watchlistId}/items/${itemId}`,
      data
    );
    return response.data.data;
  },

  async delete(watchlistId: string): Promise<void> {
    await api.delete(`/watchlist/${watchlistId}`);
  },
};