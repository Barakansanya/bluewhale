import { PrismaClient, Sector } from '@prisma/client';
const prisma = new PrismaClient();

const companies = [
  // JSE Top 40 – correct Sector enums
  { ticker: 'NPN', name: 'Naspers Ltd', sector: Sector.TECHNOLOGY },
  { ticker: 'PRX', name: 'Prosus NV', sector: Sector.TECHNOLOGY },
  { ticker: 'BHG', name: 'BHP Group Ltd', sector: Sector.MATERIALS },
  { ticker: 'AGL', name: 'Anglo American Plc', sector: Sector.MATERIALS },
  { ticker: 'CFR', name: 'Compagnie Financiere Richemont', sector: Sector.CONSUMER_GOODS },
  { ticker: 'MTN', name: 'MTN Group Ltd', sector: Sector.TELECOMMUNICATIONS },
  { ticker: 'VOD', name: 'Vodacom Group Ltd', sector: Sector.TELECOMMUNICATIONS },
  { ticker: 'SBK', name: 'Standard Bank Group', sector: Sector.FINANCIALS },
  { ticker: 'FSR', name: 'FirstRand Ltd', sector: Sector.FINANCIALS },
  { ticker: 'ABG', name: 'Absa Group Ltd', sector: Sector.FINANCIALS },
  { ticker: 'NED', name: 'Nedbank Group Ltd', sector: Sector.FINANCIALS },
  { ticker: 'SOL', name: 'Sasol Ltd', sector: Sector.ENERGY },
  { ticker: 'SHP', name: 'Shoprite Holdings', sector: Sector.CONSUMER_GOODS },
  { ticker: 'BID', name: 'Bid Corporation Ltd', sector: Sector.CONSUMER_GOODS },
  { ticker: 'BTI', name: 'British American Tobacco', sector: Sector.CONSUMER_GOODS },
  { ticker: 'AMS', name: 'Anglo American Platinum', sector: Sector.MATERIALS },
  { ticker: 'IMP', name: 'Impala Platinum Holdings', sector: Sector.MATERIALS },
  { ticker: 'SSW', name: 'Sibanye Stillwater Ltd', sector: Sector.MATERIALS },
  { ticker: 'GLN', name: 'Glencore Plc', sector: Sector.MATERIALS },
  { ticker: 'CPI', name: 'Capitec Bank Holdings', sector: Sector.FINANCIALS },
];

async function main() {
  for (const c of companies) {
    await prisma.company.upsert({
      where: { ticker: c.ticker },
      update: {},
      create: { ...c, isActive: true, website: '' },
    });
  }
  console.log(`✅ Seeded ${companies.length} JSE companies`);
}
main().finally(() => prisma.$disconnect());
