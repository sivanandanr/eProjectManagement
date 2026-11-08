import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import {
  Kanban,
  Plus,
  AlertOctagon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';

interface ProjectBoardProps {
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({
  onOpenTaskDrawer,
  onOpenNewTaskModal
}) => {
  const {
    tasks,
    missions,
    availableUsers,
    selectedProjectId,
    selectedMissionId,
    updateTaskInline,
    canEditTask
  } = useApp();

  const scopedTasks = tasks.filter(t => {
    if (t.projectId !== selectedProjectId) return false;
    if (selectedMissionId !== 'all' && t.missionId !== selectedMissionId) return false;
    return true;
  });

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'Not Started', status: 'Not Started', color: 'border-slate-300 dark:border-slate-700' },
    { title: 'In Progress', status: 'In Progress', color: 'border-blue-400 dark:border-blue-700' },
    { title: 'Blocked', status: 'Blocked', color: 'border-rose-400 dark:border-rose-700' },
    { title: 'Completed', status: 'Completed', color: 'border-emerald-400 dark:border-emerald-700' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    if (!canEditTask(task)) {
      alert('Authorization Denied: You do not have permission to modify this task.');
      return;
    }

    let progress = task.progressPercentage;
    if (targetStatus === 'Completed') {
      progress = 100;
    } else if (targetStatus === 'Not Started') {
      progress = 0;
    } else if (targetStatus === 'In Progress' && (progress === 0 || progress === 100)) {
      progress = 50;
    }

    updateTaskInline(taskId, { status: targetStatus, progressPercentage: progress });
  };

  // Mobile status column filter
  const [mobileStatusTab, setMobileStatusTab] = useState<'all' | TaskStatus>('all');

  const visibleColumns = columns.filter(col => {
    if (mobileStatusTab === 'all') return true;
    return col.status === mobileStatusTab;
  });

  return (
    <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-600" />
            <span>Interactive Project Kanban Board</span>
          </h1>
          <p className="text-xs text-slate-500">
            Drag cards between columns or tap cards to inspect details and daily updates
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Mobile Column Tab Switcher */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2.5 shrink-0 border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          onClick={() => setMobileStatusTab('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            mobileStatusTab === 'all'
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All ({scopedTasks.length})
        </button>
        {columns.map(col => {
          const count = scopedTasks.filter(t => t.status === col.status).length;
          return (
            <button
              key={col.status}
              onClick={() => setMobileStatusTab(col.status)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                mobileStatusTab === col.status
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 sm:mt-4 overflow-y-auto min-h-0">
        {visibleColumns.map(col => {
          const colTasks = scopedTasks.filter(t => t.status === col.status);

          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.status)}
              className="flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-3 overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color.replace('border-', 'bg-')}`} />
                  <span>{col.title}</span>
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
                {colTasks.map(task => {
                  const mission = missions.find(m => m.missionId === task.missionId);
                  const assignee = availableUsers.find(u => u.userId === task.assignedToId);

                  return (
                    <div
                      key={task.taskId}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('text/plain', task.taskId)}
                      onClick={() => onOpenTaskDrawer(task.taskId)}
                      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all space-y-2"
                    >
                      {/* Card Header: Mission tag & Code */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="truncate max-w-[150px]">{mission?.missionCode}</span>
                        <span>{task.taskCode}</span>
                      </div>

                      {/* Card Title */}
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                        {task.title}
                      </h4>

                      {/* Contradictory Warning Tag */}
                      {task.hasValidationWarning && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 p-1 rounded">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">Contradictory Status/Progress</span>
                        </div>
                      )}

                      {/* Blocker Alert */}
                      {task.blockerSummary && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/40 p-1 rounded">
                          <AlertOctagon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{task.blockerSummary}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Progress</span>
                          <span className="font-mono tabular-nums font-semibold">{task.progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.progressPercentage === 100
                                ? 'bg-emerald-500'
                                : task.progressPercentage > 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${task.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Footer: Priority & Assignee */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px]">
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[9px] font-bold">
                            {assignee?.name.slice(0, 1)}
                          </div>
                          <span className="truncate max-w-[80px]">{assignee?.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
