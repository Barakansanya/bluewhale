// FILE: client/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  Star,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/watchlist/default', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data.items) {
        // Take only first 4 items for dashboard preview
        const formattedItems = data.data.items.slice(0, 4).map((item: any) => ({
          ticker: item.company.ticker,
          name: item.company.name,
          price: Number(item.company.lastPrice),
          change: Number(item.company.priceChange),
          changePercent: Number(item.company.priceChangePercent),
        }));
        setWatchlistItems(formattedItems);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between animate-fadeIn">
            <div>
              <h2 className="text-3xl font-bold">Market Overview</h2>
              <p className="text-slate-400 mt-1">Welcome back. Here's your portfolio snapshot.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">JSE All Share Index</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-bold">76,542.30</span>
                <span className="flex items-center text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  0.87%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Holdings', value: 'R 1.2M', change: '+5.2%', positive: true },
              { label: 'Companies', value: watchlistItems.length.toString(), change: `${watchlistItems.length} tracked`, positive: true },
              { label: 'Today P/L', value: 'R 15.4K', change: '+1.3%', positive: true },
              { label: 'Top Gainer', value: watchlistItems[0]?.ticker || 'N/A', change: watchlistItems[0]?.changePercent ? `+${watchlistItems[0].changePercent.toFixed(2)}%` : 'N/A', positive: true },
            ].map((stat, i) => (
              <div 
                key={i} 
                style={{ animationDelay: `${i * 100}ms` }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 animate-fadeIn group"
              >
                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className={`text-sm flex items-center ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Star className="w-5 h-5 mr-2 text-cyan-400" />
                Your Watchlist Preview
              </h3>
              <button 
                onClick={() => navigate('/watchlist')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            </div>

            {watchlistItems.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No companies in your watchlist yet</p>
                <button
                  onClick={() => navigate('/screener')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Add companies from Screener →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlistItems.map((stock) => (
                  <div 
                    key={stock.ticker} 
                    onClick={() => navigate(`/company/${stock.ticker}`)}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                        {stock.ticker}
                      </div>
                      <div>
                        <p className="font-semibold">{stock.name}</p>
                        <p className="text-sm text-slate-400">{stock.ticker}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R {stock.price.toFixed(2)}</p>
                      <p className={`text-sm flex items-center justify-end ${stock.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                  AI-Powered Insights
                </h3>
                <p className="text-slate-300">
                  Upgrade to Pro for real-time sentiment analysis, automated report summaries, and DCF valuations.
                </p>
              </div>
              <button 
                onClick={() => navigate('/subscribe')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-cyan-500/50 active:scale-95"
              >
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            <button
              onClick={() => navigate('/screener')}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 text-left group"
            >
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold mb-2">Explore Screener</h4>
              <p className="text-sm text-slate-400">Discover and analyze JSE companies</p>
            </button>

            <button
              onClick={() => navigate('/watchlist')}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 text-left group"
            >
              <Star className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold mb-2">Manage Watchlist</h4>
              <p className="text-sm text-slate-400">Track your favorite companies</p>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 text-left group"
            >
              <Sparkles className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold mb-2">AI Insights</h4>
              <p className="text-sm text-slate-400">Get AI-powered analysis</p>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}