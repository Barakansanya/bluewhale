// FILE: client/src/pages/WatchlistPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Target,
  StickyNote
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  company: {
    id: string;
    ticker: string;
    name: string;
    sector: string;
    lastPrice: number;
    priceChangePercent: number;
    metrics: {
      peRatio: number;
      dividendYield: number;
      roe: number;
    } | null;
  };
  targetPrice: number | null;
  notes: string | null;
  addedAt: string;
}

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/watchlist/default', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Convert strings to numbers
        const formattedItems = data.data.items.map((item: any) => ({
          ...item,
          company: {
            ...item.company,
            lastPrice: Number(item.company.lastPrice),
            priceChangePercent: Number(item.company.priceChangePercent),
            metrics: item.company.metrics[0] ? {
              peRatio: Number(item.company.metrics[0].peRatio),
              dividendYield: Number(item.company.metrics[0].dividendYield),
              roe: Number(item.company.metrics[0].roe),
            } : null,
          },
        }));
        setWatchlistItems(formattedItems);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/watchlist/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setWatchlistItems(watchlistItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return `R${value.toFixed(2)}`;
  };

  const calculatePriceDistance = (current: number, target: number | null) => {
    if (!target) return null;
    const distance = ((target - current) / current) * 100;
    return distance;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your watchlist...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <Star className="w-8 h-8 mr-3 text-cyan-400 fill-cyan-400" />
                  My Watchlist
                </h1>
                <p className="text-slate-400">Track your favorite JSE companies</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Gainers</p>
                    <p className="text-sm font-bold text-green-400">
                      {watchlistItems.filter(item => item.company.priceChangePercent > 0).length}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Losers</p>
                    <p className="text-sm font-bold text-red-400">
                      {watchlistItems.filter(item => item.company.priceChangePercent < 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {watchlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-2xl border border-slate-800 animate-fadeIn">
              <Star className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
              <p className="text-slate-400 mb-6">Start adding companies from the screener</p>
              <button
                onClick={() => window.location.href = '/screener'}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Go to Screener</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeIn">
              {watchlistItems.map((item, index) => {
                const priceDistance = calculatePriceDistance(
                  item.company.lastPrice,
                  item.targetPrice
                );
                const isPositive = item.company.priceChangePercent >= 0;

                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group animate-fadeIn"
                  >
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {item.company.ticker}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{item.company.name}</h3>
                          <p className="text-sm text-slate-400">{item.company.sector.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300 group/btn active:scale-95"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-400 transition-colors" />
                      </button>
                    </div>

                    {/* Price Info */}
                    <div className="flex items-end justify-between mb-4 pb-4 border-b border-slate-800">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Current Price</p>
                        <p className="text-3xl font-bold">{formatCurrency(item.company.lastPrice)}</p>
                      </div>
                      <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                        <span className="font-bold text-lg">
                          {isPositive ? '+' : ''}{item.company.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Target Price */}
                    {item.targetPrice && (
                      <div className="mb-4 p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-slate-400">Target Price</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(item.targetPrice)}</p>
                            {priceDistance !== null && (
                              <p className={`text-xs ${priceDistance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceDistance > 0 ? '+' : ''}{priceDistance.toFixed(1)}% upside
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">P/E</p>
                        <p className="font-bold">{item.company.metrics?.peRatio?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Div Yield</p>
                        <p className="font-bold">{item.company.metrics?.dividendYield?.toFixed(1) || 'N/A'}%</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">ROE</p>
                        <p className="font-bold">{item.company.metrics?.roe?.toFixed(1) || 'N/A'}%</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <StickyNote className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-200">{item.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Added Date */}
                    <p className="text-xs text-slate-500 mt-4">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Portfolio Summary */}
          {watchlistItems.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6 animate-fadeIn">
              <h3 className="text-xl font-bold mb-4">Portfolio Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Companies</p>
                  <p className="text-2xl font-bold">{watchlistItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Avg P/E Ratio</p>
                  <p className="text-2xl font-bold">
                    {(watchlistItems.reduce((sum, item) => sum + (item.company.metrics?.peRatio || 0), 0) / watchlistItems.length).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Avg Dividend</p>
                  <p className="text-2xl font-bold">
                    {(watchlistItems.reduce((sum, item) => sum + (item.company.metrics?.dividendYield || 0), 0) / watchlistItems.length).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Best Performer</p>
                  <p className="text-2xl font-bold text-green-400">
                    {watchlistItems.reduce((max, item) => 
                      item.company.priceChangePercent > max ? item.company.priceChangePercent : max, 
                      -Infinity
                    ).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}