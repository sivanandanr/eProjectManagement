import React from 'react';
import { Target, ArrowUpRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Mission } from '../../../types';

interface ActiveMissionsWidgetProps {
  missions: Mission[];
  onNavigateToMissions?: () => void;
  className?: string;
}

export const ActiveMissionsWidget: React.FC<ActiveMissionsWidgetProps> = ({
  missions,
  onNavigateToMissions,
  className = ''
}) => {
  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => m.status === 'In Progress').length;
  const completedMissions = missions.filter(m => m.status === 'Completed').length;
  const criticalMissions = missions.filter(m => m.healthStatus === 'Critical').length;
  const atRiskMissions = missions.filter(m => m.healthStatus === 'At Risk').length;

  // Average progress across all non-cancelled missions
  const activeList = missions.filter(m => m.status !== 'Cancelled');
  const avgProgress =
    activeList.length > 0
      ? Math.round(activeList.reduce((acc, m) => acc + m.progressPercentage, 0) / activeList.length)
      : 0;

  return (
    <DashboardWidget
      title="Active Missions"
      value={activeMissions}
      secondaryValue={`/ ${totalMissions} total`}
      icon={Target}
      variant="blue"
      badge={
        criticalMissions > 0
          ? { text: `${criticalMissions} Critical`, variant: 'rose' }
          : atRiskMissions > 0
          ? { text: `${atRiskMissions} At Risk`, variant: 'amber' }
          : { text: `${completedMissions} Done`, variant: 'emerald' }
      }
      progress={{
        current: avgProgress,
        label: 'Weighted Aggregate Progress',
        colorClass:
          criticalMissions > 0
            ? 'bg-rose-500'
            : atRiskMissions > 0
            ? 'bg-amber-500'
            : 'bg-blue-600'
      }}
      subtitle={
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>{completedMissions} Completed</span>
          <span>·</span>
          <span>{atRiskMissions + criticalMissions} Need Attention</span>
        </div>
      }
      action={
        onNavigateToMissions
          ? {
              label: 'View Missions Catalog',
              onClick: onNavigateToMissions,
              icon: ArrowUpRight,
              variant: 'primary'
            }
          : undefined
      }
      className={className}
    />
  );
};
