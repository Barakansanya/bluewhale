// FILE: client/src/pages/CompanyProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Star,
  DollarSign,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface CompanyData {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  description: string;
  marketCap: number;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
  metrics: any;
  historicalPrices?: Array<{
    date: string;
    close: number;
    volume: number;
  }>;
}

export default function CompanyProfilePage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('1Y');

  useEffect(() => {
    fetchCompanyData();
  }, [ticker]);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/companies/ticker/${ticker}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Handle metrics - could be object or array
        const companyData = data.data;
        if (Array.isArray(companyData.metrics)) {
          companyData.metrics = companyData.metrics[0] || null;
        }
        
        // Convert Decimal/string values to numbers
        companyData.lastPrice = Number(companyData.lastPrice);
        companyData.priceChangePercent = Number(companyData.priceChangePercent);
        companyData.marketCap = Number(companyData.marketCap);
        companyData.volume = Number(companyData.volume);
        
        // Convert metrics to numbers
        if (companyData.metrics) {
          Object.keys(companyData.metrics).forEach(key => {
            if (typeof companyData.metrics[key] === 'string' || typeof companyData.metrics[key] === 'object') {
              companyData.metrics[key] = Number(companyData.metrics[key]);
            }
          });
        }
        
        setCompany(companyData);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!company) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/watchlist/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: company.id }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Added to watchlist!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `R${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `R${(value / 1000000).toFixed(2)}M`;
    return `R${value.toFixed(2)}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-slate-400 mb-4">Company not found</p>
          <button onClick={() => navigate('/screener')} className="text-cyan-500 hover:text-cyan-400">
            Back to Screener
          </button>
        </div>
      </MainLayout>
    );
  }

  const chartData = company.historicalPrices?.map(price => ({
    date: new Date(price.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: Number(price.close),
    volume: Number(price.volume)
  })) || [];

  const priceChange = company.priceChangePercent >= 0;

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Company Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex items-start space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg animate-fade-in">
                {company.ticker}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 animate-slide-up">{company.name}</h1>
                <p className="text-slate-400 animate-slide-up" style={{ animationDelay: '100ms' }}>
                  {company.sector.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={addToWatchlist}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
            >
              <Star className="w-5 h-5" />
              <span>Add to Watchlist</span>
            </button>
          </div>

          {/* Price Info */}
          <div className="flex flex-col md:flex-row md:items-end md:space-x-8">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-400 text-sm mb-1">Current Price</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold">R {company.lastPrice.toFixed(2)}</span>
                <span className={`flex items-center space-x-1 text-lg font-semibold ${priceChange ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{priceChange ? '+' : ''}{company.priceChangePercent.toFixed(2)}%</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-slate-400 text-xs mb-1">Market Cap</p>
                <p className="text-lg font-semibold">{formatCurrency(company.marketCap)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Volume</p>
                <p className="text-lg font-semibold">{formatVolume(company.volume)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">P/E Ratio</p>
                <p className="text-lg font-semibold">{company.metrics?.peRatio?.toFixed(2) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Div Yield</p>
                <p className="text-lg font-semibold">{company.metrics?.dividendYield?.toFixed(2) || 'N/A'}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800 shadow-xl animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Activity className="w-6 h-6 text-cyan-500" />
              <span>Price Chart</span>
            </h2>
            <div className="flex space-x-2">
              {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    chartPeriod === period 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Price Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      style={{ fontSize: '12px' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      fill="url(#priceGradient)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Chart */}
              <div className="h-40">
                <p className="text-sm text-slate-400 mb-2">Trading Volume</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="#06b6d4" 
                      opacity={0.6}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-slate-400">Historical data will appear here after sync</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-slate-800">
          {['overview', 'financials', 'valuation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition relative ${
                activeTab === tab 
                  ? 'text-cyan-500' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 animate-slide-in"></div>
              )}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profitability */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition shadow-lg hover:shadow-cyan-500/20 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span>Profitability</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">ROE</span>
                <span className="font-semibold">{company.metrics?.roe?.toFixed(2) || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ROA</span>
                <span className="font-semibold">{company.metrics?.roa?.toFixed(2) || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Margin</span>
                <span className="font-semibold">{company.metrics?.netMargin?.toFixed(2) || 'N/A'}%</span>
              </div>
            </div>
          </div>

          {/* Valuation */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition shadow-lg hover:shadow-cyan-500/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Valuation</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="font-semibold">{company.metrics?.peRatio?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/B Ratio</span>
                <span className="font-semibold">{company.metrics?.pbRatio?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EV/EBITDA</span>
                <span className="font-semibold">{company.metrics?.evToEbitda?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Financial Health */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition shadow-lg hover:shadow-cyan-500/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Financial Health</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Ratio</span>
                <span className="font-semibold">{company.metrics?.currentRatio?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Debt/Equity</span>
                <span className="font-semibold">{company.metrics?.debtToEquity?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quick Ratio</span>
                <span className="font-semibold">{company.metrics?.quickRatio?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {company.description && (
          <div className="bg-slate-900 rounded-xl p-6 mt-6 border border-slate-800 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">About {company.name}</h3>
            <p className="text-slate-300 leading-relaxed">{company.description}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}