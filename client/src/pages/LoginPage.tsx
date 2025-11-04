// FILE: client/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setLoading(false);
      // Navigate to dashboard
      navigate('/dashboard');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10">
        <div className="hidden lg:flex flex-col justify-center text-white space-y-6 p-12">
          <div className="flex items-center space-x-3 mb-8">
            <svg className="w-16 h-16 text-cyan-400" viewBox="0 0 100 100" fill="currentColor">
              <path d="M20,50 Q10,40 15,30 T25,25 L30,30 Q35,25 40,30 L45,35 Q50,30 55,35 C60,40 65,35 70,40 Q75,45 80,35 L85,30 Q88,35 90,45 L92,55 Q90,65 85,70 L80,72 Q75,70 72,65 L68,60 Q65,58 62,60 L58,62 Q55,60 52,58 L48,55 Q45,58 42,60 L38,58 Q35,55 32,58 L28,62 Q25,60 22,58 L20,50 Z" />
              <polyline points="58,50 62,45 66,48 70,42 74,46 78,40" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">BlueWhale</h1>
              <p className="text-cyan-400 text-sm">Terminal</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight">
            Navigate JSE Small-Cap Markets with Precision
          </h2>
          
          <p className="text-slate-300 text-lg">
            Professional-grade research platform for South African equity markets. 
            Real-time data, AI-powered insights, and institutional-quality analytics.
          </p>

          <div className="space-y-4 pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Advanced Screener</h3>
                <p className="text-sm text-slate-400">
                  Filter and sort companies by 20+ financial metrics
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">AI-Powered Insights</h3>
                <p className="text-sm text-slate-400">
                  Sentiment analysis, automated summaries, and DCF valuations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Company Reports</h3>
                <p className="text-sm text-slate-400">
                  Access integrated annual reports and financial statements
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                <svg className="w-12 h-12 text-cyan-400" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M20,50 Q10,40 15,30 T25,25 L30,30 Q35,25 40,30 L45,35 Q50,30 55,35 C60,40 65,35 70,40 Q75,45 80,35 L85,30 Q88,35 90,45 L92,55 Q90,65 85,70 L80,72 Q75,70 72,65 L68,60 Q65,58 62,60 L58,62 Q55,60 52,58 L48,55 Q45,58 42,60 L38,58 Q35,55 32,58 L28,62 Q25,60 22,58 L20,50 Z" />
                </svg>
                <div>
                  <h1 className="text-2xl font-bold text-white">BlueWhale</h1>
                  <p className="text-cyan-400 text-xs">Terminal</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-300 text-sm">
                  {isLogin 
                    ? 'Sign in to access your terminal' 
                    : 'Start your research journey today'}
                </p>
              </div>

              <div className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    placeholder="analyst@bluewhale.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-4 text-center">
                  <button className="text-slate-400 hover:text-white text-xs transition">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-slate-400 text-xs mt-6">
              © 2025 BlueWhale Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}