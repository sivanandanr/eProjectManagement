import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyUpdate } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
  Building2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface TeamDailyUpdatesViewProps {
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenDailyUpdateModal: (taskId?: string) => void;
}

export const TeamDailyUpdatesView: React.FC<TeamDailyUpdatesViewProps> = ({
  onOpenTaskDrawer,
  onOpenDailyUpdateModal
}) => {
  const { dailyUpdates, tasks, missions, availableUsers, selectedProjectId } = useApp();

  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const scopedUpdates = useMemo(() => {
    return dailyUpdates.filter(u => {
      if (u.projectId !== selectedProjectId) return false;
      if (selectedStaff !== 'all' && u.submittedBy !== selectedStaff) return false;
      if (selectedMission !== 'all' && u.missionId !== selectedMission) return false;
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
  }, [dailyUpdates, selectedProjectId, selectedStaff, selectedMission, dateFilter, searchTerm]);

  const totalEffort = scopedUpdates.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);
  const activeBlockersLogged = scopedUpdates.filter(u => u.blockerSummary && u.blockerSummary.trim() !== '').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Team Daily Updates Hub (Screen 49)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manager oversight: cross-staff operational logs, daily effort reconciliation, and blockers
          </p>
        </div>

        <button
          onClick={() => onOpenDailyUpdateModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Log New Daily Entry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Team Logs In Scope</span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {scopedUpdates.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Verified activity submissions</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Team Effort Hours</span>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {totalEffort}h
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Accumulated across team tasks</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blockers Raised</span>
          <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {activeBlockersLogged}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Requiring manager intervention</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <select
            value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
          >
            <option value="all">All Team Members</option>
            {availableUsers.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.name} ({u.jobTitle})
              </option>
            ))}
          </select>

          {/* Mission Filter */}
          <select
            value={selectedMission}
            onChange={e => setSelectedMission(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium max-w-xs truncate"
          >
            <option value="all">All Missions</option>
            {missions.filter(m => m.projectId === selectedProjectId).map(m => (
              <option key={m.missionId} value={m.missionId}>
                {m.missionCode}: {m.missionName}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent font-mono focus:outline-none"
            />
          </div>
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-blue-600 hover:underline">
              Clear date
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team activity logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 w-56"
          />
        </div>
      </div>

      {/* Submissions Feed */}
      <div className="space-y-3">
        {scopedUpdates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No team daily updates found matching the criteria.
          </div>
        ) : (
          scopedUpdates.map(u => {
            const author = availableUsers.find(usr => usr.userId === u.submittedBy);
            const task = tasks.find(t => t.taskId === u.taskId);
            const mission = missions.find(m => m.missionId === u.missionId);

            return (
              <div
                key={u.dailyUpdateId}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {author?.name.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {author?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {author?.jobTitle} · <span className="font-mono">{u.updateDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-500">
                      Progress: <strong>{u.newProgressPercentage}%</strong>
                    </span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {u.hoursSpent}h logged
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <div className="text-slate-500 text-[10px] mb-0.5 font-mono">
                    Task: {task?.taskCode} — {task?.title} ({mission?.missionCode})
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white leading-relaxed">
                    {u.workCompletedToday}
                  </p>
                </div>

                {u.plannedNextAction && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                    <strong>Planned Next Action:</strong> {u.plannedNextAction}
                  </div>
                )}

                {u.blockerSummary && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Blocker Reported: {u.blockerSummary}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Submitted: {u.submittedAt ? new Date(u.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                  <button
                    onClick={() => task && onOpenTaskDrawer(task.taskId)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Task Card</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
