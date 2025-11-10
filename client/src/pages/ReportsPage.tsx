import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { 
  FileText, 
  Download, 
  Search,
  Filter,
  Calendar,
  Building2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  reportType: string;
  fiscalYear: number | null;
  publishDate: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  summary: string | null;
  company: {
    id: string;
    ticker: string;
    name: string;
    sector: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [savedReports, setSavedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, [reportTypeFilter, yearFilter, searchQuery]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportTypeFilter) params.append('reportType', reportTypeFilter);
      if (yearFilter) params.append('fiscalYear', yearFilter);
      if (searchQuery) params.append('search', searchQuery);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/reports/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportId })
      });

      const data = await response.json();
      if (data.success) {
        setSavedReports(prev => new Set([...prev, reportId]));
      }
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const reportTypes = ['Annual Report', 'Interim Report', 'Quarterly Report', 'Financial Statements', 'Investor Presentation'];
  const years = [2024, 2023, 2022, 2021, 2020];

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 animate-slide-up">
            <h1 className="text-3xl font-bold mb-2">Reports Library</h1>
            <p className="text-slate-400">Access company reports, financial statements, and investor presentations</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reports, companies, or tickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none transition"
                >
                  <option value="">All Types</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none transition"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4 text-slate-400 text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
            Showing {reports.length} reports
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800 animate-fade-in">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
              <p className="text-slate-400">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-cyan-500/50 transition group animate-slide-up"
                  style={{ animationDelay: `${(index % 10) * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-cyan-400" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition">
                            {report.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-2">
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium text-white">{report.company.ticker}</span>
                              <span>•</span>
                              <span>{report.company.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(report.publishDate)}</span>
                            </div>
                            {report.fileSize && (
                              <span>• {formatFileSize(report.fileSize)}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {report.reportType}
                            </span>
                            {report.fiscalYear && (
                              <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                                FY {report.fiscalYear}
                              </span>
                            )}
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {report.company.sector.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {report.summary && (
                            <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                              {report.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveReport(report.id)}
                        className={`p-3 rounded-lg transition ${
                          savedReports.has(report.id)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        title="Save Report"
                      >
                        {savedReports.has(report.id) ? (
                          <BookmarkCheck className="w-5 h-5" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>

                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
                        >
                          <Download className="w-5 h-5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex items-center space-x-2 px-4 py-3 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                          title="Coming Soon - Will connect to JSE PDF repository"
                        >
                          <Download className="w-5 h-5" />
                          <span className="hidden sm:inline">Coming Soon</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}