import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NextAction, NextActionStatus, TaskPriority } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

interface NextActionRegisterProps {
  onOpenTaskDrawer?: (taskId: string) => void;
}

export const NextActionRegister: React.FC<NextActionRegisterProps> = ({
  onOpenTaskDrawer
}) => {
  const {
    nextActions,
    tasks,
    missions,
    availableUsers,
    selectedProjectId,
    createNextAction,
    completeNextAction,
    currentUser
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [newDesc, setNewDesc] = useState('');
  const [newTaskId, setNewTaskId] = useState('');
  const [newTargetDate, setNewTargetDate] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<TaskPriority>('High');
  const [newAssignee, setNewAssignee] = useState(currentUser.userId);

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  const filteredActions = useMemo(() => {
    return nextActions.filter(action => {
      const task = tasks.find(t => t.taskId === action.taskId);
      if (task && task.projectId !== selectedProjectId) return false;
      if (statusFilter !== 'all' && action.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!action.description.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [nextActions, tasks, selectedProjectId, statusFilter, searchTerm]);

  const openActions = filteredActions.filter(a => a.status === 'Open' || a.status === 'In Progress');
  const completedActions = filteredActions.filter(a => a.status === 'Completed');
  const overdueActions = filteredActions.filter(a => a.status !== 'Completed' && new Date(a.targetDate).getTime() < Date.now());

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newTaskId) return;

    createNextAction({
      taskId: newTaskId,
      description: newDesc.trim(),
      assignedTo: newAssignee,
      targetDate: newTargetDate,
      status: 'Open',
      priority: newPriority,
      createdBy: currentUser.userId
    });

    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Next Action Management Register (Screen 50)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Structured next action tracking converting free-text into accountable milestone deliverables (Section 5)
          </p>
        </div>

        <button
          onClick={() => {
            if (projectTasks.length > 0) setNewTaskId(projectTasks[0].taskId);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Next Action</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Outstanding Actions</span>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {openActions.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Pending completion</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overdue Action Alerts</span>
          <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {overdueActions.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Target date exceeded</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed Actions</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {completedActions.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Archived in history</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search next action descriptions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 w-60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
          >
            <option value="all">Status: All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Description</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Linked Task</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Owner</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Priority</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Target Date</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredActions.map(action => {
              const task = tasks.find(t => t.taskId === action.taskId);
              const owner = availableUsers.find(u => u.userId === action.assignedTo);
              const isOverdue = action.status !== 'Completed' && new Date(action.targetDate).getTime() < Date.now();
              const isDone = action.status === 'Completed';

              return (
                <tr key={action.nextActionId} className={isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800 max-w-md">
                    {action.description}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    {task?.taskCode}: {task?.title}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {owner?.name}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">
                    {action.priority}
                  </td>
                  <td className="px-4 py-3 text-center font-mono border-r border-slate-100 dark:border-slate-800">
                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                      {action.targetDate}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!isDone ? (
                      <button
                        onClick={() => completeNextAction(action.nextActionId)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold shadow-xs"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredActions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No next actions recorded for this project scope. Click "+ Add Next Action" to register one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Create Trackable Next Action</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Target Task *</label>
                <select
                  value={newTaskId}
                  onChange={e => setNewTaskId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {projectTasks.map(t => (
                    <option key={t.taskId} value={t.taskId}>
                      {t.taskCode}: {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Action Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Validate telemetry pipeline with InfoSec..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {availableUsers.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
