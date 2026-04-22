import { NextRequest, NextResponse } from 'next/server';

// Mock portfolio data
const mockPortfolio = {
  id: 'portfolio-1',
  userId: 'user-1',
  name: 'Main Portfolio',
  totalValue: 127543.82,
  totalInvested: 109309.26,
  totalGain: 18234.56,
  totalGainPct: 16.7,
  targetAllocation: {
    US_STOCKS: 40,
    INTL_STOCKS: 20,
    BONDS: 30,
    REAL_ESTATE: 10,
  },
  holdings: [
    {
      id: 'holding-1',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      shares: 180.5,
      avgCostBasis: 235.42,
      currentPrice: 282.65,
      marketValue: 51017.53,
      gainLoss: 8535.07,
      gainLossPct: 20.08,
      assetClass: 'US_STOCKS',
    },
    {
      id: 'holding-2',
      symbol: 'VXUS',
      name: 'Vanguard Total International Stock ETF',
      shares: 425.0,
      avgCostBasis: 54.12,
      currentPrice: 60.02,
      marketValue: 25508.76,
      gainLoss: 2508.76,
      gainLossPct: 10.91,
      assetClass: 'INTL_STOCKS',
    },
    {
      id: 'holding-3',
      symbol: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      shares: 520.0,
      avgCostBasis: 71.25,
      currentPrice: 73.58,
      marketValue: 38263.15,
      gainLoss: 1213.15,
      gainLossPct: 3.27,
      assetClass: 'BONDS',
    },
    {
      id: 'holding-4',
      symbol: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      shares: 145.0,
      avgCostBasis: 82.45,
      currentPrice: 87.96,
      marketValue: 12754.38,
      gainLoss: 798.95,
      gainLossPct: 6.68,
      assetClass: 'REAL_ESTATE',
    },
  ],
  currentAllocation: {
    US_STOCKS: 40.0,
    INTL_STOCKS: 20.0,
    BONDS: 30.0,
    REAL_ESTATE: 10.0,
  },
  lastRebalanced: '2024-01-01T00:00:00Z',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database using authenticated user
    return NextResponse.json({
      success: true,
      data: mockPortfolio,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.targetAllocation) {
      return NextResponse.json(
        { success: false, error: 'Name and target allocation are required' },
        { status: 400 }
      );
    }

    // In production, create portfolio in database
    const newPortfolio = {
      id: `portfolio-${Date.now()}`,
      userId: 'user-1',
      name: body.name,
      targetAllocation: body.targetAllocation,
      totalValue: 0,
      totalInvested: 0,
      totalGain: 0,
      holdings: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newPortfolio,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}
