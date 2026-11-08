import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, MissionStatus, HealthStatus } from '../../types';
import {
  Target,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Users,
  Plus,
  Archive,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface MissionDetailsViewProps {
  onBackToMissions: () => void;
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenDailyUpdateModal: (taskId?: string) => void;
  onOpenNewTaskModal: () => void;
}

export const MissionDetailsView: React.FC<MissionDetailsViewProps> = ({
  onBackToMissions,
  onOpenTaskDrawer,
  onOpenDailyUpdateModal,
  onOpenNewTaskModal
}) => {
  const {
    missions,
    tasks,
    projects,
    dailyUpdates,
    risksAndBlockers,
    nextActions,
    availableUsers,
    selectedMissionIdForDetails,
    updateMission,
    deleteMission,
    archiveMission,
    updateTaskInline,
    canManageMissions
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'daily' | 'risks' | 'actions'>('tasks');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const mission = missions.find(m => m.missionId === selectedMissionIdForDetails) || missions[0];
  const project = projects.find(p => p.projectId === mission?.projectId);
  const owner = availableUsers.find(u => u.userId === mission?.missionOwnerId);

  const missionTasks = tasks.filter(t => t.missionId === mission?.missionId);
  const missionUpdates = dailyUpdates.filter(u => u.missionId === mission?.missionId);
  const missionRisks = risksAndBlockers.filter(r => r.missionId === mission?.missionId);
  const missionNextActions = nextActions.filter(a => {
    const task = tasks.find(t => t.taskId === a.taskId);
    return task?.missionId === mission?.missionId;
  });

  const completedTasks = missionTasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = missionTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate).getTime() < Date.now());

  if (!mission) return null;

  const handleDeleteMission = () => {
    const res = deleteMission(mission.missionId);
    if (!res.success) {
      notify('error', res.error || 'Failed to delete mission.');
      setIsDeleteDialogOpen(false);
    } else {
      onBackToMissions();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMissions}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Missions Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          {canManageMissions() && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                title="Edit Mission Properties"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Edit Mission</span>
              </button>

              <button
                onClick={() => archiveMission(mission.missionId, !mission.isArchived)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{mission.isArchived ? 'Unarchive Mission' : 'Archive Mission'}</span>
              </button>

              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-rose-200 dark:border-rose-900/60 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                title="Delete Mission"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task to Mission</span>
          </button>
        </div>
      </div>

      {/* Mission Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {mission.missionCode}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {project?.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {mission.missionName}
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              {mission.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`text-xs font-bold px-3 py-1 rounded ${
                mission.healthStatus === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : mission.healthStatus === 'Critical'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : mission.healthStatus === 'At Risk'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              Health: {mission.healthStatus}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              {mission.status}
            </span>
          </div>
        </div>

        {/* Aggregated Progress Slider & Metric Strip */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              Configurable Weighted Aggregated Progress (Section 1)
            </span>
            <span className="font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
              {mission.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                mission.progressPercentage === 100
                  ? 'bg-emerald-500'
                  : mission.progressPercentage >= 50
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${mission.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Mission Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="block text-[10px] text-slate-400">Owner</span>
            <strong className="text-slate-800 dark:text-slate-200">{owner?.name || 'Lead'}</strong>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400">Timeline</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">
              {mission.startDate} → {mission.plannedEndDate}
            </strong>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400">Effort Invested</span>
            <strong className="font-mono text-blue-600 dark:text-blue-400">
              {mission.actualHours}h actual / {mission.estimatedHours}h est.
            </strong>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400">Tasks Completed</span>
            <strong className="text-emerald-600">
              {completedTasks} / {missionTasks.length} Completed
            </strong>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400">Overdue Deliverables</span>
            <strong className={overdueTasks.length > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
              {overdueTasks.length} Overdue
            </strong>
          </div>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Child Tasks ({missionTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'daily'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Mission Daily Activity Log ({missionUpdates.length})
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'risks'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Risks & Blockers ({missionRisks.length})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'actions'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Next Actions ({missionNextActions.length})
        </button>
      </div>

      {/* Tab 1: Tasks List */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Task Code</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Task Title</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Assigned To</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Priority</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Status</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Progress %</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-right">Hours</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {missionTasks.map(task => {
                const assignee = availableUsers.find(u => u.userId === task.assignedToId);
                return (
                  <tr key={task.taskId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      {task.taskCode}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                      {task.dailyUpdateSummary && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                          Latest: {task.dailyUpdateSummary}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {assignee?.name}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">
                      {task.priority}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold border-r border-slate-100 dark:border-slate-800">
                      {task.progressPercentage}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono border-r border-slate-100 dark:border-slate-800">
                      {task.actualHours}h / {task.estimatedHours}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenDailyUpdateModal(task.taskId)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded text-[11px] font-semibold"
                        >
                          Log
                        </button>
                        <button
                          onClick={() => onOpenTaskDrawer(task.taskId)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Daily Activity Log */}
      {activeTab === 'daily' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Activity Updates Submitted Under Mission
          </h3>
          <div className="space-y-3">
            {missionUpdates.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity updates logged for this mission yet.
              </div>
            ) : (
              missionUpdates.map(u => {
                const user = availableUsers.find(usr => usr.userId === u.submittedBy);
                const task = tasks.find(t => t.taskId === u.taskId);
                return (
                  <div key={u.dailyUpdateId} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name} · {u.updateDate}</span>
                      <span className="font-mono">{u.hoursSpent}h effort · {u.newProgressPercentage}% progress</span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {u.workCompletedToday}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Task: {task?.taskCode} - {task?.title}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Risks & Blockers */}
      {activeTab === 'risks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Risks & Blockers Registered
          </h3>
          <div className="space-y-2">
            {missionRisks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active blockers or risks for this mission.
              </div>
            ) : (
              missionRisks.map(r => (
                <div key={r.riskId} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      {r.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{r.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Next Actions */}
      {activeTab === 'actions' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Nearest Outstanding Next Actions
          </h3>
          <div className="space-y-2">
            {missionNextActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No next actions recorded.
              </div>
            ) : (
              missionNextActions.map(a => (
                <div key={a.nextActionId} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{a.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Target Date: {a.targetDate}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Mission Modal */}
      <MissionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        missionToEdit={mission}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Delete Mission
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{mission.missionCode}: {mission.missionName}</strong>?
              Missions with active child tasks cannot be deleted until tasks are reassigned or removed.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMission}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
