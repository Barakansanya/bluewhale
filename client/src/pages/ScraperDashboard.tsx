import React, { useState, useEffect } from 'react';
import { Activity, Database, Clock, AlertCircle, CheckCircle, XCircle, Play, RefreshCw, TrendingUp } from 'lucide-react';

export default function ScraperDashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 15,
    lastScrapeTime: null,
    successfulScrapes: 0,
    failedScrapes: 0,
    nextScheduledScrape: '2:00 AM SAST'
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const companies = [
    'NPN', 'APN', 'CPI', 'FSR', 'SBK', 'NED', 'ABG', 
    'GFI', 'AGL', 'SOL', 'BTI', 'SHP', 'PIK', 'WHL', 'MRP'
  ];

  // Scrape single company
  const handleScrapeCompany = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    setLoading(true);
    addLog(`🔄 Starting scrape for ${selectedCompany}...`, 'info');

    try {
      const response = await fetch(`http://localhost:5000/api/v1/scraper/company/${selectedCompany}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        addLog(`✅ Successfully scraped ${selectedCompany}`, 'success');
        setStats(prev => ({
          ...prev,
          successfulScrapes: prev.successfulScrapes + 1,
          lastScrapeTime: new Date().toLocaleString()
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addLog(`❌ Failed to scrape ${selectedCompany}: ${error.message}`, 'error');
      setStats(prev => ({
        ...prev,
        failedScrapes: prev.failedScrapes + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  // Scrape all companies
  const handleScrapeAll = async () => {
    setLoading(true);
    addLog('🌊 Starting bulk scrape for all companies...', 'info');

    try {
      const response = await fetch('http://localhost:5000/api/v1/scraper/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        addLog('✅ Bulk scrape started successfully (running in background)', 'success');
        setStats(prev => ({
          ...prev,
          lastScrapeTime: new Date().toLocaleString()
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addLog(`❌ Bulk scrape failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add log entry
  const addLog = (message: string, type: 'info' | 'success' | 'error') => {
    const newLog = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Database className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Scraper Control Center</h1>
          </div>
          <p className="text-blue-100 text-lg">Monitor and control primary data scraping</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.totalCompanies}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Total Companies</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.successfulScrapes}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Successful</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.failedScrapes}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Failed</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-lg font-bold text-slate-900">{stats.nextScheduledScrape}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Next Auto-Scrape</h3>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-blue-600" />
            Manual Scraping
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Company Scrape */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Scrape Single Company</h3>
              <div className="flex gap-3">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Company...</option>
                  {companies.map(ticker => (
                    <option key={ticker} value={ticker}>{ticker}</option>
                  ))}
                </select>
                <button
                  onClick={handleScrapeCompany}
                  disabled={loading || !selectedCompany}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Scrape
                </button>
              </div>
            </div>

            {/* Bulk Scrape */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Scrape All Companies</h3>
              <button
                onClick={handleScrapeAll}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Scraping...' : 'Start Bulk Scrape'}
              </button>
              <p className="text-sm text-slate-500">
                ⚠️ This will scrape all {stats.totalCompanies} companies sequentially. Takes ~3-5 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Activity Logs
            </h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet. Start scraping to see logs.</p>
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.type === 'success' ? 'bg-green-50 border-green-200' :
                    log.type === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {log.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                      {log.type === 'error' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                      {log.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
                      <p className={`text-sm font-medium ${
                        log.type === 'success' ? 'text-green-900' :
                        log.type === 'error' ? 'text-red-900' :
                        'text-blue-900'
                      }`}>
                        {log.message}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <strong className="text-blue-600">Primary Scraping:</strong>
              <p>Extracts data directly from company investor relations websites</p>
            </div>
            <div>
              <strong className="text-blue-600">API Fallback:</strong>
              <p>Uses FMP API when scraping fails or URLs not configured</p>
            </div>
            <div>
              <strong className="text-blue-600">Auto-Sync:</strong>
              <p>Automatically runs every day at 2:00 AM SAST</p>
            </div>
            <div>
              <strong className="text-blue-600">Rate Limiting:</strong>
              <p>2-second delay between requests to avoid overwhelming servers</p>
            </div>
          </div>
        </div>

        {/* Last Scrape Time */}
        {stats.lastScrapeTime && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Last manual scrape: <strong>{stats.lastScrapeTime}</strong>
          </div>
        )}
      </div>
    </div>
  );
}