// server/src/jobs/reportScraper.job.ts
import { PrismaClient } from '@prisma/client';
import { scrapeAllCompanyReports } from '../services/reportScraper.service';

const prisma = new PrismaClient();

export async function runReportScraperJob() {
  console.log('\n📄 Starting report scraper job...');
  console.log('⏰ This will run once on startup and scrape all company reports');
  console.log('⚠️ ONLY real financial reports will be stored - NO MOCK DATA\n');

  try {
    // Get all active companies with websites
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        website: {
          not: null
        }
      },
      select: {
        id: true,
        ticker: true,
        name: true,
        website: true
      }
    });

    if (companies.length === 0) {
      console.log('⚠️ No active companies with websites found');
      return;
    }

    // Scrape reports for all companies
    const scrapedReports = await scrapeAllCompanyReports(
      companies as Array<{ ticker: string; website: string; id: string; name: string }>
    );

    // Store reports in database (ONLY REAL REPORTS)
    let totalStored = 0;
    let companiesWithReports = 0;
    let companiesWithoutReports = 0;
    
    for (const [companyId, reports] of scrapedReports.entries()) {
      const company = companies.find(c => c.id === companyId);
      const ticker = company?.ticker || 'UNKNOWN';
      
      if (reports.length === 0) {
        console.log(`⚠️ No real reports found for ${ticker} - skipping storage`);
        companiesWithoutReports++;
        continue;
      }

      companiesWithReports++;
      console.log(`💾 Storing ${reports.length} reports for ${ticker}...`);

      for (const report of reports) {
        try {
          await prisma.companyReport.upsert({
            where: {
              companyId_title: {
                companyId,
                title: report.title
              }
            },
            create: {
              companyId,
              title: report.title,
              reportType: report.type,
              fiscalYear: report.date ? report.date.getFullYear() : new Date().getFullYear(),
              publishDate: report.date || new Date(),
              fileUrl: report.url,
              fileName: report.url.split('/').pop() || 'report.pdf',
              aiProcessed: false
            },
            update: {
              fileUrl: report.url,
              reportType: report.type,
              publishDate: report.date || new Date(),
              updatedAt: new Date()
            }
          });
          
          totalStored++;
        } catch (error: any) {
          console.error(`   ❌ Failed to store "${report.title}":`, error.message);
        }
      }

      console.log(`✅ Successfully stored ${reports.length} reports for ${ticker}`);
    }

    console.log(`\n🎉 Report scraper job completed!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Total real reports stored: ${totalStored}`);
    console.log(`✅ Companies with reports: ${companiesWithReports}/${companies.length}`);
    console.log(`⚠️ Companies without reports: ${companiesWithoutReports}/${companies.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (companiesWithoutReports > 0) {
      console.log(`ℹ️ Companies without reports will show empty state on frontend`);
      console.log(`ℹ️ This is expected until we find their IR pages\n`);
    }

  } catch (error) {
    console.error('❌ Report scraper job failed:', error);
    throw error;
  }
}

export function startReportScraperJob() {
  console.log('\n📄 Report scraper started in background...\n');
  
  runReportScraperJob()
    .then(() => {
      console.log('✅ Report scraper job completed successfully\n');
    })
    .catch((error) => {
      console.error('❌ Report scraper job failed:', error.message, '\n');
    });
}