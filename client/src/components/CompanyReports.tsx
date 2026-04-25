import { useState } from 'react';
import { FileText, Download, ExternalLink, Calendar, ChevronDown } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  reportType: string;
  fiscalYear: number;
  publishDate: string;
  fileUrl: string;
  fileName: string;
}

interface CompanyReportsProps {
  ticker: string;
}

export default function CompanyReports({ ticker }: CompanyReportsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchReports();
  }, [ticker]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/reports/company/${ticker}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      setDownloadingId(reportId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:5000/api/v1/reports/${reportId}/download?format=${format}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadFormat({ ...downloadFormat, [reportId]: false });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const getReportIcon = (type: string) => {
    return FileText;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No reports available yet</p>
        <p className="text-slate-500 text-xs mt-1">Reports will appear here after scraping</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <FileText className="w-6 h-6 text-cyan-500" />
          <span>Official Reports</span>
        </h3>
        <a
          href="/reports"
          className="text-sm text-cyan-500 hover:text-cyan-400 transition"
        >
          View all →
        </a>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report, index) => {
          const Icon = getReportIcon(report.reportType);
          const showDropdown = downloadFormat[report.id];

          return (
            <div
              key={report.id}
              className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-200 shadow-lg hover:shadow-cyan-500/20 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/30">
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors text-base mb-1">
                    {report.title}
                  </h4>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(report.publishDate).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>{report.reportType}</span>
                    {report.fiscalYear && (
                      <>
                        <span>•</span>
                        <span>{report.fiscalYear}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {/* Download Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setDownloadFormat({ ...downloadFormat, [report.id]: !showDropdown })}
                        disabled={downloadingId === report.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        <span>{downloadingId === report.id ? 'Downloading...' : 'Download'}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[140px]">
                          <button
                            onClick={() => handleDownload(report.id, 'pdf')}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 rounded-t-lg transition flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            PDF
                          </button>
                          <button
                            onClick={() => handleDownload(report.id, 'excel')}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Excel
                          </button>
                          <button
                            onClick={() => handleDownload(report.id, 'csv')}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 rounded-b-lg transition flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            CSV
                          </button>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => handleView(report.fileUrl)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <p className="text-xs text-cyan-300">
          <span className="font-semibold">Note:</span> Reports are sourced from official company investor relations pages. 
          Download formats: PDF (original), Excel/CSV (metadata extraction).
        </p>
      </div>
    </div>
  );
}