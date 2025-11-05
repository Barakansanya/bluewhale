// FILE: server/prisma/seed.ts
import { PrismaClient, Sector } from '@prisma/client';

const prisma = new PrismaClient();

const jseCompanies = [
  {
    ticker: 'APN',
    name: 'Aspen Pharmacare Holdings',
    sector: Sector.HEALTHCARE,
    industry: 'Pharmaceuticals',
    marketCap: 71000000000,
    description: 'Global pharmaceutical company focused on branded and generic medicines.',
    website: 'https://www.aspenpharma.com',
    lastPrice: 156.50,
    priceChange: 2.30,
    priceChangePercent: 1.49,
    volume: 1250000,
    isActive: true,
  },
  {
    ticker: 'NPN',
    name: 'Naspers Limited',
    sector: Sector.TECHNOLOGY,
    industry: 'Internet & Technology',
    marketCap: 1200000000000,
    description: 'Global consumer internet group and technology investor.',
    website: 'https://www.naspers.com',
    lastPrice: 2845.00,
    priceChange: -15.50,
    priceChangePercent: -0.54,
    volume: 890000,
    isActive: true,
  },
  {
    ticker: 'SHP',
    name: 'Shoprite Holdings',
    sector: Sector.CONSUMER_GOODS,
    industry: 'Food & Drug Retailers',
    marketCap: 98000000000,
    description: "Africa's largest food retailer.",
    website: 'https://www.shoprite.co.za',
    lastPrice: 189.25,
    priceChange: 4.75,
    priceChangePercent: 2.58,
    volume: 2100000,
    isActive: true,
  },
  {
    ticker: 'CPI',
    name: 'Capitec Bank Holdings',
    sector: Sector.FINANCIALS,
    industry: 'Banking',
    marketCap: 320000000000,
    description: 'Retail bank offering simplified banking solutions.',
    website: 'https://www.capitecbank.co.za',
    lastPrice: 1756.00,
    priceChange: 12.00,
    priceChangePercent: 0.69,
    volume: 450000,
    isActive: true,
  },
  {
    ticker: 'SOL',
    name: 'Sasol Limited',
    sector: Sector.ENERGY,
    industry: 'Oil & Gas',
    marketCap: 145000000000,
    description: 'Integrated energy and chemical company.',
    website: 'https://www.sasol.com',
    lastPrice: 231.50,
    priceChange: -3.20,
    priceChangePercent: -1.36,
    volume: 3200000,
    isActive: true,
  },
  {
    ticker: 'MTN',
    name: 'MTN Group Limited',
    sector: Sector.TELECOMMUNICATIONS,
    industry: 'Mobile Telecommunications',
    marketCap: 178000000000,
    description: 'Leading telecommunications group in Africa and Middle East.',
    website: 'https://www.mtn.com',
    lastPrice: 89.75,
    priceChange: 1.25,
    priceChangePercent: 1.41,
    volume: 5600000,
    isActive: true,
  },
  {
    ticker: 'AGL',
    name: 'Anglo American Platinum',
    sector: Sector.MATERIALS,
    industry: 'Precious Metals & Mining',
    marketCap: 285000000000,
    description: "World's leading primary producer of platinum.",
    website: 'https://www.angloamericanplatinum.com',
    lastPrice: 1089.00,
    priceChange: 18.50,
    priceChangePercent: 1.73,
    volume: 780000,
    isActive: true,
  },
  {
    ticker: 'NPH',
    name: 'Northam Platinum Holdings',
    sector: Sector.MATERIALS,
    industry: 'Precious Metals & Mining',
    marketCap: 67000000000,
    description: 'Integrated platinum group metals producer.',
    website: 'https://www.northam.co.za',
    lastPrice: 156.80,
    priceChange: -2.10,
    priceChangePercent: -1.32,
    volume: 1450000,
    isActive: true,
  },
  {
    ticker: 'BHP',
    name: 'BHP Group Limited',
    sector: Sector.MATERIALS,
    industry: 'Diversified Mining',
    marketCap: 890000000000,
    description: 'Global resources company producing commodities.',
    website: 'https://www.bhp.com',
    lastPrice: 342.50,
    priceChange: 5.30,
    priceChangePercent: 1.57,
    volume: 2340000,
    isActive: true,
  },
  {
    ticker: 'GFI',
    name: 'Gold Fields Limited',
    sector: Sector.MATERIALS,
    industry: 'Gold Mining',
    marketCap: 112000000000,
    description: 'Global gold producer with operations in South Africa, Ghana, Australia, and Peru.',
    website: 'https://www.goldfields.com',
    lastPrice: 145.60,
    priceChange: 3.40,
    priceChangePercent: 2.39,
    volume: 3450000,
    isActive: true,
  },
  {
    ticker: 'SBK',
    name: 'Standard Bank Group',
    sector: Sector.FINANCIALS,
    industry: 'Banking',
    marketCap: 234000000000,
    description: "Africa's largest bank by assets.",
    website: 'https://www.standardbank.com',
    lastPrice: 145.30,
    priceChange: 0.80,
    priceChangePercent: 0.55,
    volume: 4200000,
    isActive: true,
  },
  {
    ticker: 'FSR',
    name: 'FirstRand Limited',
    sector: Sector.FINANCIALS,
    industry: 'Banking',
    marketCap: 289000000000,
    description: 'Financial services group with retail, commercial, and investment banking.',
    website: 'https://www.firstrand.co.za',
    lastPrice: 51.20,
    priceChange: 0.45,
    priceChangePercent: 0.89,
    volume: 8900000,
    isActive: true,
  },
  {
    ticker: 'VOD',
    name: 'Vodacom Group Limited',
    sector: Sector.TELECOMMUNICATIONS,
    industry: 'Mobile Telecommunications',
    marketCap: 156000000000,
    description: 'Leading African mobile communications company.',
    website: 'https://www.vodacom.com',
    lastPrice: 84.50,
    priceChange: -1.20,
    priceChangePercent: -1.40,
    volume: 3100000,
    isActive: true,
  },
  {
    ticker: 'TBS',
    name: 'Tiger Brands Limited',
    sector: Sector.CONSUMER_GOODS,
    industry: 'Food Products',
    marketCap: 23000000000,
    description: 'Manufacturer and marketer of food, home and personal care brands.',
    website: 'https://www.tigerbrands.com',
    lastPrice: 147.25,
    priceChange: 2.15,
    priceChangePercent: 1.48,
    volume: 650000,
    isActive: true,
  },
  {
    ticker: 'AMS',
    name: 'Anglo American plc',
    sector: Sector.MATERIALS,
    industry: 'Diversified Mining',
    marketCap: 456000000000,
    description: 'Global mining company with focus on diamonds, copper, platinum, and iron ore.',
    website: 'https://www.angloamerican.com',
    lastPrice: 345.80,
    priceChange: 7.20,
    priceChangePercent: 2.13,
    volume: 1890000,
    isActive: true,
  },
];

const companyMetrics = [
  { ticker: 'APN', peRatio: 8.5, pbRatio: 1.2, dividendYield: 3.5, roe: 15.2, grossMargin: 34.5, debtToEquity: 0.45 },
  { ticker: 'NPN', peRatio: 22.3, pbRatio: 3.8, dividendYield: 0.0, roe: 18.5, grossMargin: 45.2, debtToEquity: 0.32 },
  { ticker: 'SHP', peRatio: 12.4, pbRatio: 2.1, dividendYield: 4.2, roe: 22.1, grossMargin: 19.8, debtToEquity: 0.28 },
  { ticker: 'CPI', peRatio: 9.8, pbRatio: 1.9, dividendYield: 2.8, roe: 25.3, grossMargin: 68.4, debtToEquity: 0.15 },
  { ticker: 'SOL', peRatio: 7.2, pbRatio: 0.9, dividendYield: 5.1, roe: 12.4, grossMargin: 28.3, debtToEquity: 0.67 },
  { ticker: 'MTN', peRatio: 11.5, pbRatio: 1.6, dividendYield: 6.2, roe: 19.8, grossMargin: 52.1, debtToEquity: 0.51 },
  { ticker: 'AGL', peRatio: 6.8, pbRatio: 1.4, dividendYield: 7.8, roe: 21.2, grossMargin: 42.5, debtToEquity: 0.19 },
  { ticker: 'NPH', peRatio: 5.9, pbRatio: 1.1, dividendYield: 4.5, roe: 18.6, grossMargin: 38.9, debtToEquity: 0.23 },
  { ticker: 'BHP', peRatio: 14.2, pbRatio: 2.3, dividendYield: 5.6, roe: 24.7, grossMargin: 51.2, debtToEquity: 0.42 },
  { ticker: 'GFI', peRatio: 8.9, pbRatio: 1.5, dividendYield: 3.2, roe: 16.9, grossMargin: 45.8, debtToEquity: 0.34 },
  { ticker: 'SBK', peRatio: 7.6, pbRatio: 1.3, dividendYield: 6.5, roe: 17.2, grossMargin: 62.3, debtToEquity: 0.89 },
  { ticker: 'FSR', peRatio: 8.1, pbRatio: 1.7, dividendYield: 5.8, roe: 20.4, grossMargin: 58.7, debtToEquity: 0.76 },
  { ticker: 'VOD', peRatio: 10.3, pbRatio: 2.0, dividendYield: 7.1, roe: 23.5, grossMargin: 49.8, debtToEquity: 0.44 },
  { ticker: 'TBS', peRatio: 9.4, pbRatio: 1.6, dividendYield: 4.8, roe: 14.3, grossMargin: 26.9, debtToEquity: 0.38 },
  { ticker: 'AMS', peRatio: 11.8, pbRatio: 2.2, dividendYield: 4.9, roe: 19.6, grossMargin: 47.3, debtToEquity: 0.35 },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.companyMetrics.deleteMany();
  await prisma.company.deleteMany();

  console.log('📊 Seeding JSE companies...');

  // Create companies
  for (const companyData of jseCompanies) {
    const company = await prisma.company.create({
      data: companyData,
    });

    // Find and create metrics for this company
    const metrics = companyMetrics.find(m => m.ticker === companyData.ticker);
    if (metrics) {
      await prisma.companyMetrics.create({
        data: {
          companyId: company.id,
          peRatio: metrics.peRatio,
          pbRatio: metrics.pbRatio,
          dividendYield: metrics.dividendYield,
          roe: metrics.roe,
          grossMargin: metrics.grossMargin,
          debtToEquity: metrics.debtToEquity,
          asOfDate: new Date(),
        },
      });
    }

    console.log(`✅ Created ${company.ticker} - ${company.name}`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });