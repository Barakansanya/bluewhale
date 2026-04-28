import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function syncJsePrices() {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    console.log('⚠️ No FMP_API_KEY set');
    return { success: false, error: 'No key' };
  }

  console.log('💰 Syncing JSE prices...');
  const companies = await prisma.company.findMany({ where: { isActive: true }, take: 20 });
  const results = [];

  for (const c of companies) {
    try {
      const symbol = `${c.ticker}.JO`;
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${key}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      const q = data?.[0];
      
      if (q?.price) {
        await prisma.company.update({
          where: { id: c.id },
          data: {
            lastPrice: q.price,
            priceChange: q.change,
            priceChangePercent: q.changesPercentage,
            volume: q.volume,
            marketCap: q.marketCap,
            lastScrapedAt: new Date()
          }
        });
        console.log(`✅ ${c.ticker}: R${q.price} (${symbol})`);
        results.push({ ticker: c.ticker, price: q.price, ok: true });
      } else {
        console.log(`❌ ${c.ticker}: no data from FMP (${symbol}) - response:`, data);
        results.push({ ticker: c.ticker, ok: false, reason: 'no data' });
      }
    } catch (err: any) {
      console.log(`❌ ${c.ticker} error:`, err.message);
      results.push({ ticker: c.ticker, ok: false, error: err.message });
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`Done: ${results.filter(r=>r.ok).length}/${results.length} updated`);
  return { success: true, results };
}
