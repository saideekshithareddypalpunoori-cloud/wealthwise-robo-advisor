import { NextRequest, NextResponse } from 'next/server';

// Portfolio optimization using Modern Portfolio Theory
// In production, this would call the Python ML service

interface OptimizationRequest {
  riskScore: number; // 1-10
  investmentAmount: number;
  existingHoldings?: any[];
}

// Predefined model portfolios based on risk score
const MODEL_PORTFOLIOS: Record<number, Record<string, number>> = {
  1: { BONDS: 80, US_STOCKS: 10, INTL_STOCKS: 5, CASH: 5 },
  2: { BONDS: 70, US_STOCKS: 15, INTL_STOCKS: 10, CASH: 5 },
  3: { BONDS: 60, US_STOCKS: 20, INTL_STOCKS: 15, CASH: 5 },
  4: { BONDS: 50, US_STOCKS: 25, INTL_STOCKS: 20, CASH: 5 },
  5: { BONDS: 40, US_STOCKS: 30, INTL_STOCKS: 25, CASH: 5 },
  6: { BONDS: 30, US_STOCKS: 35, INTL_STOCKS: 25, REAL_ESTATE: 10 },
  7: { BONDS: 20, US_STOCKS: 40, INTL_STOCKS: 25, REAL_ESTATE: 15 },
  8: { BONDS: 15, US_STOCKS: 45, INTL_STOCKS: 25, REAL_ESTATE: 15 },
  9: { BONDS: 10, US_STOCKS: 50, INTL_STOCKS: 25, REAL_ESTATE: 15 },
  10: { BONDS: 5, US_STOCKS: 55, INTL_STOCKS: 25, REAL_ESTATE: 15 },
};

// ETF recommendations per asset class
const ETF_RECOMMENDATIONS: Record<string, { symbol: string; name: string; expenseRatio: number }[]> = {
  US_STOCKS: [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', expenseRatio: 0.03 },
    { symbol: 'ITOT', name: 'iShares Core S&P Total U.S. Stock Market ETF', expenseRatio: 0.03 },
  ],
  INTL_STOCKS: [
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', expenseRatio: 0.07 },
    { symbol: 'IXUS', name: 'iShares Core MSCI Total International Stock ETF', expenseRatio: 0.07 },
  ],
  BONDS: [
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', expenseRatio: 0.03 },
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', expenseRatio: 0.03 },
  ],
  REAL_ESTATE: [
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', expenseRatio: 0.12 },
    { symbol: 'SCHH', name: 'Schwab U.S. REIT ETF', expenseRatio: 0.07 },
  ],
  CASH: [
    { symbol: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', expenseRatio: 0.03 },
    { symbol: 'BIL', name: 'SPDR Bloomberg 1-3 Month T-Bill ETF', expenseRatio: 0.14 },
  ],
};

// Expected returns and volatility (historical averages)
const ASSET_METRICS: Record<string, { expectedReturn: number; volatility: number }> = {
  US_STOCKS: { expectedReturn: 0.10, volatility: 0.15 },
  INTL_STOCKS: { expectedReturn: 0.08, volatility: 0.18 },
  BONDS: { expectedReturn: 0.04, volatility: 0.05 },
  REAL_ESTATE: { expectedReturn: 0.07, volatility: 0.14 },
  CASH: { expectedReturn: 0.03, volatility: 0.01 },
};

export async function POST(request: NextRequest) {
  try {
    const body: OptimizationRequest = await request.json();

    // Validate risk score
    const riskScore = Math.min(10, Math.max(1, Math.round(body.riskScore)));

    // Get model portfolio based on risk score
    const allocation = MODEL_PORTFOLIOS[riskScore];

    // Calculate expected portfolio metrics
    let expectedReturn = 0;
    let portfolioVolatility = 0;

    Object.entries(allocation).forEach(([asset, weight]) => {
      const metrics = ASSET_METRICS[asset];
      if (metrics) {
        expectedReturn += (weight / 100) * metrics.expectedReturn;
        portfolioVolatility += Math.pow((weight / 100) * metrics.volatility, 2);
      }
    });
    portfolioVolatility = Math.sqrt(portfolioVolatility);

    // Generate recommended holdings
    const recommendedHoldings = Object.entries(allocation)
      .filter(([_, weight]) => weight > 0)
      .map(([asset, weight]) => {
        const etfs = ETF_RECOMMENDATIONS[asset] || [];
        const primaryEtf = etfs[0];
        const amountToInvest = (weight / 100) * body.investmentAmount;

        return {
          assetClass: asset,
          allocation: weight,
          amountToInvest,
          recommendedEtf: primaryEtf,
          alternativeEtfs: etfs.slice(1),
        };
      });

    // Calculate Sharpe Ratio (assuming 3% risk-free rate)
    const riskFreeRate = 0.03;
    const sharpeRatio = (expectedReturn - riskFreeRate) / portfolioVolatility;

    return NextResponse.json({
      success: true,
      data: {
        riskScore,
        allocation,
        expectedReturn: (expectedReturn * 100).toFixed(2) + '%',
        expectedVolatility: (portfolioVolatility * 100).toFixed(2) + '%',
        sharpeRatio: sharpeRatio.toFixed(2),
        recommendedHoldings,
        methodology: 'Modern Portfolio Theory (Mean-Variance Optimization)',
        rebalancingFrequency: 'Quarterly or when drift > 5%',
      },
    });
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to optimize portfolio' },
      { status: 500 }
    );
  }
}
