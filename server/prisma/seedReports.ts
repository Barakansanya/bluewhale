// FILE: server/prisma/seedReports.ts
// Run this to populate sample reports
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReports() {
  console.log('📄 Seeding reports...');

  // Get all companies
  const companies = await prisma.company.findMany({
    take: 10
  });

  const reportTypes = ['Annual Report', 'Interim Report', 'Financial Statements', 'Investor Presentation'];
  
  for (const company of companies) {
    // Create 3-4 reports per company
    for (let i = 0; i < 3; i++) {
      const year = 2024 - i;
      const reportType = reportTypes[i % reportTypes.length];
      
      await prisma.companyReport.create({
        data: {
          companyId: company.id,
          title: `${company.name} ${reportType} ${year}`,
          reportType,
          fiscalYear: year,
          publishDate: new Date(`${year}-0${3 + i}-15`),
          fileUrl: `https://example.com/reports/${company.ticker}_${year}.pdf`,
          fileName: `${company.ticker}_${reportType.replace(' ', '_')}_${year}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 1000000,
          summary: `Comprehensive ${reportType.toLowerCase()} for ${company.name} covering fiscal year ${year}. Includes detailed financial statements, management discussion and analysis, and key performance indicators.`,
          keyPoints: [
            `Revenue: R${(Math.random() * 10 + 5).toFixed(1)}B`,
            `Profit Margin: ${(Math.random() * 20 + 5).toFixed(1)}%`,
            `EPS Growth: ${(Math.random() * 30 - 10).toFixed(1)}%`,
          ],
          sentiment: i === 0 ? 'Positive' : i === 1 ? 'Neutral' : 'Positive',
          aiProcessed: false,
        },
      });

      console.log(`✅ Created report: ${company.ticker} - ${reportType} ${year}`);
    }
  }

  console.log('✨ Reports seeding complete!');
}

seedReports()
  .catch((e) => {
    console.error('❌ Error seeding reports:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });