'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock performance data
const generatePerformanceData = () => {
  const data = [];
  let portfolioValue = 100000;
  let benchmarkValue = 100000;
  const startDate = new Date('2023-01-01');

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate realistic daily returns
    const portfolioReturn = (Math.random() - 0.48) * 0.02; // Slight positive bias
    const benchmarkReturn = (Math.random() - 0.49) * 0.018;

    portfolioValue *= (1 + portfolioReturn);
    benchmarkValue *= (1 + benchmarkReturn);

    if (i % 7 === 0) { // Weekly data points
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        portfolio: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue),
      });
    }
  }

  return data;
};

const performanceData = generatePerformanceData();

export function PerformanceChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={performanceData}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'portfolio' ? 'Your Portfolio' : 'S&P 500',
            ]}
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="#6B7280"
            strokeWidth={2}
            fill="url(#benchmarkGradient)"
            name="benchmark"
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            name="portfolio"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Portfolio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">S&P 500 Benchmark</span>
        </div>
      </div>
    </div>
  );
}
