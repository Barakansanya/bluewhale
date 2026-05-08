// FILE: client/src/pages/DashboardPage.tsx
// FIXED: All hardcoded values replaced with live API data.
// Sources:
//   - Watchlist:   GET /watchlist/default
//   - Top Gainers: GET /companies?sortBy=priceChangePercent&sortOrder=desc&limit=5
//   - Top Losers:  GET /companies?sortBy=priceChangePercent&sortOrder=asc&limit=5
//   - Most Active: GET /companies?sortBy=volume&sortOrder=desc&limit=5
//   - JSE Index:   GET /companies?search=JALSH (or graceful fallback)

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import {
  Star, Sparkles, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Activity, RefreshCw,
  BarChart2, AlertCircle, Building2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://bluewhale-production.up.railway.app/api/v1';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Mover {
  ticker: string;
  name: string;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
}

interface MarketStats {
  totalCompanies: number;
  advancers: number;
  decliners: number;
  unchanged: number;
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, positive, loading, delay = 0
}: {
  label: string; value: string; sub: string;
  positive?: boolean; loading?: boolean; delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 animate-fadeIn"
    >
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded w-1/2" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold mb-1 truncate">{value}</p>
          <p className={`text-sm flex items-center gap-1 ${
            positive === undefined ? 'text-slate-400' :
            positive ? 'text-green-400' : 'text-red-400'
          }`}>
            {positive !== undefined && (
              positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />
            )}
            {sub}
          </p>
        </>
      )}
    </div>
  );
}

// ── Mover row ────────────────────────────────────────────────────────────────
function MoverRow({ m, onClick }: { m: Mover; onClick: () => void }) {
  const pos = m.priceChangePercent >= 0;
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/70 cursor-pointer transition group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
          {m.ticker.slice(0, 3)}
        </div>
        <div>
          <p className="font-semibold text-sm">{m.ticker}</p>
          <p className="text-xs text-slate-500 truncate max-w-[120px]">{m.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">R {Number(m.lastPrice).toFixed(2)}</p>
        <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${pos ? 'text-green-400' : 'text-red-400'}`}>
          {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {pos ? '+' : ''}{Number(m.priceChangePercent).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);
  const [active, setActive] = useState<Mover[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [watchlistRes, gainersRes, losersRes, activeRes, allRes] = await Promise.all([
        // Watchlist
        fetch(`${API}/watchlist/default`, { headers: authHeaders() }),
        // Top 5 gainers
        fetch(`${API}/companies?sortBy=priceChangePercent&sortOrder=desc&limit=5`, { headers: authHeaders() }),
        // Top 5 losers
        fetch(`${API}/companies?sortBy=priceChangePercent&sortOrder=asc&limit=5`, { headers: authHeaders() }),
        // Most active by volume
        fetch(`${API}/companies?sortBy=volume&sortOrder=desc&limit=5`, { headers: authHeaders() }),
        // All companies summary for market breadth
        fetch(`${API}/companies?limit=200`, { headers: authHeaders() }),
      ]);

      // ── Watchlist ──────────────────────────────────────────────────────
      if (watchlistRes.ok) {
        const d = await watchlistRes.json();
        if (d.success && d.data?.items) {
          setWatchlist(
            d.data.items.slice(0, 5).map((item: any) => ({
              ticker: item.company.ticker,
              name: item.company.name,
              price: Number(item.company.lastPrice) || 0,
              change: Number(item.company.priceChange) || 0,
              changePercent: Number(item.company.priceChangePercent) || 0,
            }))
          );
        }
      }

      // ── Gainers ────────────────────────────────────────────────────────
      if (gainersRes.ok) {
        const d = await gainersRes.json();
        if (d.success) {
          setGainers(
            (d.data?.companies || d.data || [])
              .filter((c: any) => Number(c.priceChangePercent) > 0)
              .slice(0, 5)
          );
        }
      }

      // ── Losers ─────────────────────────────────────────────────────────
      if (losersRes.ok) {
        const d = await losersRes.json();
        if (d.success) {
          setLosers(
            (d.data?.companies || d.data || [])
              .filter((c: any) => Number(c.priceChangePercent) < 0)
              .slice(0, 5)
          );
        }
      }

      // ── Most Active ────────────────────────────────────────────────────
      if (activeRes.ok) {
        const d = await activeRes.json();
        if (d.success) {
          setActive((d.data?.companies || d.data || []).slice(0, 5));
        }
      }

      // ── Market Breadth ─────────────────────────────────────────────────
      if (allRes.ok) {
        const d = await allRes.json();
        const companies: any[] = d.data?.companies || d.data || [];
        if (companies.length > 0) {
          const stats = companies.reduce(
            (acc, c) => {
              const chg = Number(c.priceChangePercent);
              if (chg > 0) acc.advancers++;
              else if (chg < 0) acc.decliners++;
              else acc.unchanged++;
              return acc;
            },
            { advancers: 0, decliners: 0, unchanged: 0 }
          );
          setMarketStats({ totalCompanies: companies.length, ...stats });
        }
      }

      setLastUpdated(new Date());
    } catch {
      setError('Could not load market data. Railway may be waking up — try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats for the 4 cards ─────────────────────────────────────────
  const topGainer = gainers[0];
  const topLoser = losers[0];

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="space-y-6">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between animate-fadeIn">
            <div>
              <h2 className="text-3xl font-bold">Market Overview</h2>
              <p className="text-slate-400 mt-1">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Loading live JSE data...'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Market Breadth badge */}
              {marketStats && (
                <div className="hidden md:flex items-center gap-3 text-sm bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
                  <span className="text-green-400 font-semibold">▲ {marketStats.advancers}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">{marketStats.unchanged}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-red-400 font-semibold">▼ {marketStats.decliners}</span>
                  <span className="text-slate-500 text-xs">of {marketStats.totalCompanies}</span>
                </div>
              )}
              <button
                onClick={fetchAll}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-slate-800 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 text-red-300 text-sm p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
            </div>
          )}

          {/* ── 4 Stat Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Tracked Companies"
              value={marketStats ? String(marketStats.totalCompanies) : '—'}
              sub={marketStats ? `${marketStats.advancers} advancing` : 'loading...'}
              positive={true}
              loading={loading}
              delay={0}
            />
            <StatCard
              label="Watchlist"
              value={watchlist.length > 0 ? String(watchlist.length) : loading ? '—' : '0'}
              sub={watchlist.length > 0 ? `${watchlist.length} companies tracked` : 'Add via Screener'}
              positive={undefined}
              loading={loading}
              delay={100}
            />
            <StatCard
              label="Top Gainer Today"
              value={topGainer ? topGainer.ticker : loading ? '—' : 'N/A'}
              sub={topGainer ? `+${Number(topGainer.priceChangePercent).toFixed(2)}%` : loading ? 'loading...' : 'No data'}
              positive={true}
              loading={loading}
              delay={200}
            />
            <StatCard
              label="Top Loser Today"
              value={topLoser ? topLoser.ticker : loading ? '—' : 'N/A'}
              sub={topLoser ? `${Number(topLoser.priceChangePercent).toFixed(2)}%` : loading ? 'loading...' : 'No data'}
              positive={false}
              loading={loading}
              delay={300}
            />
          </div>

          {/* ── Market Movers ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Gainers */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-green-400">
                <TrendingUp className="w-4 h-4" />Top Gainers
              </h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg" />)}
                </div>
              ) : gainers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No data</p>
              ) : (
                <div className="space-y-1">
                  {gainers.map(m => (
                    <MoverRow key={m.ticker} m={m} onClick={() => navigate(`/company/${m.ticker}`)} />
                  ))}
                </div>
              )}
            </div>

            {/* Losers */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400">
                <TrendingDown className="w-4 h-4" />Top Losers
              </h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg" />)}
                </div>
              ) : losers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No data</p>
              ) : (
                <div className="space-y-1">
                  {losers.map(m => (
                    <MoverRow key={m.ticker} m={m} onClick={() => navigate(`/company/${m.ticker}`)} />
                  ))}
                </div>
              )}
            </div>

            {/* Most Active */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-cyan-400">
                <Activity className="w-4 h-4" />Most Active
              </h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg" />)}
                </div>
              ) : active.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No data</p>
              ) : (
                <div className="space-y-1">
                  {active.map(m => (
                    <div
                      key={m.ticker}
                      onClick={() => navigate(`/company/${m.ticker}`)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/70 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                          {m.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{m.ticker}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">{m.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">R {Number(m.lastPrice).toFixed(2)}</p>
                        <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                          <BarChart2 className="w-3 h-3" />
                          {m.volume ? (Number(m.volume) / 1000).toFixed(0) + 'K' : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Watchlist Preview ─────────────────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                Watchlist Preview
              </h3>
              <button
                onClick={() => navigate('/watchlist')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
              >
                View All →
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800 rounded-lg" />)}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No companies in your watchlist yet</p>
                <button
                  onClick={() => navigate('/screener')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                >
                  Add companies from Screener →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map((stock) => (
                  <div
                    key={stock.ticker}
                    onClick={() => navigate(`/company/${stock.ticker}`)}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                        {stock.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold">{stock.name}</p>
                        <p className="text-sm text-slate-400">{stock.ticker}.JO</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R {stock.price.toFixed(2)}</p>
                      <p className={`text-sm flex items-center justify-end gap-0.5 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />}
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── AI Upsell ─────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />AI-Powered Insights
                </h3>
                <p className="text-slate-300 text-sm">
                  Upgrade to Pro for real-time sentiment analysis, automated report summaries, and DCF valuations.
                </p>
              </div>
              <button
                onClick={() => navigate('/subscribe')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-cyan-500/50 active:scale-95 whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {[
              { icon: TrendingUp, label: 'Explore Screener', desc: 'Discover and filter JSE companies', path: '/screener' },
              { icon: Star, label: 'Manage Watchlist', desc: 'Track your favourite companies', path: '/watchlist' },
              { icon: Sparkles, label: 'AI Insights', desc: 'Sentiment, DCF and Ask AI', path: '/ai-hub' },
            ].map(({ icon: Icon, label, desc, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 text-left group"
              >
                <Icon className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold mb-2">{label}</h4>
                <p className="text-sm text-slate-400">{desc}</p>
              </button>
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
