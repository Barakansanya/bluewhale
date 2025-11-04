// ============================================
// FILE: client/src/hooks/useWatchlist.ts
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService } from '../services/watchlist.service';

export const useWatchlists = () => {
  return useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getAll(),
  });
};

export const useDefaultWatchlist = () => {
  return useQuery({
    queryKey: ['watchlist', 'default'],
    queryFn: () => watchlistService.getDefault(),
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      watchlistId,
      companyId,
      data,
    }: {
      watchlistId: string;
      companyId: string;
      data?: { targetPrice?: number; notes?: string };
    }) => watchlistService.addCompany(watchlistId, companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, itemId }: { watchlistId: string; itemId: string }) =>
      watchlistService.removeCompany(watchlistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};