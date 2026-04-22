import { NextRequest, NextResponse } from 'next/server';

// Monte Carlo simulation for goal success probability
// In production, this would call the Python ML service

interface SimulationParams {
  currentAmount: number;
  targetAmount: number;
  monthlyContrib: number;
  yearsUntilTarget: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

// Expected returns and volatility by risk level
const RISK_PROFILES = {
  conservative: { expectedReturn: 0.05, volatility: 0.08 },
  moderate: { expectedReturn: 0.07, volatility: 0.12 },
  aggressive: { expectedReturn: 0.09, volatility: 0.18 },
};

function runMonteCarloSimulation(params: SimulationParams, numSimulations: number = 10000) {
  const { currentAmount, targetAmount, monthlyContrib, yearsUntilTarget, riskLevel } = params;
  const profile = RISK_PROFILES[riskLevel];
  const monthlyReturn = profile.expectedReturn / 12;
  const monthlyVolatility = profile.volatility / Math.sqrt(12);
  const totalMonths = yearsUntilTarget * 12;

  const results: number[] = [];
  let successCount = 0;

  for (let sim = 0; sim < numSimulations; sim++) {
    let balance = currentAmount;

    for (let month = 0; month < totalMonths; month++) {
      // Generate random return using Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const monthReturn = monthlyReturn + z * monthlyVolatility;

      // Apply monthly return and add contribution
      balance = balance * (1 + monthReturn) + monthlyContrib;
    }

    results.push(balance);
    if (balance >= targetAmount) {
      successCount++;
    }
  }

  // Calculate statistics
  results.sort((a, b) => a - b);
  const successProb = (successCount / numSimulations) * 100;
  const median = results[Math.floor(numSimulations / 2)];
  const percentile10 = results[Math.floor(numSimulations * 0.1)];
  const percentile25 = results[Math.floor(numSimulations * 0.25)];
  const percentile75 = results[Math.floor(numSimulations * 0.75)];
  const percentile90 = results[Math.floor(numSimulations * 0.9)];
  const mean = results.reduce((a, b) => a + b, 0) / numSimulations;

  return {
    successProb: Math.round(successProb),
    projectedAmounts: {
      worst: Math.round(percentile10),
      pessimistic: Math.round(percentile25),
      median: Math.round(median),
      mean: Math.round(mean),
      optimistic: Math.round(percentile75),
      best: Math.round(percentile90),
    },
    numSimulations,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const goalId = params.id;

    // Validate required fields
    if (!body.currentAmount || !body.targetAmount || !body.targetDate) {
      return NextResponse.json(
        { success: false, error: 'Current amount, target amount, and target date are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(body.targetDate);
    const yearsUntilTarget = Math.max(0.1, (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365));

    const simulationParams: SimulationParams = {
      currentAmount: body.currentAmount,
      targetAmount: body.targetAmount,
      monthlyContrib: body.monthlyContrib || 0,
      yearsUntilTarget,
      riskLevel: body.riskLevel || 'moderate',
    };

    const simulation = runMonteCarloSimulation(simulationParams);

    // Generate recommendations based on success probability
    const recommendations: string[] = [];
    if (simulation.successProb < 50) {
      const shortfall = body.targetAmount - simulation.projectedAmounts.median;
      const additionalMonthly = shortfall / (yearsUntilTarget * 12);
      recommendations.push(`Increase monthly contributions by $${Math.round(additionalMonthly).toLocaleString()} to improve odds`);
      recommendations.push('Consider extending your target date if possible');
    } else if (simulation.successProb < 80) {
      recommendations.push('Consider increasing monthly contributions slightly');
      recommendations.push('Stay consistent with your current savings plan');
    } else {
      recommendations.push('Great progress! You\'re on track to meet your goal');
      recommendations.push('Consider increasing your target or starting a new goal');
    }

    return NextResponse.json({
      success: true,
      data: {
        goalId,
        simulation,
        recommendations,
        riskProfile: RISK_PROFILES[simulationParams.riskLevel],
        yearsUntilTarget: Math.round(yearsUntilTarget * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}
