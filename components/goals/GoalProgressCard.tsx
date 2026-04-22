'use client';

import { Target, Home, GraduationCap, Shield, Sparkles } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  successProb: number;
  type: string;
}

interface GoalProgressCardProps {
  goal: Goal;
}

const goalIcons: Record<string, React.ReactNode> = {
  RETIREMENT: <Target className="h-5 w-5" />,
  HOUSE: <Home className="h-5 w-5" />,
  EDUCATION: <GraduationCap className="h-5 w-5" />,
  EMERGENCY: <Shield className="h-5 w-5" />,
  CUSTOM: <Sparkles className="h-5 w-5" />,
};

const goalColors: Record<string, string> = {
  RETIREMENT: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  HOUSE: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  EDUCATION: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  EMERGENCY: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  CUSTOM: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
};

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const progressColor = goal.successProb >= 80 ? 'bg-emerald-500' : goal.successProb >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${goalColors[goal.type] || goalColors.CUSTOM}`}>
            {goalIcons[goal.type] || goalIcons.CUSTOM}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>
        <div className={`text-lg font-bold ${goal.successProb >= 80 ? 'text-emerald-600' : goal.successProb >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
          {goal.successProb}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">{progress.toFixed(1)}% funded</span>
        <span className="text-gray-500 dark:text-gray-400">
          ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
        </span>
      </div>

      {/* Success Probability Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Success Probability</span>
          <span className={`text-sm font-medium ${goal.successProb >= 80 ? 'text-emerald-600' : goal.successProb >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {goal.successProb >= 80 ? 'On Track' : goal.successProb >= 50 ? 'Needs Attention' : 'At Risk'}
          </span>
        </div>
      </div>
    </div>
  );
}
