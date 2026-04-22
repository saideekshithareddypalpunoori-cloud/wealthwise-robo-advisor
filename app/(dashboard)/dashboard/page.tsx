'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Target,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PortfolioAllocationChart } from '@/components/charts/PortfolioAllocationChart';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { GoalProgressCard } from '@/components/goals/GoalProgressCard';

// Mock data for demonstration
const portfolioData = {
  totalValue: 127543.82,
  totalGain: 18234.56,
  totalGainPct: 16.7,
  dayChange: 342.18,
  dayChangePct: 0.27,
  holdings: [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', value: 51017.53, allocation: 40, targetAllocation: 40 },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', value: 25508.76, allocation: 20, targetAllocation: 20 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', value: 38263.15, allocation: 30, targetAllocation: 30 },
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', value: 12754.38, allocation: 10, targetAllocation: 10 },
  ],
  goals: [
    { id: '1', name: 'Retirement (2055)', targetAmount: 1500000, currentAmount: 127543.82, successProb: 78, type: 'RETIREMENT' },
    { id: '2', name: 'House Down Payment', targetAmount: 80000, currentAmount: 45000, successProb: 92, type: 'HOUSE' },
    { id: '3', name: 'Emergency Fund', targetAmount: 25000, currentAmount: 22500, successProb: 98, type: 'EMERGENCY' },
  ],
  needsRebalancing: true,
  driftAmount: 3.2,
};

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your portfolio overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Rebalancing Alert */}
      {portfolioData.needsRebalancing && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Rebalancing Recommended</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Your portfolio has drifted {portfolioData.driftAmount}% from target allocation.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            Review Rebalancing
          </button>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`$${portfolioData.totalValue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={null}
        />
        <StatCard
          title="Total Gain/Loss"
          value={`$${portfolioData.totalGain.toLocaleString()}`}
          icon={portfolioData.totalGain >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          trend={{ value: portfolioData.totalGainPct, isPositive: portfolioData.totalGain >= 0 }}
        />
        <StatCard
          title="Today's Change"
          value={`$${portfolioData.dayChange.toLocaleString()}`}
          icon={portfolioData.dayChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          trend={{ value: portfolioData.dayChangePct, isPositive: portfolioData.dayChange >= 0 }}
        />
        <StatCard
          title="Goals on Track"
          value={`${portfolioData.goals.filter(g => g.successProb >= 80).length}/${portfolioData.goals.length}`}
          icon={<Target className="h-5 w-5" />}
          trend={null}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Performance</h2>
          <PerformanceChart />
        </div>

        {/* Allocation Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Allocation</h2>
          <PortfolioAllocationChart holdings={portfolioData.holdings} />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Value</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Allocation</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Target</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Drift</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.holdings.map((holding) => {
                const drift = holding.allocation - holding.targetAllocation;
                return (
                  <tr key={holding.symbol} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{holding.symbol}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{holding.name}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                      ${holding.value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{holding.allocation}%</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{holding.targetAllocation}%</td>
                    <td className={`py-3 px-4 text-right ${drift > 0 ? 'text-green-600' : drift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {drift > 0 ? '+' : ''}{drift}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolioData.goals.map((goal) => (
            <GoalProgressCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: { value: number; isPositive: boolean } | null;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{title}</span>
        <div className={trend ? (trend.isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      {trend && (
        <div className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '+' : ''}{trend.value.toFixed(2)}%
        </div>
      )}
    </div>
  );
}
