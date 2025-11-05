// FILE: client/src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Filter, 
  Star, 
  FileText, 
  Sparkles, 
  CreditCard, 
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'screener', label: 'Screener', icon: Filter },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-hub', label: 'AI Hub', icon: Sparkles },
    { id: 'subscribe', label: 'Subscribe', icon: CreditCard },
  ];

  const mockWatchlist = [
    { ticker: 'APN', name: 'Aspen Pharmacare', price: 156.50, change: 2.3, changePercent: 1.49 },
    { ticker: 'NPN', name: 'Naspers', price: 2845.00, change: -15.50, changePercent: -0.54 },
    { ticker: 'SHP', name: 'Shoprite', price: 189.25, change: 4.75, changePercent: 2.58 },
    { ticker: 'CPI', name: 'Capitec', price: 1756.00, change: 12.00, changePercent: 0.69 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20,50 Q10,40 15,30 T25,25 L30,30 Q35,25 40,30 L45,35 Q50,30 55,35 C60,40 65,35 70,40 Q75,45 80,35 L85,30 Q88,35 90,45 L92,55 Q90,65 85,70 L80,72 Q75,70 72,65 L68,60 Q65,58 62,60 L58,62 Q55,60 52,58 L48,55 Q45,58 42,60 L38,58 Q35,55 32,58 L28,62 Q25,60 22,58 L20,50 Z" />
              </svg>
              <div>
                <h1 className="text-lg font-bold">BlueWhale</h1>
                <p className="text-xs text-cyan-400">Terminal</p>
              </div>
            </div>
          ) : (
            <svg className="w-8 h-8 text-cyan-400 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <path d="M20,50 Q10,40 15,30 T25,25 L30,30 Q35,25 40,30 L45,35 Q50,30 55,35 C60,40 65,35 70,40 Q75,45 80,35 L85,30 Q88,35 90,45 L92,55 Q90,65 85,70 L80,72 Q75,70 72,65 L68,60 Q65,58 62,60 L58,62 Q55,60 52,58 L48,55 Q45,58 42,60 L38,58 Q35,55 32,58 L28,62 Q25,60 22,58 L20,50 Z" />
            </svg>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'screener') {
                    navigate('/screener');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies, tickers..."
                className="w-96 bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-slate-400">Analyst</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Market Overview</h2>
                  <p className="text-slate-400 mt-1">Welcome back, John. Here's your portfolio snapshot.</p>
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
                  { label: 'Companies', value: '12', change: '+2', positive: true },
                  { label: 'Today P/L', value: 'R 15.4K', change: '+1.3%', positive: true },
                  { label: 'Top Gainer', value: 'SHP', change: '+2.58%', positive: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className={`text-sm flex items-center ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {stat.change}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <Star className="w-5 h-5 mr-2 text-cyan-400" />
                    Your Watchlist
                  </h3>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {mockWatchlist.map((stock) => (
                    <div key={stock.ticker} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
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
                          {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                      AI-Powered Insights
                    </h3>
                    <p className="text-slate-300">
                      Upgrade to Pro for real-time sentiment analysis, automated report summaries, and DCF valuations.
                    </p>
                  </div>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition whitespace-nowrap">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const item = navItems.find(item => item.id === activeTab);
                    const Icon = item?.icon;
                    return Icon ? <Icon className="w-8 h-8 text-cyan-400" /> : null;
                  })()}
                </div>
                <h3 className="text-2xl font-bold mb-2">{navItems.find(item => item.id === activeTab)?.label}</h3>
                <p className="text-slate-400">This section is under development</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}