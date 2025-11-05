// FILE: client/src/components/MainLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  X
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'screener', label: 'Screener', icon: Filter, path: '/screener' },
    { id: 'watchlist', label: 'Watchlist', icon: Star, path: '/watchlist' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'ai-hub', label: 'AI Hub', icon: Sparkles, path: '/ai-hub' },
    { id: 'subscribe', label: 'Subscribe', icon: CreditCard, path: '/subscribe' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${sidebarOpen ? 'md:w-64' : 'md:w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-col fixed h-full z-30`}>
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
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
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
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-64 bg-slate-900 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M20,50 Q10,40 15,30 T25,25 L30,30 Q35,25 40,30 L45,35 Q50,30 55,35 C60,40 65,35 70,40 Q75,45 80,35 L85,30 Q88,35 90,45 L92,55 Q90,65 85,70 L80,72 Q75,70 72,65 L68,60 Q65,58 62,60 L58,62 Q55,60 52,58 L48,55 Q45,58 42,60 L38,58 Q35,55 32,58 L28,62 Q25,60 22,58 L20,50 Z" />
                </svg>
                <div>
                  <h1 className="text-lg font-bold">BlueWhale</h1>
                  <p className="text-xs text-cyan-400">Terminal</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-2 hover:bg-slate-800 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies..."
                className="w-64 lg:w-96 bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-2 md:space-x-3 px-2 md:px-3 py-2 bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.firstName || 'User'} {user.lastName || ''}</p>
                <p className="text-xs text-slate-400 capitalize">{user.subscription?.toLowerCase() || 'Free'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}