import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus, HealthStatus } from '../../types';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  History,
  FileText,
  Paperclip,
  MessageSquare,
  ShieldAlert,
  Send,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
  onOpenDailyUpdateModal: (taskId: string) => void;
  onOpenExceptionModal: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  onClose,
  onOpenDailyUpdateModal,
  onOpenExceptionModal
}) => {
  const {
    tasks,
    missions,
    projects,
    availableUsers,
    dailyUpdates,
    nextActions,
    risksAndBlockers,
    progressHistory,
    auditLogs,
    updateTaskInline,
    createNextAction,
    createRiskOrBlocker,
    currentUser,
    canEditTask
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'daily_updates' | 'next_actions' | 'risks' | 'comments' | 'attachments' | 'history'
  >('overview');

  // New action form state
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionDate, setNewActionDate] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

  // New blocker form state
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [newBlockerSeverity, setNewBlockerSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');

  // Comment state
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'CMT-1',
      user: 'David Ross',
      text: 'Please ensure failover runbooks are cross-checked with the network engineering team.',
      time: 'Yesterday at 3:15 PM'
    }
  ]);
  const [commentInput, setCommentInput] = useState('');

  if (!taskId) return null;

  const task = tasks.find(t => t.taskId === taskId);
  if (!task) return null;

  const mission = missions.find(m => m.missionId === task.missionId);
  const project = projects.find(p => p.projectId === task.projectId);
  const assignee = availableUsers.find(u => u.userId === task.assignedToId);

  const taskDailyUpdates = dailyUpdates.filter(u => u.taskId === taskId);
  const taskNextActions = nextActions.filter(a => a.taskId === taskId);
  const taskRisks = risksAndBlockers.filter(r => r.taskId === taskId);
  const taskProgressHistory = progressHistory.filter(h => h.taskId === taskId);
  const taskAuditLogs = auditLogs.filter(a => a.entityId === taskId);

  const isEditable = canEditTask(task);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: `CMT-${Date.now()}`,
        user: currentUser.name,
        text: commentInput.trim(),
        time: 'Just now'
      }
    ]);
    setCommentInput('');
  };

  const handleAddNextAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionDesc.trim()) return;
    createNextAction({
      taskId: task.taskId,
      description: newActionDesc.trim(),
      assignedTo: task.assignedToId,
      targetDate: newActionDate,
      status: 'Open',
      priority: task.priority,
      createdBy: currentUser.userId
    });
    setNewActionDesc('');
  };

  const handleAddBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerTitle.trim()) return;
    createRiskOrBlocker({
      projectId: task.projectId,
      missionId: task.missionId,
      taskId: task.taskId,
      riskType: 'Blocker',
      title: newBlockerTitle.trim(),
      description: `Raised from task drawer by ${currentUser.name}`,
      severity: newBlockerSeverity,
      status: 'Open',
      reportedBy: currentUser.userId,
      assignedTo: task.ownerId
    });
    setNewBlockerTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop for click-outside dismissal */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity pointer-events-auto"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col pointer-events-auto transition-all">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/90">
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-1">
            <span>{task.taskCode}</span>
            <span>·</span>
            <span>{mission?.missionName}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {task.title}
          </h2>

          {/* Validation Warning Notice if applicable (Section 14) */}
          {task.hasValidationWarning && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{task.validationWarningMessage}</span>
              </div>
              <button
                onClick={onOpenExceptionModal}
                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold shrink-0 ml-2"
              >
                Resolve Exception
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Progress Bar & Status Bar (Allows updating without navigating away) */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={task.status}
            disabled={!isEditable}
            onChange={e => updateTaskInline(task.taskId, { status: e.target.value as TaskStatus })}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={task.priority}
            disabled={!isEditable}
            onChange={e => updateTaskInline(task.taskId, { priority: e.target.value as TaskPriority })}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Progress:</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={task.progressPercentage}
            disabled={!isEditable}
            onChange={e => updateTaskInline(task.taskId, { progressPercentage: Number(e.target.value) })}
            className="w-24 accent-blue-600"
          />
          <span className="font-mono text-xs tabular-nums font-bold w-10 text-right">
            {task.progressPercentage}%
          </span>
        </div>

        <button
          onClick={() => onOpenDailyUpdateModal(task.taskId)}
          className="text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          + Log Activity
        </button>
      </div>

      {/* 7 Tabs per Section 12 */}
      <div className="flex items-center gap-1 px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('daily_updates')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'daily_updates'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Daily Updates ({taskDailyUpdates.length})
        </button>
        <button
          onClick={() => setActiveTab('next_actions')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'next_actions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Next Actions ({taskNextActions.length})
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'risks'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Risks & Blockers ({taskRisks.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'attachments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Attachments (2)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Audit History ({taskProgressHistory.length})
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block mb-1">
                Description
              </label>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                {task.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Excel Reference Snapshot Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Excel Tracking Snapshot</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Daily Update:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {task.dailyUpdateSummary || 'None recorded'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Next Action:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {task.nextActionSummary || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Active Blocker/Risk:</span>
                  <span className={task.blockerSummary ? 'font-semibold text-rose-600' : 'text-slate-500'}>
                    {task.blockerSummary || 'No active blockers'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Remarks:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {task.remarks || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Staff:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{assignee?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Due Date:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{task.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Health:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{task.health}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estimated Effort:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{task.estimatedHours} hours</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Actual Recorded Effort:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{task.actualHours} hours</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Row Version (Concurrency):</span>
                <span className="font-mono text-slate-500">v{task.rowVersion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Daily Updates Timeline */}
        {activeTab === 'daily_updates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Dated Activity Log ({taskDailyUpdates.length} entries)
              </span>
              <button
                onClick={() => onOpenDailyUpdateModal(task.taskId)}
                className="text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                + Record Today's Activity
              </button>
            </div>

            {taskDailyUpdates.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No daily updates logged for this task yet.
              </div>
            ) : (
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                {taskDailyUpdates.map(u => (
                  <div key={u.dailyUpdateId} className="relative bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {u.updateDate}
                      </span>
                      <span>{u.hoursSpent} hours logged · {u.newProgressPercentage}% progress</span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {u.workCompletedToday}
                    </p>
                    {u.plannedNextAction && (
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        <strong>Next:</strong> {u.plannedNextAction}
                      </p>
                    )}
                    {u.blockerSummary && (
                      <p className="text-rose-600 dark:text-rose-400 font-medium mt-1">
                        <strong>Blocker:</strong> {u.blockerSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Next Actions */}
        {activeTab === 'next_actions' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNextAction} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Add a concrete next action item..."
                value={newActionDesc}
                onChange={e => setNewActionDesc(e.target.value)}
                className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <input
                type="date"
                value={newActionDate}
                onChange={e => setNewActionDate(e.target.value)}
                className="text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs"
              >
                Add Action
              </button>
            </form>

            <div className="space-y-2">
              {taskNextActions.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No next actions registered.</div>
              ) : (
                taskNextActions.map(action => (
                  <div
                    key={action.nextActionId}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{action.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span>Target: <strong className="font-mono">{action.targetDate}</strong></span>
                        <span>Priority: {action.priority}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      action.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Risks & Blockers */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <form onSubmit={handleAddBlocker} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Raise Blocker / Risk</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe blocker title / obstacle..."
                  value={newBlockerTitle}
                  onChange={e => setNewBlockerTitle(e.target.value)}
                  className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <select
                  value={newBlockerSeverity}
                  onChange={e => setNewBlockerSeverity(e.target.value as any)}
                  className="text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 bg-rose-600 text-white rounded font-semibold text-xs"
                >
                  Raise
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {taskRisks.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No active blockers for this task.</div>
              ) : (
                taskRisks.map(risk => (
                  <div
                    key={risk.riskId}
                    className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        {risk.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{risk.description}</p>
                    {risk.resolutionNotes && (
                      <p className="text-[11px] text-slate-500 mt-1 bg-white/70 dark:bg-slate-900/60 p-2 rounded">
                        <strong>Mitigation:</strong> {risk.resolutionNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{c.user}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Attachments */}
        {activeTab === 'attachments' && (
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    CAB_Change_Request_Approval_RFC88421.pdf
                  </div>
                  <div className="text-[10px] text-slate-400">1.8 MB · Uploaded by Sarah Lin</div>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline">
                Download
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    PowerShell_DSC_Validation_Results.xlsx
                  </div>
                  <div className="text-[10px] text-slate-400">420 KB · Uploaded by Alex Chen</div>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline">
                Download
              </button>
            </div>
          </div>
        )}

        {/* Tab 7: History & Audit */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Task State & Progress Change History
            </div>
            {taskProgressHistory.length === 0 ? (
              <div className="py-6 text-center text-slate-400">No recorded history.</div>
            ) : (
              <div className="space-y-2">
                {taskProgressHistory.map(h => (
                  <div
                    key={h.historyId}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>{h.updatedAt ? new Date(h.updatedAt).toLocaleString() : 'Recent'}</span>
                      <span className="font-mono">User: {h.updatedBy}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span>Progress: {h.oldProgress}% → {h.newProgress}%</span>
                      <span>·</span>
                      <span>Status: {h.oldStatus} → {h.newStatus}</span>
                    </div>
                    {h.reason && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">
                        <strong>Reason:</strong> {h.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
