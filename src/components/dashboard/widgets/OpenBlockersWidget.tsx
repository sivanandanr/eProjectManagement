import React from 'react';
import { AlertOctagon, ArrowUpRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { RiskAndBlocker } from '../../../types';

interface OpenBlockersWidgetProps {
  blockers: RiskAndBlocker[];
  onNavigateToRisks?: () => void;
  className?: string;
}

export const OpenBlockersWidget: React.FC<OpenBlockersWidgetProps> = ({
  blockers,
  onNavigateToRisks,
  className = ''
}) => {
  const activeBlockers = blockers.filter(
    b => b.status !== 'Resolved' && b.status !== 'Closed'
  );
  const criticalCount = activeBlockers.filter(b => b.severity === 'Critical').length;
  const highCount = activeBlockers.filter(b => b.severity === 'High').length;
  const isCritical = criticalCount > 0;

  return (
    <DashboardWidget
      title="Open Blockers & Risks"
      value={activeBlockers.length}
      secondaryValue={isCritical ? 'active alerts' : 'under monitoring'}
      icon={AlertOctagon}
      variant={isCritical ? 'rose' : activeBlockers.length > 0 ? 'amber' : 'emerald'}
      badge={
        criticalCount > 0
          ? { text: `${criticalCount} Critical`, variant: 'rose' }
          : { text: `${highCount} High`, variant: 'amber' }
      }
      subtitle={
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span className={criticalCount > 0 ? 'text-rose-600 font-bold' : ''}>
            {criticalCount} Critical
          </span>
          <span>·</span>
          <span>{highCount} High Priority</span>
          <span>·</span>
          <span>Escalations Tracked</span>
        </div>
      }
      action={
        onNavigateToRisks
          ? {
              label: 'View Risks & Blockers',
              onClick: onNavigateToRisks,
              icon: ArrowUpRight,
              variant: isCritical ? 'danger' : 'subtle'
            }
          : undefined
      }
      className={className}
    />
  );
};
