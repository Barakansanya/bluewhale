import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function syncJsePrices() {
  const key = process.env.FMP_API_KEY;
  if (!key) return console.log('⚠️ No FMP_API_KEY');

  console.log('💰 Syncing JSE prices...');
  const companies = await prisma.company.findMany({ where: { isActive: true }});

  for (const c of companies) {
    try {
      const symbol = `${c.ticker}.JO`;
      const { data } = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${key}`, { timeout: 8000 });
      const q = data?.[0];
      if (q) {
        await prisma.company.update({
          where: { id: c.id },
          data: {
            lastPrice: q.price ?? null,
            priceChange: q.change ?? null,
            priceChangePercent: q.changesPercentage ?? null,
            volume: q.volume ?? null,
            marketCap: q.marketCap ?? null,
            lastScrapedAt: new Date()
          }
        });
        console.log(`✅ ${c.ticker} R${q.price}`);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
}
