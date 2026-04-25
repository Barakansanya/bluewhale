import { useNavigate } from 'react-router-dom';
import BlueWhaleLogo from './BlueWhaleLogo';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <BlueWhaleLogo />
          <span className="text-xl font-bold">BlueWhale</span>
        </div>
        <nav className="flex gap-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-blue-400">Dashboard</button>
          <button onClick={() => navigate('/screener')} className="hover:text-blue-400">Screener</button>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
