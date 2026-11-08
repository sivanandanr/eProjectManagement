import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';
import {
  WidgetGrid,
  ActiveMissionsWidget,
  TaskCompletionRateWidget,
  PendingExceptionsWidget,
  OpenBlockersWidget,
  EffortTrackingWidget
} from './widgets';

interface ExecutiveDashboardProps {
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenDailyUpdateModal: () => void;
  onOpenExceptionModal?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onOpenTaskDrawer,
  onOpenDailyUpdateModal,
  onOpenExceptionModal
}) => {
  const {
    projects,
    missions,
    tasks,
    risksAndBlockers,
    exceptionRequests,
    selectedProjectId,
    departments,
    availableUsers,
    setActiveView
  } = useApp();

  const currentProject = projects.find(p => p.projectId === selectedProjectId) || projects[0];
  const projectMissions = missions.filter(m => m.projectId === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const activeBlockers = risksAndBlockers.filter(
    r => r.projectId === selectedProjectId && r.status !== 'Resolved' && r.status !== 'Closed'
  );

  // Upcoming deadlines (tasks due in next 10 days not completed)
  const upcomingTasks = [...projectTasks]
    .filter(t => t.status !== 'Completed' && t.status !== 'Cancelled')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner with Quick Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl shadow-md">
        <div>
          <div className="text-xs font-mono text-blue-200 uppercase tracking-wider mb-1">
            Executive Project Portfolio Oversight
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {currentProject.name} ({currentProject.code})
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
            {currentProject.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('tracker')}
            className="px-3.5 py-2 bg-white text-blue-950 font-semibold rounded-lg text-xs hover:bg-blue-50 transition-colors shadow-sm"
          >
            Open Activity Tracker
          </button>
          <button
            onClick={onOpenDailyUpdateModal}
            className="px-3.5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-500 transition-colors shadow-sm"
          >
            Log Activity
          </button>
        </div>
      </div>

      {/* Top-Level Metrics via New DashboardWidget Component Library */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top-Level Key Performance Indicators
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Real-time Aggregation
          </span>
        </div>

        <WidgetGrid columns={5}>
          {/* Top-Level Metric 1: Active Missions */}
          <ActiveMissionsWidget
            missions={projectMissions}
            onNavigateToMissions={() => setActiveView('missions')}
          />

          {/* Top-Level Metric 2: Task Completion Rate */}
          <TaskCompletionRateWidget
            tasks={projectTasks}
            onNavigateToTracker={() => setActiveView('tracker')}
          />

          {/* Top-Level Metric 3: Pending Exceptions */}
          <PendingExceptionsWidget
            exceptions={exceptionRequests}
            onOpenExceptionModal={
              onOpenExceptionModal || (() => setActiveView('audit'))
            }
          />

          {/* Top-Level Metric 4: Open Blockers & Risks */}
          <OpenBlockersWidget
            blockers={activeBlockers}
            onNavigateToRisks={() => setActiveView('risks')}
          />

          {/* Top-Level Metric 5: Effort Logged vs Plan */}
          <EffortTrackingWidget
            tasks={projectTasks}
            onNavigateToDailyHub={() => setActiveView('activity_dashboard')}
          />
        </WidgetGrid>
      </div>

      {/* Main Grid: Mission Health & Progress + Blockers Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Mission Health and Weighted Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Missions Progress & Health
              </h2>
              <p className="text-xs text-slate-500">
                Effort-weighted aggregation across all underlying tasks
              </p>
            </div>
            <button
              onClick={() => setActiveView('tracker')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View In Tracker</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {projectMissions.map(m => {
              const missionTasks = projectTasks.filter(t => t.missionId === m.missionId);
              const completedCount = missionTasks.filter(t => t.status === 'Completed').length;

              return (
                <div
                  key={m.missionId}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {m.missionCode}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {m.missionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {m.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          m.healthStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : m.healthStatus === 'Critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : m.healthStatus === 'At Risk'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {m.healthStatus}
                      </span>
                      <span className="text-xs font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {m.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.progressPercentage === 100
                          ? 'bg-emerald-500'
                          : m.progressPercentage >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${m.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Tasks: <strong>{completedCount} of {missionTasks.length} Completed</strong>
                    </span>
                    <span>
                      Effort: <strong className="font-mono">{m.actualHours}h actual / {m.estimatedHours}h est.</strong>
                    </span>
                    <span>
                      Owner: <strong>{availableUsers.find(u => u.userId === m.missionOwnerId)?.name || 'Lead'}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Active Blockers Radar & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Active Blockers Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Active Blocker Radar</span>
              </h2>
              <span className="text-xs font-mono font-semibold text-rose-600">
                {activeBlockers.length} open
              </span>
            </div>

            <div className="space-y-2.5">
              {activeBlockers.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No open blockers in this project.
                </div>
              ) : (
                activeBlockers.map(b => (
                  <div
                    key={b.riskId}
                    className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-rose-900 dark:text-rose-200">
                        {b.title}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 shrink-0">
                        {b.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {b.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                      <span>Reported by: {availableUsers.find(u => u.userId === b.reportedBy)?.name || 'Staff'}</span>
                      <span className="font-mono">{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Upcoming Milestones</span>
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {upcomingTasks.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No upcoming task deadlines scheduled.
                </div>
              ) : (
                upcomingTasks.map(t => (
                  <div
                    key={t.taskId}
                    onClick={() => onOpenTaskDrawer(t.taskId)}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {t.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Due: {t.dueDate}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                      {t.progressPercentage}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
