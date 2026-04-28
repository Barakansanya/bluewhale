import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const API = import.meta.env.VITE_API_URL || 'https://bluewhale-production.up.railway.app/api/v1';

export default function CompanyProfilePage() {
  const { id } = useParams();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/companies/${id}`).then(r=>r.json()).then(d=>setC(d.data)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <MainLayout><div className="p-8 text-white">Loading...</div></MainLayout>;
  if (!c) return <MainLayout><div className="p-8 text-white">Not found</div></MainLayout>;

  const price = c.lastPrice? Number(c.lastPrice) : null;
  const chg = c.priceChangePercent? Number(c.priceChangePercent) : null;

  return (
    <MainLayout>
      <div className="p-6 text-white max-w-6xl mx-auto">
        <Link to="/screener" className="text-gray-400 text-sm">← Back</Link>
        <h1 className="text-3xl font-bold mt-2">{c.name} <span className="text-gray-500 text-xl">{c.ticker}.JO</span></h1>
        <div className="mt-4 text-2xl">{price? `R ${price.toFixed(2)}` : '—'} <span className={chg>=0?'text-green-400 ml-2':'text-red-400 ml-2'}>{chg?.toFixed(2)}%</span></div>
      </div>
    </MainLayout>
  );
}
