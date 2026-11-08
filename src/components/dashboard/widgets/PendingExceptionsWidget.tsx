import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { ExceptionApprovalRequest } from '../../../types';

interface PendingExceptionsWidgetProps {
  exceptions: ExceptionApprovalRequest[];
  onOpenExceptionModal: () => void;
  className?: string;
}

export const PendingExceptionsWidget: React.FC<PendingExceptionsWidgetProps> = ({
  exceptions,
  onOpenExceptionModal,
  className = ''
}) => {
  const pendingCount = exceptions.filter(e => e.status === 'Pending').length;
  const approvedCount = exceptions.filter(e => e.status === 'Approved').length;
  const correctedCount = exceptions.filter(e => e.status === 'Corrected').length;

  const hasPending = pendingCount > 0;

  return (
    <DashboardWidget
      title="Pending Exceptions"
      value={pendingCount}
      secondaryValue={hasPending ? 'inconsistent states' : 'all clean'}
      icon={hasPending ? AlertTriangle : ShieldCheck}
      variant={hasPending ? 'amber' : 'emerald'}
      badge={{
        text: hasPending ? 'Section 14 Audit' : 'Integrity Verified',
        variant: hasPending ? 'amber' : 'emerald'
      }}
      subtitle={
        hasPending ? (
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {pendingCount} task(s) have contradictory status vs progress requiring manager sign-off.
          </div>
        ) : (
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            All imported tasks meet progress consistency rules ({approvedCount + correctedCount} resolved).
          </div>
        )
      }
      action={{
        label: hasPending ? 'Review & Approve' : 'View Audit Log',
        onClick: onOpenExceptionModal,
        icon: ArrowRight,
        variant: hasPending ? 'warning' : 'subtle'
      }}
      className={className}
    />
  );
};
