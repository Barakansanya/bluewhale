// FILE: client/src/pages/CompanyProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown,
  Star,
  ExternalLink,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Info,
  Globe
} from 'lucide-react';

interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
  marketCap: number;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  metrics: {
    peRatio: number;
    pbRatio: number;
    dividendYield: number;
    roe: number;
    roa: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    currentRatio: number;
    debtToEquity: number;
  };
}

export default function CompanyProfilePage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (ticker) {
      fetchCompany(ticker);
    }
  }, [ticker]);

  const fetchCompany = async (ticker: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/companies/ticker/${ticker}`);
      const data = await response.json();

      if (data.success) {
        const companyData = data.data;
        setCompany({
          ...companyData,
          marketCap: Number(companyData.marketCap),
          lastPrice: Number(companyData.lastPrice),
          priceChange: Number(companyData.priceChange),
          priceChangePercent: Number(companyData.priceChangePercent),
          volume: Number(companyData.volume),
          metrics: companyData.metrics[0] ? {
            peRatio: Number(companyData.metrics[0].peRatio),
            pbRatio: Number(companyData.metrics[0].pbRatio),
            dividendYield: Number(companyData.metrics[0].dividendYield),
            roe: Number(companyData.metrics[0].roe),
            roa: Number(companyData.metrics[0].roa),
            grossMargin: Number(companyData.metrics[0].grossMargin),
            operatingMargin: Number(companyData.metrics[0].operatingMargin),
            netMargin: Number(companyData.metrics[0].netMargin),
            currentRatio: Number(companyData.metrics[0].currentRatio),
            debtToEquity: Number(companyData.metrics[0].debtToEquity),
          } : null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/watchlist/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: company?.id }),
      });

      const data = await response.json();
      if (data.success) {
        setIsInWatchlist(true);
        alert('Added to watchlist!');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `R${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `R${(value / 1000000).toFixed(2)}M`;
    }
    return `R${value.toFixed(2)}`;
  };

  const formatNumber = (value: number | null, suffix = '') => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}${suffix}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading company data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Company not found</h3>
            <button
              onClick={() => navigate('/screener')}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Back to Screener
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isPositive = company.priceChangePercent >= 0;

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          {/* Company Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl shadow-cyan-500/30">
                  {company.ticker}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg font-medium">
                      {company.ticker}
                    </span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg">
                      {company.sector.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">{company.industry}</span>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Current Price</p>
                  <div className="flex items-center space-x-3">
                    <p className="text-4xl font-bold">R{company.lastPrice.toFixed(2)}</p>
                    <div className={`flex items-center space-x-1 px-3 py-2 rounded-xl ${
                      isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span className="font-bold">
                        {isPositive ? '+' : ''}{company.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={addToWatchlist}
                  disabled={isInWatchlist}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 ${
                    isInWatchlist
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isInWatchlist ? '' : 'group-hover:fill-current'}`} />
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Market Cap', value: formatCurrency(company.marketCap), icon: DollarSign, color: 'cyan' },
              { label: 'Volume', value: (company.volume / 1000000).toFixed(2) + 'M', icon: BarChart3, color: 'blue' },
              { label: 'P/E Ratio', value: company.metrics?.peRatio?.toFixed(2) || 'N/A', icon: PieChart, color: 'purple' },
              { label: 'Dividend Yield', value: company.metrics?.dividendYield?.toFixed(2) + '%' || 'N/A', icon: Activity, color: 'green' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                style={{ animationDelay: `${index * 100}ms` }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300 animate-fadeIn group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400 group-hover:scale-110 transition-transform`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'financials', label: 'Financials', icon: BarChart3 },
              { id: 'valuation', label: 'Valuation', icon: PieChart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* About Company */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Building2 className="w-6 h-6 mr-2 text-cyan-400" />
                    About {company.name}
                  </h2>
                  <p className="text-slate-300 leading-relaxed">
                    {company.description || 'No description available.'}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Profitability Metrics</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Return on Equity (ROE)', value: company.metrics?.roe, suffix: '%' },
                        { label: 'Return on Assets (ROA)', value: company.metrics?.roa, suffix: '%' },
                        { label: 'Gross Margin', value: company.metrics?.grossMargin, suffix: '%' },
                        { label: 'Operating Margin', value: company.metrics?.operatingMargin, suffix: '%' },
                        { label: 'Net Margin', value: company.metrics?.netMargin, suffix: '%' },
                      ].map((metric) => (
                        <div key={metric.label} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-slate-400">{metric.label}</span>
                          <span className="font-bold">{formatNumber(metric.value, metric.suffix)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Financial Health</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Current Ratio', value: company.metrics?.currentRatio, suffix: '' },
                        { label: 'Debt to Equity', value: company.metrics?.debtToEquity, suffix: '' },
                        { label: 'P/E Ratio', value: company.metrics?.peRatio, suffix: '' },
                        { label: 'P/B Ratio', value: company.metrics?.pbRatio, suffix: '' },
                        { label: 'Dividend Yield', value: company.metrics?.dividendYield, suffix: '%' },
                      ].map((metric) => (
                        <div key={metric.label} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-slate-400">{metric.label}</span>
                          <span className="font-bold">{formatNumber(metric.value, metric.suffix)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-6">Financial Statements</h2>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                  <p className="text-slate-400">
                    Historical financial statements and trends will be available here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'valuation' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-6">Valuation Analysis</h2>
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                  <p className="text-slate-400">
                    AI-powered DCF valuation and peer comparison will be available here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}