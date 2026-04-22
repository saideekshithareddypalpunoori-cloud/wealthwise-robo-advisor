import { NextRequest, NextResponse } from 'next/server';

// Mock goals data
const mockGoals = [
  {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Retirement (2055)',
    type: 'RETIREMENT',
    targetAmount: 1500000,
    currentAmount: 127543.82,
    monthlyContrib: 1500,
    targetDate: '2055-01-01T00:00:00Z',
    priority: 1,
    successProb: 78,
    projectedAmount: 1680000,
    riskLevel: 'moderate',
    isCompleted: false,
  },
  {
    id: 'goal-2',
    userId: 'user-1',
    name: 'House Down Payment',
    type: 'HOUSE',
    targetAmount: 80000,
    currentAmount: 45000,
    monthlyContrib: 2000,
    targetDate: '2026-06-01T00:00:00Z',
    priority: 2,
    successProb: 92,
    projectedAmount: 87000,
    riskLevel: 'conservative',
    isCompleted: false,
  },
  {
    id: 'goal-3',
    userId: 'user-1',
    name: 'Emergency Fund',
    type: 'EMERGENCY',
    targetAmount: 25000,
    currentAmount: 22500,
    monthlyContrib: 500,
    targetDate: '2024-12-01T00:00:00Z',
    priority: 3,
    successProb: 98,
    projectedAmount: 27000,
    riskLevel: 'conservative',
    isCompleted: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockGoals,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.targetAmount || !body.targetDate) {
      return NextResponse.json(
        { success: false, error: 'Name, type, target amount, and target date are required' },
        { status: 400 }
      );
    }

    // Calculate initial success probability (simplified)
    const monthsUntilTarget = Math.max(1,
      (new Date(body.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    );
    const monthlyNeeded = (body.targetAmount - (body.currentAmount || 0)) / monthsUntilTarget;
    const monthlyContrib = body.monthlyContrib || 0;
    const successProb = Math.min(99, Math.max(10, Math.round((monthlyContrib / monthlyNeeded) * 100)));

    const newGoal = {
      id: `goal-${Date.now()}`,
      userId: 'user-1',
      name: body.name,
      type: body.type,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount || 0,
      monthlyContrib: monthlyContrib,
      targetDate: body.targetDate,
      priority: body.priority || 1,
      successProb,
      projectedAmount: (body.currentAmount || 0) + (monthlyContrib * monthsUntilTarget * 1.06), // Assume 6% growth
      riskLevel: body.riskLevel || 'moderate',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newGoal,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
