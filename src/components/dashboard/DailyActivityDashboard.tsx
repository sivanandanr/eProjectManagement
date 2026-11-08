import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertOctagon,
  AlertTriangle,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Filter,
  CheckSquare
} from 'lucide-react';

interface DailyActivityDashboardProps {
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenDailyUpdateModal: (taskId?: string) => void;
}

export const DailyActivityDashboard: React.FC<DailyActivityDashboardProps> = ({
  onOpenTaskDrawer,
  onOpenDailyUpdateModal
}) => {
  const {
    projects,
    missions,
    tasks,
    dailyUpdates,
    nextActions,
    risksAndBlockers,
    availableUsers,
    departments,
    selectedProjectId,
    setActiveView
  } = useApp();

  // Filters state
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter tasks based on project and filters
  const scopedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.projectId !== selectedProjectId) return false;
      if (filterStaff !== 'all' && t.assignedToId !== filterStaff) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, selectedProjectId, filterStaff, filterPriority, filterStatus]);

  // Daily updates for the selected date
  const updatesToday = dailyUpdates.filter(u => u.updateDate === selectedDate && u.projectId === selectedProjectId);

  // Widget 1: Total Active Missions
  const activeMissions = missions.filter(m => m.projectId === selectedProjectId && m.status === 'In Progress').length;

  // Widget 2: Total Active Tasks
  const activeTasks = scopedTasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started' || t.status === 'Blocked');

  // Widget 3: Tasks Updated Today
  const taskIdsUpdatedToday = new Set(updatesToday.map(u => u.taskId));
  const tasksUpdatedToday = scopedTasks.filter(t => taskIdsUpdatedToday.has(t.taskId));

  // Widget 4: Tasks Completed Today
  const tasksCompletedToday = scopedTasks.filter(t => t.status === 'Completed' && taskIdsUpdatedToday.has(t.taskId));

  // Widget 5: Tasks Not Updated Today (Expected update rules: Active or In Progress tasks on working days)
  const tasksNotUpdatedToday = activeTasks.filter(t => !taskIdsUpdatedToday.has(t.taskId));

  // Widget 6: Overdue Tasks
  const overdueTasks = scopedTasks.filter(t => {
    if (t.status === 'Completed' || t.status === 'Cancelled') return false;
    return new Date(t.dueDate).getTime() < Date.now();
  });

  // Widget 7: Open Blockers
  const openBlockers = risksAndBlockers.filter(r => r.projectId === selectedProjectId && r.riskType === 'Blocker' && r.status !== 'Resolved' && r.status !== 'Closed');

  // Widget 8: Critical Risks
  const criticalRisks = risksAndBlockers.filter(r => r.projectId === selectedProjectId && r.severity === 'Critical' && r.status !== 'Resolved' && r.status !== 'Closed');

  // Widget 9 & 10: Pending vs Completed Next Actions
  const projectNextActions = nextActions.filter(a => {
    const task = tasks.find(t => t.taskId === a.taskId);
    return task?.projectId === selectedProjectId;
  });
  const pendingNextActions = projectNextActions.filter(a => a.status === 'Open' || a.status === 'In Progress');
  const completedNextActions = projectNextActions.filter(a => a.status === 'Completed');

  // Widget 11: Upcoming Deadlines (within 7 days)
  const upcomingDeadlines = scopedTasks
    .filter(t => t.status !== 'Completed' && t.status !== 'Cancelled')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Widget 12: Team Workload Distribution
  const workloadByStaff = useMemo(() => {
    return availableUsers.map(user => {
      const userTasks = scopedTasks.filter(t => t.assignedToId === user.userId);
      const userHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
      const userUpdatesToday = updatesToday.filter(u => u.submittedBy === user.userId).length;
      return {
        user,
        taskCount: userTasks.length,
        hours: userHours,
        updatesToday: userUpdatesToday
      };
    });
  }, [availableUsers, scopedTasks, updatesToday]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Daily Hub Sub-Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-fit max-w-full overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveView('activity_dashboard')}
          className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
        >
          Daily Hub Dashboard
        </button>
        <button
          onClick={() => setActiveView('my_updates')}
          className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          My Daily Updates (Screen 48)
        </button>
        <button
          onClick={() => setActiveView('team_updates')}
          className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Team Daily Updates (Screen 49)
        </button>
      </div>

      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Daily Activity Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time daily operations cadence, staff activity submissions, and exception governance (Section 8)
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
            />
          </div>

          <select
            value={filterStaff}
            onChange={e => setFilterStaff(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Staff</option>
            {availableUsers.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* 13 Widgets Grid per Section 8 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Widget 1 */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">1. Active Missions</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {activeMissions}
          </span>
        </div>

        {/* Widget 2 */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">2. Active Tasks</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {activeTasks.length}
          </span>
        </div>

        {/* Widget 3: Updated Today */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-semibold block">
            3. Updated Today
          </span>
          <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
            {tasksUpdatedToday.length}
          </span>
        </div>

        {/* Widget 4: Completed Today */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <span className="text-[10px] text-blue-800 dark:text-blue-300 uppercase font-semibold block">
            4. Completed Today
          </span>
          <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300 tabular-nums">
            {tasksCompletedToday.length}
          </span>
        </div>

        {/* Widget 5: Not Updated Today */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
          <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-semibold block">
            5. Pending Updates
          </span>
          <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300 tabular-nums">
            {tasksNotUpdatedToday.length}
          </span>
        </div>

        {/* Widget 6: Overdue */}
        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900">
          <span className="text-[10px] text-rose-800 dark:text-rose-300 uppercase font-semibold block">
            6. Overdue Tasks
          </span>
          <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300 tabular-nums">
            {overdueTasks.length}
          </span>
        </div>

        {/* Widget 7: Open Blockers */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">7. Open Blockers</span>
          <span className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {openBlockers.length}
          </span>
        </div>

        {/* Widget 8: Critical Risks */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">8. Critical Risks</span>
          <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
            {criticalRisks.length}
          </span>
        </div>

        {/* Widget 9: Pending Next Actions */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">9. Pending Actions</span>
          <span className="text-xl font-bold font-mono text-blue-600 tabular-nums">
            {pendingNextActions.length}
          </span>
        </div>

        {/* Widget 10: Completed Next Actions */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">10. Done Actions</span>
          <span className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {completedNextActions.length}
          </span>
        </div>

        {/* Widget 11: Upcoming Deadlines */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">11. Next Due</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {upcomingDeadlines.length}
          </span>
        </div>

        {/* Widget 13: Daily Velocity */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">13. Hours Today</span>
          <span className="text-xl font-bold font-mono text-indigo-600 tabular-nums">
            {updatesToday.reduce((sum, u) => sum + u.hoursSpent, 0)}h
          </span>
        </div>
      </div>

      {/* Middle Section: Tasks Requiring Updates vs Today's Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tasks Not Updated Today (Expected Update Rules) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Tasks Awaiting Today's Update ({tasksNotUpdatedToday.length})
              </h2>
              <p className="text-[11px] text-slate-400">
                Staff have not yet recorded progress or next actions for today
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {tasksNotUpdatedToday.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>All active tasks have received daily updates today!</span>
              </div>
            ) : (
              tasksNotUpdatedToday.map(t => (
                <div
                  key={t.taskId}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>Assigned: {availableUsers.find(u => u.userId === t.assignedToId)?.name}</span>
                      <span>·</span>
                      <span className="font-mono">Progress: {t.progressPercentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenDailyUpdateModal(t.taskId)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold shrink-0"
                  >
                    Log Today
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Work Completed Today Activity Log */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Work Completed Today ({updatesToday.length} logs)
              </h2>
              <p className="text-[11px] text-slate-400">
                Verified daily submissions on {selectedDate}
              </p>
            </div>
            <button
              onClick={() => onOpenDailyUpdateModal()}
              className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded"
            >
              + New Entry
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {updatesToday.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No daily updates logged yet for {selectedDate}.
              </div>
            ) : (
              updatesToday.map(u => {
                const task = tasks.find(t => t.taskId === u.taskId);
                const user = availableUsers.find(usr => usr.userId === u.submittedBy);
                return (
                  <div
                    key={u.dailyUpdateId}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
                      <span className="font-mono">{u.hoursSpent}h logged</span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {u.workCompletedToday}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                      <span>Task: <strong className="text-slate-700 dark:text-slate-300">{task?.taskCode}</strong></span>
                      <span>Progress: <strong className="font-mono">{u.newProgressPercentage}%</strong></span>
                      {u.plannedNextAction && <span>Next: {u.plannedNextAction}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Widget 12: Team Workload Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Team Workload & Daily Submission Compliance</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {workloadByStaff.map(({ user, taskCount, hours, updatesToday }) => (
            <div
              key={user.userId}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.jobTitle}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 dark:border-slate-700 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block">Tasks</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{taskCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Effort</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{hours}h</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Today</span>
                  <span className={`font-bold ${updatesToday > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {updatesToday} logs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
