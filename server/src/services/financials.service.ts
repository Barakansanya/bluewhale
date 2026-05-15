// FILE: server/src/services/financials.service.ts
// STANDALONE — zero conflict with existing services.
// Fetches annual financial statements from FMP and stores them in the
// FinancialStatement table. Also generates Excel files matching the
// client-provided NFLX_Financial_Statements.xlsx template exactly.

import axios from 'axios';
import * as XLSX from 'xlsx';
import { prisma } from '../config/database';
import { env } from '../config/env';

const FMP  = 'https://financialmodelingprep.com/api/v3';
const DELAY = (ms: number) => new Promise(r => setTimeout(r, ms));
const n    = (v: any): number | null => (v != null && !isNaN(Number(v)) ? Number(v) : null);
const pct  = (v: any): number | null => (v != null && !isNaN(Number(v)) ? Number(v) * 100 : null);

// ── Map FMP income-statement response → our model ──────────────────
function mapIncomeStatement(d: any) {
  const rev  = n(d.revenue);
  const gp   = n(d.grossProfit);
  const oi   = n(d.operatingIncome);
  const ni   = n(d.netIncome);
  return {
    totalRevenues:       rev,
    revenueGrowthPct:    pct(d.revenueGrowth),
    costOfRevenues:      n(d.costOfRevenue),
    grossProfit:         gp,
    grossMarginPct:      rev && gp   ? (gp  / rev) * 100 : null,
    sgaExpenses:         n(d.sellingGeneralAndAdministrativeExpenses),
    rdExpenses:          n(d.researchAndDevelopmentExpenses),
    operatingIncome:     oi,
    operatingMarginPct:  rev && oi   ? (oi  / rev) * 100 : null,
    interestExpense:     n(d.interestExpense),
    interestIncome:      n(d.interestIncome),
    netInterestExpense:  n(d.netInterestExpense) ?? (
      (n(d.interestExpense) ?? 0) - (n(d.interestIncome) ?? 0) || null
    ),
    incomeTaxExpense:    n(d.incomeTaxExpense),
    netIncome:           ni,
    netMarginPct:        rev && ni   ? (ni  / rev) * 100 : null,
    eps:                 n(d.eps),
    epsDiluted:          n(d.epsDiluted),
    sharesOutstanding:   n(d.weightedAverageShsOut),
    sharesDiluted:       n(d.weightedAverageShsOutDil),
    ebitda:              n(d.ebitda),
    ebit:                oi,
  };
}

// ── Map FMP balance-sheet response → our model ─────────────────────
function mapBalanceSheet(d: any) {
  return {
    cashAndEquivalents:    n(d.cashAndCashEquivalents),
    shortTermInvestments:  n(d.shortTermInvestments),
    totalCashAndST:        n(d.cashAndShortTermInvestments)
                           ?? ((n(d.cashAndCashEquivalents) ?? 0) + (n(d.shortTermInvestments) ?? 0) || null),
    accountsReceivable:    n(d.netReceivables),
    otherReceivables:      n(d.otherReceivables),
    totalReceivables:      n(d.netReceivables),
    prepaidExpenses:       n(d.prepaidExpenses),
    otherCurrentAssets:    n(d.otherCurrentAssets),
    totalCurrentAssets:    n(d.totalCurrentAssets),
    grossPPE:              n(d.propertyPlantEquipmentNet),
    accumulatedDeprec:     n(d.accumulatedDepreciation),
    netPPE:                n(d.propertyPlantEquipmentNet),
    goodwill:              n(d.goodwill),
    otherIntangibles:      n(d.intangibleAssets),
    totalIntangibles:      n(d.goodwillAndIntangibleAssets),
    otherNonCurrentAssets: n(d.otherNonCurrentAssets),
    totalNonCurrentAssets: n(d.totalNonCurrentAssets),
    totalAssets:           n(d.totalAssets),
    accountsPayable:       n(d.accountPayables),
    accruedExpenses:       n(d.accruedExpenses),
    currentDebt:           n(d.shortTermDebt),
    currentLeases:         n(d.capitalLeaseObligations),
    unearnedRevenueCurr:   n(d.deferredRevenue),
    otherCurrentLiab:      n(d.otherCurrentLiabilities),
    totalCurrentLiab:      n(d.totalCurrentLiabilities),
    longTermDebt:          n(d.longTermDebt),
    longTermLeases:        n(d.capitalLeaseObligations),
    deferredTaxLiab:       n(d.deferredTaxLiabilitiesNonCurrent),
    otherNonCurrentLiab:   n(d.otherNonCurrentLiabilities),
    totalNonCurrentLiab:   n(d.totalNonCurrentLiabilities),
    totalLiabilities:      n(d.totalLiabilities),
    commonStock:           n(d.commonStock),
    additionalPaidIn:      n(d.additionalPaidInCapital),
    retainedEarnings:      n(d.retainedEarnings),
    treasuryStock:         n(d.treasuryStock),
    otherEquity:           n(d.othertotalStockholdersEquity),
    commonEquity:          n(d.totalStockholdersEquity),
    minorityInterest:      n(d.minorityInterest),
    totalEquity:           n(d.totalEquity) ?? n(d.totalStockholdersEquity),
  };
}

// ── Map FMP cash-flow response → our model ─────────────────────────
function mapCashFlow(d: any) {
  const ops  = n(d.operatingCashFlow);
  const capx = n(d.capitalExpenditure);
  const fcf  = n(d.freeCashFlow)
               ?? (ops != null && capx != null ? ops + capx : null); // capex is negative in FMP
  return {
    cfNetIncome:       n(d.netIncome),
    depreciationAmort: n(d.depreciationAndAmortization),
    stockBasedComp:    n(d.stockBasedCompensation),
    changeInWorkingCap:n(d.changeInWorkingCapital),
    otherOperating:    n(d.otherWorkingCapital),
    cashFromOperations:ops,
    capex:             capx,
    acquisitions:      n(d.acquisitionsNet),
    otherInvesting:    n(d.otherInvestingActivites),
    cashFromInvesting: n(d.investingCashFlow),
    debtIssued:        n(d.debtRepayment) !== null && (n(d.debtRepayment) ?? 0) < 0
                       ? null : n(d.proceedsFromIssuanceOfDebt),
    debtRepaid:        n(d.debtRepayment),
    stockIssuance:     n(d.commonStockIssued),
    stockRepurchase:   n(d.commonStockRepurchased),
    dividendsPaid:     n(d.dividendsPaid),
    otherFinancing:    n(d.otherFinancingActivites),
    cashFromFinancing: n(d.financingCashFlow),
    netChangeInCash:   n(d.netChangeInCash),
    beginningCash:     n(d.cashAtBeginningOfPeriod),
    endingCash:        n(d.cashAtEndOfPeriod),
    freeCashFlow:      fcf,
    freeCashFlowPerShare: n(d.freeCashFlowPerShare),
  };
}

// ── Sync financials for a single company ──────────────────────────
export async function syncCompanyFinancials(
  ticker: string,
  companyId: string,
  limit = 7
): Promise<{ stored: number; error?: string }> {
  const key = env.FMP_API_KEY;
  if (!key) return { stored: 0, error: 'FMP_API_KEY not set' };

  const symbol = `${ticker}.JO`;

  try {
    const [isRes, bsRes, cfRes] = await Promise.all([
      axios.get(`${FMP}/income-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
      axios.get(`${FMP}/balance-sheet-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
      axios.get(`${FMP}/cash-flow-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
    ]);

    const incomeData  = Array.isArray(isRes.data) ? isRes.data : [];
    const balanceData = Array.isArray(bsRes.data) ? bsRes.data : [];
    const cashData    = Array.isArray(cfRes.data) ? cfRes.data : [];

    if (incomeData.length === 0) {
      return { stored: 0, error: `No income statement data for ${ticker}` };
    }

    let stored = 0;

    for (let i = 0; i < incomeData.length; i++) {
      const is  = incomeData[i];
      const bs  = balanceData[i] || {};
      const cf  = cashData[i]    || {};

      // Determine fiscal year from the date field
      const dateStr   = is.date || is.period || String(is.calendarYear);
      const fiscalYear = parseInt(dateStr.slice(0, 4));
      if (!fiscalYear || isNaN(fiscalYear)) continue;

      const data = {
        companyId,
        fiscalYear,
        period:   'annual',
        currency: is.reportedCurrency || 'ZAR',
        source:   'FMP',
        ...mapIncomeStatement(is),
        ...mapBalanceSheet(bs),
        ...mapCashFlow(cf),
        fetchedAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await (prisma as any).financialStatement.upsert({
          where:  { companyId_fiscalYear_period: { companyId, fiscalYear, period: 'annual' } },
          update: data,
          create: data,
        });
        stored++;
      } catch (err: any) {
        console.warn(`   ⚠️  ${ticker} FY${fiscalYear}: ${err.message}`);
      }
    }

    console.log(`   ✅ ${ticker}: ${stored} years of financial statements stored`);
    return { stored };
  } catch (err: any) {
    const msg = err.response?.status === 403
      ? 'FMP plan does not cover this ticker'
      : err.message;
    console.warn(`   ⚠️  ${ticker} financials failed: ${msg}`);
    return { stored: 0, error: msg };
  }
}

// ── Sync all active companies ──────────────────────────────────────
export async function syncAllFinancials(): Promise<void> {
  const companies = await prisma.company.findMany({
    where:  { isActive: true },
    select: { id: true, ticker: true },
  });

  console.log(`\n📊 Syncing financial statements for ${companies.length} companies...`);
  let success = 0, failed = 0;

  for (const c of companies) {
    await DELAY(600);
    const result = await syncCompanyFinancials(c.ticker, c.id);
    if (result.stored > 0) success++;
    else failed++;
  }

  console.log(`✅ Financials sync done — ${success} companies with data, ${failed} failed/no data\n`);
}

// ── Generate Excel matching the client template exactly ────────────
export async function generateFinancialsExcel(
  ticker: string,
  companyName: string
): Promise<Buffer | null> {
  const company = await prisma.company.findUnique({ where: { ticker } });
  if (!company) return null;

  const rows = await (prisma as any).financialStatement.findMany({
    where:   { companyId: company.id, period: 'annual' },
    orderBy: { fiscalYear: 'asc' },
  });

  if (rows.length === 0) return null;

  const wb   = XLSX.utils.book_new();
  const years = rows.map((r: any) => `FY${String(r.fiscalYear).slice(2)}`);
  const vals  = (field: string) => rows.map((r: any) =>
    r[field] != null ? Math.round(r[field] * 10) / 10 : ''
  );
  const currency = rows[0]?.currency || 'ZAR';

  // Shared header builder
  const buildHeader = (statementName: string) => [
    [`${companyName} (${ticker})`],
    [`${statementName}`],
    [`Source: Financial Modeling Prep (FMP)`],
    [`Currency: ${currency} Millions`],
    [],
    ['LINE ITEM', ...years],
  ];

  // ── Sheet 1: Income Statement ──────────────────────────────────
  const isData = [
    ...buildHeader('Income Statement'),
    ['── Revenues ──────────────────'],
    ['Total Revenues',             ...vals('totalRevenues')],
    ['YoY Revenue Growth (%)',     ...vals('revenueGrowthPct')],
    ['Cost of Revenues',           ...vals('costOfRevenues')],
    ['Gross Profit',               ...vals('grossProfit')],
    ['Gross Margin (%)',           ...vals('grossMarginPct')],
    [],
    ['── Operating Expenses ────────'],
    ['SG&A Expenses',             ...vals('sgaExpenses')],
    ['R&D Expenses',              ...vals('rdExpenses')],
    ['Operating Income (EBIT)',   ...vals('operatingIncome')],
    ['Operating Margin (%)',      ...vals('operatingMarginPct')],
    ['EBITDA',                    ...vals('ebitda')],
    [],
    ['── Below the Line ────────────'],
    ['Interest Expense',          ...vals('interestExpense')],
    ['Interest Income',           ...vals('interestIncome')],
    ['Net Interest Expense',      ...vals('netInterestExpense')],
    ['Income Tax Expense',        ...vals('incomeTaxExpense')],
    [],
    ['── Bottom Line ───────────────'],
    ['Net Income',                ...vals('netIncome')],
    ['Net Margin (%)',            ...vals('netMarginPct')],
    ['EPS (Basic)',               ...vals('eps')],
    ['EPS (Diluted)',             ...vals('epsDiluted')],
    ['Shares Outstanding (M)',    ...vals('sharesOutstanding')],
    ['Shares Diluted (M)',        ...vals('sharesDiluted')],
  ];

  // ── Sheet 2: Balance Sheet ─────────────────────────────────────
  const bsData = [
    ...buildHeader('Balance Sheet'),
    ['── Current Assets ────────────'],
    ['Cash & Cash Equivalents',   ...vals('cashAndEquivalents')],
    ['Short-Term Investments',    ...vals('shortTermInvestments')],
    ['Total Cash & ST Investments',...vals('totalCashAndST')],
    ['Accounts Receivable',       ...vals('accountsReceivable')],
    ['Other Receivables',         ...vals('otherReceivables')],
    ['Total Receivables',         ...vals('totalReceivables')],
    ['Prepaid Expenses',          ...vals('prepaidExpenses')],
    ['Other Current Assets',      ...vals('otherCurrentAssets')],
    ['Total Current Assets',      ...vals('totalCurrentAssets')],
    [],
    ['── Non-Current Assets ────────'],
    ['Gross PP&E',                ...vals('grossPPE')],
    ['Accumulated Depreciation',  ...vals('accumulatedDeprec')],
    ['Net PP&E',                  ...vals('netPPE')],
    ['Goodwill',                  ...vals('goodwill')],
    ['Other Intangibles',         ...vals('otherIntangibles')],
    ['Total Intangibles',         ...vals('totalIntangibles')],
    ['Other Non-Current Assets',  ...vals('otherNonCurrentAssets')],
    ['Total Non-Current Assets',  ...vals('totalNonCurrentAssets')],
    ['Total Assets',              ...vals('totalAssets')],
    [],
    ['── Current Liabilities ───────'],
    ['Accounts Payable',          ...vals('accountsPayable')],
    ['Accrued Expenses',          ...vals('accruedExpenses')],
    ['Current Debt',              ...vals('currentDebt')],
    ['Current Leases',            ...vals('currentLeases')],
    ['Unearned Revenue (Current)',...vals('unearnedRevenueCurr')],
    ['Other Current Liabilities', ...vals('otherCurrentLiab')],
    ['Total Current Liabilities', ...vals('totalCurrentLiab')],
    [],
    ['── Non-Current Liabilities ───'],
    ['Long-Term Debt',            ...vals('longTermDebt')],
    ['Long-Term Leases',          ...vals('longTermLeases')],
    ['Deferred Tax Liabilities',  ...vals('deferredTaxLiab')],
    ['Other Non-Current Liab.',   ...vals('otherNonCurrentLiab')],
    ['Total Non-Current Liab.',   ...vals('totalNonCurrentLiab')],
    ['Total Liabilities',         ...vals('totalLiabilities')],
    [],
    ['── Shareholders Equity ───────'],
    ['Common Stock',              ...vals('commonStock')],
    ['Additional Paid-In Capital',...vals('additionalPaidIn')],
    ['Retained Earnings',         ...vals('retainedEarnings')],
    ['Treasury Stock',            ...vals('treasuryStock')],
    ['Other Equity',              ...vals('otherEquity')],
    ['Common Equity',             ...vals('commonEquity')],
    ['Minority Interest',         ...vals('minorityInterest')],
    ['Total Equity',              ...vals('totalEquity')],
  ];

  // ── Sheet 3: Cash Flow Statement ───────────────────────────────
  const cfData = [
    ...buildHeader('Cash Flow Statement'),
    ['── Operating Activities ───────'],
    ['Net Income',                ...vals('cfNetIncome')],
    ['Depreciation & Amortization',...vals('depreciationAmort')],
    ['Stock-Based Compensation',  ...vals('stockBasedComp')],
    ['Change in Working Capital', ...vals('changeInWorkingCap')],
    ['Other Operating',           ...vals('otherOperating')],
    ['Cash from Operations',      ...vals('cashFromOperations')],
    [],
    ['── Investing Activities ───────'],
    ['Capital Expenditure (CapEx)',...vals('capex')],
    ['Acquisitions (Net)',         ...vals('acquisitions')],
    ['Other Investing',           ...vals('otherInvesting')],
    ['Cash from Investing',       ...vals('cashFromInvesting')],
    [],
    ['── Financing Activities ───────'],
    ['Debt Issued',               ...vals('debtIssued')],
    ['Debt Repaid',               ...vals('debtRepaid')],
    ['Stock Issuance',            ...vals('stockIssuance')],
    ['Stock Repurchase / Buyback',...vals('stockRepurchase')],
    ['Dividends Paid',            ...vals('dividendsPaid')],
    ['Other Financing',           ...vals('otherFinancing')],
    ['Cash from Financing',       ...vals('cashFromFinancing')],
    [],
    ['── Net Change & Supplemental ─'],
    ['Net Change in Cash',        ...vals('netChangeInCash')],
    ['Beginning Cash',            ...vals('beginningCash')],
    ['Ending Cash',               ...vals('endingCash')],
    [],
    ['── Free Cash Flow ────────────'],
    ['Free Cash Flow',            ...vals('freeCashFlow')],
    ['FCF per Share',             ...vals('freeCashFlowPerShare')],
  ];

  const addSheet = (data: any[][], name: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Style: widen first column, uniform year columns
    ws['!cols'] = [{ wch: 35 }, ...years.map(() => ({ wch: 14 }))];
    // Freeze first column + header rows
    ws['!freeze'] = { xSplit: 1, ySplit: 6 };
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet(isData, 'Income Statement');
  addSheet(bsData, 'Balance Sheet');
  addSheet(cfData, 'Cash Flow Statement');

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

// ── Get stored financials for API response ─────────────────────────
export async function getCompanyFinancials(ticker: string) {
  const company = await prisma.company.findUnique({ where: { ticker } });
  if (!company) return null;

  const rows = await (prisma as any).financialStatement.findMany({
    where:   { companyId: company.id, period: 'annual' },
    orderBy: { fiscalYear: 'asc' },
  });

  return {
    ticker,
    company:  company.name,
    currency: rows[0]?.currency || 'ZAR',
    source:   rows[0]?.source   || 'FMP',
    years:    rows.map((r: any) => r.fiscalYear),
    statements: rows,
  };
}
