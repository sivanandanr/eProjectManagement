import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyUpdate } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  TrendingUp,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface MyDailyUpdatesViewProps {
  onOpenDailyUpdateModal: (taskId?: string) => void;
  onOpenTaskDrawer: (taskId: string) => void;
}

export const MyDailyUpdatesView: React.FC<MyDailyUpdatesViewProps> = ({
  onOpenDailyUpdateModal,
  onOpenTaskDrawer
}) => {
  const { dailyUpdates, tasks, missions, currentUser } = useApp();

  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Updates logged by the current user
  const myUpdates = useMemo(() => {
    return dailyUpdates.filter(u => {
      if (u.submittedBy !== currentUser.userId) return false;
      if (dateFilter && u.updateDate !== dateFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (
          !u.workCompletedToday.toLowerCase().includes(term) &&
          !(u.plannedNextAction || '').toLowerCase().includes(term) &&
          !(u.blockerSummary || '').toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [dailyUpdates, currentUser.userId, dateFilter, searchTerm]);

  const totalHoursLogged = myUpdates.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);
  const distinctTasks = new Set(myUpdates.map(u => u.taskId)).size;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>My Daily Updates (Screen 48)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Personal operational activity timeline for {currentUser.name} ({currentUser.jobTitle})
          </p>
        </div>

        <button
          onClick={() => onOpenDailyUpdateModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today's Activity</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Submissions</span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {myUpdates.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Dated historical entries recorded</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Effort Recorded</span>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {totalHoursLogged} hours
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Accumulated without duplicate time entries</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distinct Tasks Progressed</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {distinctTasks} tasks
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Under assigned missions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search work completed or blockers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-60 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear date
            </button>
          )}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {myUpdates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="font-semibold text-sm">No daily activity updates found.</p>
            <p className="text-xs mt-1">Click "Log Today's Activity" above to record your accomplishments.</p>
          </div>
        ) : (
          myUpdates.map(update => {
            const task = tasks.find(t => t.taskId === update.taskId);
            const mission = missions.find(m => m.missionId === update.missionId);

            return (
              <div
                key={update.dailyUpdateId}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {update.updateDate}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {task?.taskCode}: {task?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-500">
                      Progress: <strong>{update.previousProgressPercentage}% → {update.newProgressPercentage}%</strong>
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {update.hoursSpent}h effort
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    Work Completed Today:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {update.workCompletedToday}
                  </p>
                </div>

                {update.plannedNextAction && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Planned Next Action:</strong> {update.plannedNextAction}
                  </div>
                )}

                {update.blockerSummary && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2 rounded">
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    <span>Blocker: {update.blockerSummary}</span>
                  </div>
                )}

                {update.remarks && (
                  <div className="text-[11px] text-slate-500 italic">
                    Remarks: {update.remarks}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
