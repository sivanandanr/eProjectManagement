import React from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Task } from '../../../types';

interface TaskCompletionRateWidgetProps {
  tasks: Task[];
  onNavigateToTracker?: () => void;
  className?: string;
}

export const TaskCompletionRateWidget: React.FC<TaskCompletionRateWidgetProps> = ({
  tasks,
  onNavigateToTracker,
  className = ''
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const notStartedTasks = tasks.filter(t => t.status === 'Not Started').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardWidget
      title="Task Completion Rate"
      value={`${completionRate}%`}
      secondaryValue={`(${completedTasks}/${totalTasks})`}
      icon={CheckCircle2}
      variant="emerald"
      badge={{
        text: `${inProgressTasks} In Progress`,
        variant: 'blue'
      }}
      progress={{
        current: completionRate,
        label: 'Overall Progress Velocity',
        colorClass: 'bg-emerald-500'
      }}
      subtitle={
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>{notStartedTasks} Not Started</span>
          <span>·</span>
          <span>{completedTasks} Verified Done</span>
        </div>
      }
      action={
        onNavigateToTracker
          ? {
              label: 'Open Activity Tracker',
              onClick: onNavigateToTracker,
              icon: ArrowUpRight,
              variant: 'primary'
            }
          : undefined
      }
      className={className}
    />
  );
};
