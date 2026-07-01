import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@wealthwise.com' },
    update: {},
    create: {
      email: 'demo@wealthwise.com',
      password: hashedPassword,
      name: 'Demo User',
      riskScore: 6,
      riskProfile: 'moderate',
      riskAnswers: {
        q1: 'moderate',
        q2: 'growth',
        q3: '10+ years',
        q4: 'hold',
        q5: 'diversified',
      },
    },
  });

  console.log('Created user:', user.email);

  // Create portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: { id: 'demo-portfolio-1' },
    update: {},
    create: {
      id: 'demo-portfolio-1',
      userId: user.id,
      name: 'Main Portfolio',
      description: 'Primary investment portfolio',
      targetAllocation: {
        US_STOCKS: 40,
        INTL_STOCKS: 20,
        BONDS: 30,
        REAL_ESTATE: 10,
      },
      currentValue: 127543.82,
      totalInvested: 109309.26,
      totalGain: 18234.56,
      lastRebalanced: new Date('2024-01-15'),
    },
  });

  console.log('Created portfolio:', portfolio.name);

  // Create holdings
  const holdings = [
    {
      portfolioId: portfolio.id,
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      shares: 180.5,
      avgCostBasis: 235.42,
      currentPrice: 282.65,
      marketValue: 51017.53,
      gainLoss: 8535.07,
      gainLossPct: 20.08,
      assetClass: 'US_STOCKS',
      sector: 'Total Market',
    },
    {
      portfolioId: portfolio.id,
      symbol: 'VXUS',
      name: 'Vanguard Total International Stock ETF',
      shares: 425.0,
      avgCostBasis: 54.12,
      currentPrice: 60.02,
      marketValue: 25508.76,
      gainLoss: 2508.76,
      gainLossPct: 10.91,
      assetClass: 'INTL_STOCKS',
      sector: 'International',
    },
    {
      portfolioId: portfolio.id,
      symbol: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      shares: 520.0,
      avgCostBasis: 71.25,
      currentPrice: 73.58,
      marketValue: 38263.15,
      gainLoss: 1213.15,
      gainLossPct: 3.27,
      assetClass: 'BONDS',
      sector: 'Fixed Income',
    },
    {
      portfolioId: portfolio.id,
      symbol: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      shares: 145.0,
      avgCostBasis: 82.45,
      currentPrice: 87.96,
      marketValue: 12754.38,
      gainLoss: 798.95,
      gainLossPct: 6.68,
      assetClass: 'REAL_ESTATE',
      sector: 'Real Estate',
    },
  ];

  for (const holding of holdings) {
    await prisma.holding.create({ data: holding });
  }

  console.log('Created holdings:', holdings.length);

  // Create goals
  const goals = [
    {
      userId: user.id,
      name: 'Retirement (2055)',
      type: 'RETIREMENT',
      targetAmount: 1500000,
      currentAmount: 127543.82,
      monthlyContrib: 1500,
      targetDate: new Date('2055-01-01'),
      priority: 1,
      successProb: 78,
      projectedAmount: 1680000,
      riskLevel: 'moderate',
    },
    {
      userId: user.id,
      name: 'House Down Payment',
      type: 'HOUSE',
      targetAmount: 80000,
      currentAmount: 45000,
      monthlyContrib: 2000,
      targetDate: new Date('2026-06-01'),
      priority: 2,
      successProb: 92,
      projectedAmount: 87000,
      riskLevel: 'conservative',
    },
    {
      userId: user.id,
      name: 'Emergency Fund',
      type: 'EMERGENCY',
      targetAmount: 25000,
      currentAmount: 22500,
      monthlyContrib: 500,
      targetDate: new Date('2024-12-01'),
      priority: 3,
      successProb: 98,
      projectedAmount: 27000,
      riskLevel: 'conservative',
    },
    {
      userId: user.id,
      name: 'Child Education Fund',
      type: 'EDUCATION',
      targetAmount: 100000,
      currentAmount: 15000,
      monthlyContrib: 400,
      targetDate: new Date('2040-09-01'),
      priority: 4,
      successProb: 85,
      projectedAmount: 115000,
      riskLevel: 'moderate',
    },
  ];

  for (const goal of goals) {
    await prisma.goal.create({ data: goal });
  }

  console.log('Created goals:', goals.length);

  // Create sample transactions
  const transactions = [
    {
      portfolioId: portfolio.id,
      type: 'DEPOSIT',
      totalAmount: 10000,
      notes: 'Initial deposit',
      executedAt: new Date('2023-01-15'),
    },
    {
      portfolioId: portfolio.id,
      type: 'BUY',
      symbol: 'VTI',
      shares: 50,
      pricePerShare: 220.50,
      totalAmount: 11025,
      fees: 0,
      notes: 'Regular investment',
      executedAt: new Date('2023-02-01'),
    },
    {
      portfolioId: portfolio.id,
      type: 'BUY',
      symbol: 'BND',
      shares: 100,
      pricePerShare: 72.00,
      totalAmount: 7200,
      fees: 0,
      notes: 'Bond allocation',
      executedAt: new Date('2023-02-15'),
    },
    {
      portfolioId: portfolio.id,
      type: 'DIVIDEND',
      symbol: 'VTI',
      totalAmount: 145.50,
      notes: 'Q1 dividend',
      executedAt: new Date('2023-03-15'),
    },
    {
      portfolioId: portfolio.id,
      type: 'DEPOSIT',
      totalAmount: 1500,
      notes: 'Monthly contribution',
      executedAt: new Date('2023-04-01'),
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log('Created transactions:', transactions.length);

  // Create market data
  const marketData = [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', currentPrice: 282.65, change: 1.23, changePct: 0.44, high52Week: 290.50, low52Week: 235.20, dividendYield: 1.35 },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', currentPrice: 60.02, change: -0.18, changePct: -0.30, high52Week: 62.50, low52Week: 52.10, dividendYield: 2.85 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', currentPrice: 73.58, change: 0.08, changePct: 0.11, high52Week: 76.80, low52Week: 70.50, dividendYield: 3.45 },
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', currentPrice: 87.96, change: 0.45, changePct: 0.51, high52Week: 95.20, low52Week: 78.30, dividendYield: 4.15 },
  ];

  for (const data of marketData) {
    await prisma.marketData.upsert({
      where: { symbol: data.symbol },
      update: data,
      create: data,
    });
  }

  console.log('Created market data:', marketData.length);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
