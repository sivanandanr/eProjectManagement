import React from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Task } from '../../../types';

interface EffortTrackingWidgetProps {
  tasks: Task[];
  onNavigateToDailyHub?: () => void;
  className?: string;
}

export const EffortTrackingWidget: React.FC<EffortTrackingWidgetProps> = ({
  tasks,
  onNavigateToDailyHub,
  className = ''
}) => {
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const burnPercent = totalEstHours > 0 ? Math.round((totalActualHours / totalEstHours) * 100) : 0;
  const isOverBudget = burnPercent > 100;

  return (
    <DashboardWidget
      title="Effort Logged vs Plan"
      value={`${totalActualHours}h`}
      secondaryValue={`/ ${totalEstHours}h est.`}
      icon={Clock}
      variant={isOverBudget ? 'rose' : 'indigo'}
      badge={{
        text: `${burnPercent}% Burned`,
        variant: isOverBudget ? 'rose' : 'indigo'
      }}
      progress={{
        current: Math.min(100, burnPercent),
        label: 'Budget Utilization',
        colorClass: isOverBudget ? 'bg-rose-500' : 'bg-indigo-600'
      }}
      subtitle={
        <div className="text-[10px] text-slate-500 font-mono">
          Logged via Daily Activity Updates (zero duplicate hours)
        </div>
      }
      action={
        onNavigateToDailyHub
          ? {
              label: 'View Daily Hub',
              onClick: onNavigateToDailyHub,
              icon: ArrowUpRight,
              variant: 'primary'
            }
          : undefined
      }
      className={className}
    />
  );
};
