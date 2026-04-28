import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://bluewhale-production.up.railway.app/api/v1';

export default function WatchlistPage() {
  const [list, setList] = useState<string[]>(JSON.parse(localStorage.getItem('watchlist')||'["NPN","PRX","SOL"]'));
  const [data, setData] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => { localStorage.setItem('watchlist', JSON.stringify(list)); }, [list]);

  useEffect(() => {
    Promise.all(list.map(t => fetch(`${API}/companies/${t}`).then(r=>r.json()).then(d=>d.data))).then(setData);
  }, [list]);

  const add = () => { if(input &&!list.includes(input.toUpperCase())) setList([...list, input.toUpperCase()]); setInput(''); };
  const remove = (t:string) => setList(list.filter(x=>x!==t));

  return (
    <MainLayout>
      <div className="p-6 text-white max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
        <div className="flex gap-2 mb-4">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Add ticker (e.g. MTN)" className="bg-gray-900 px-3 py-2 rounded flex-1"/>
          <button onClick={add} className="bg-blue-600 px-4 rounded">Add</button>
        </div>
        <div className="space-y-2">
          {data.map(c=>(
            <div key={c.ticker} className="flex justify-between bg-gray-900 p-3 rounded">
              <Link to={`/companies/${c.ticker}`} className="font-medium">{c.ticker} - {c.name}</Link>
              <div className="flex gap-4">
                <span>R{c.lastPrice?.toFixed(2) || '—'}</span>
                <button onClick={()=>remove(c.ticker)} className="text-red-400 text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
