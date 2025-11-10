import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { 
  Sparkles, 
  FileText, 
  TrendingUp,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState('sentiment');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Sentiment Analysis
  const [sentimentText, setSentimentText] = useState('');
  
  // Report Summary
  const [reportText, setReportText] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // DCF Calculator
  const [dcfParams, setDcfParams] = useState({
    currentRevenue: 1000,
    revenueGrowthRate: 15,
    terminalGrowthRate: 3,
    discountRate: 10,
    projectionYears: 5
  });
  
  // Q&A
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');

  const handleSentimentAnalysis = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: sentimentText })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSummary = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportText, companyName })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Report summary failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDCFCalculation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dcfParams)
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('DCF calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question, context })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Question failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sentiment', name: 'Sentiment Analysis', icon: TrendingUp },
    { id: 'summary', name: 'Report Summary', icon: FileText },
    { id: 'dcf', name: 'DCF Calculator', icon: Sparkles },
    { id: 'qa', name: 'Ask AI', icon: MessageSquare }
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Hub</h1>
                <p className="text-slate-400">Powered by Claude Sonnet 4</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Input</h2>
              
              {activeTab === 'sentiment' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Text to Analyze
                    </label>
                    <textarea
                      value={sentimentText}
                      onChange={(e) => setSentimentText(e.target.value)}
                      placeholder="Paste news article, press release, or financial commentary..."
                      className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSentimentAnalysis}
                    disabled={loading || !sentimentText}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Analyze Sentiment</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Shoprite Holdings"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Report Text
                    </label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Paste annual report excerpt, financial statements, or management discussion..."
                      className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReportSummary}
                    disabled={loading || !reportText || !companyName}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Summarize Report</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'dcf' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Current Revenue (R Million)
                    </label>
                    <input
                      type="number"
                      value={dcfParams.currentRevenue}
                      onChange={(e) => setDcfParams({...dcfParams, currentRevenue: Number(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Revenue Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={dcfParams.revenueGrowthRate}
                      onChange={(e) => setDcfParams({...dcfParams, revenueGrowthRate: Number(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Terminal Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={dcfParams.terminalGrowthRate}
                      onChange={(e) => setDcfParams({...dcfParams, terminalGrowthRate: Number(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      value={dcfParams.discountRate}
                      onChange={(e) => setDcfParams({...dcfParams, discountRate: Number(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleDCFCalculation}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Calculate Fair Value</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Context (Optional)
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Provide context like company info, financial data..."
                      className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Your Question
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything about the company, industry trends, or financial analysis..."
                      className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAskQuestion}
                    disabled={loading || !question}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                  <p>AI results will appear here</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-slate-400">Processing with AI...</p>
                </div>
              )}

              {result && activeTab === 'sentiment' && (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-4 rounded-lg border-2 ${
                    result.sentiment === 'POSITIVE' ? 'bg-green-500/10 border-green-500' :
                    result.sentiment === 'NEGATIVE' ? 'bg-red-500/10 border-red-500' :
                    'bg-yellow-500/10 border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-400">Sentiment</span>
                      <span className="text-2xl font-bold">{result.sentiment}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            result.sentiment === 'POSITIVE' ? 'bg-green-500' :
                            result.sentiment === 'NEGATIVE' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${((result.score + 1) / 2) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{result.score.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Analysis</h3>
                    <p className="text-slate-200">{result.explanation}</p>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Key Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keyTopics.map((topic: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result && activeTab === 'summary' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Executive Summary</h3>
                    <p className="text-slate-200">{result.summary}</p>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Key Points</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span className="text-slate-200">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>Risk Factors</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.riskFactors.map((risk: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span className="text-slate-200">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span>Opportunities</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.opportunities.map((opp: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-slate-200">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {result && activeTab === 'dcf' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Fair Value Estimate</h3>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      R{result.fairValue.toLocaleString()}M
                    </p>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Explanation</h3>
                    <p className="text-slate-200 text-sm">{result.explanation}</p>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Projected Revenues</h3>
                    <div className="space-y-2">
                      {result.projectedRevenues.map((revenue: number, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Year {i + 1}</span>
                          <span className="font-medium">R{revenue.toLocaleString()}M</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-xs font-medium text-slate-400 mb-1">Terminal Value</h3>
                      <p className="text-xl font-bold">R{result.terminalValue.toLocaleString()}M</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-xs font-medium text-slate-400 mb-1">Present Value</h3>
                      <p className="text-xl font-bold">R{result.presentValue.toLocaleString()}M</p>
                    </div>
                  </div>
                </div>
              )}

              {result && activeTab === 'qa' && (
                <div className="bg-slate-800 p-4 rounded-lg animate-fade-in">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>AI Response</span>
                  </h3>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}