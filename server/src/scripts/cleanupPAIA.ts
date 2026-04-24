// server/src/scripts/cleanupPAIA.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupPAIAReports() {
  console.log('\n🧹 Starting PAIA report cleanup...\n');

  try {
    // Find all PAIA-related reports
    const paiaReports = await prisma.companyReport.findMany({
      where: {
        OR: [
          { title: { contains: 'PAIA', mode: 'insensitive' } },
          { title: { contains: 'Privacy', mode: 'insensitive' } },
          { title: { contains: 'Cookie', mode: 'insensitive' } },
          { title: { contains: 'Terms', mode: 'insensitive' } },
          { title: { contains: 'Policy', mode: 'insensitive' } },
          { title: { contains: 'Manual', mode: 'insensitive' } },
          { title: { contains: 'Charter', mode: 'insensitive' } },
          { title: { contains: 'Code of Conduct', mode: 'insensitive' } },
          { fileUrl: { contains: 'paia', mode: 'insensitive' } },
          { fileUrl: { contains: 'privacy', mode: 'insensitive' } },
          { fileUrl: { contains: 'cookie', mode: 'insensitive' } }
        ]
      },
      include: {
        company: {
          select: {
            ticker: true,
            name: true
          }
        }
      }
    });

    console.log(`📋 Found ${paiaReports.length} PAIA/compliance reports to remove:\n`);

    // List what will be deleted
    paiaReports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.company.ticker} - ${report.title}`);
    });

    if (paiaReports.length === 0) {
      console.log('\n✅ No PAIA reports found - database is clean!\n');
      return;
    }

    console.log(`\n🗑️ Deleting ${paiaReports.length} reports...\n`);

    // Delete all PAIA reports
    const deleteResult = await prisma.companyReport.deleteMany({
      where: {
        OR: [
          { title: { contains: 'PAIA', mode: 'insensitive' } },
          { title: { contains: 'Privacy', mode: 'insensitive' } },
          { title: { contains: 'Cookie', mode: 'insensitive' } },
          { title: { contains: 'Terms', mode: 'insensitive' } },
          { title: { contains: 'Policy', mode: 'insensitive' } },
          { title: { contains: 'Manual', mode: 'insensitive' } },
          { title: { contains: 'Charter', mode: 'insensitive' } },
          { title: { contains: 'Code of Conduct', mode: 'insensitive' } },
          { fileUrl: { contains: 'paia', mode: 'insensitive' } },
          { fileUrl: { contains: 'privacy', mode: 'insensitive' } },
          { fileUrl: { contains: 'cookie', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} PAIA/compliance reports\n`);

    // Show remaining reports count
    const remainingReports = await prisma.companyReport.count();
    console.log(`📊 Remaining financial reports in database: ${remainingReports}\n`);

    // Show breakdown by company
    const companiesWithReports = await prisma.companyReport.groupBy({
      by: ['companyId'],
      _count: {
        id: true
      }
    });

    if (companiesWithReports.length > 0) {
      console.log('📈 Reports per company:');
      for (const item of companiesWithReports) {
        const company = await prisma.company.findUnique({
          where: { id: item.companyId },
          select: { ticker: true }
        });
        console.log(`   ${company?.ticker}: ${item._count.id} reports`);
      }
      console.log('');
    }

    console.log('🎉 Cleanup complete!\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupPAIAReports()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });