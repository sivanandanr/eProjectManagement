import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Target,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  Calendar,
  X,
  ChevronDown,
  Filter,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';

interface SubHeaderProps {
  onOpenDailyUpdateModal: () => void;
  onOpenImportModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenNewMissionModal: () => void;
  onOpenExceptionModal: () => void;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  onOpenDailyUpdateModal,
  onOpenImportModal,
  onOpenNewTaskModal,
  onOpenNewMissionModal,
  onOpenExceptionModal
}) => {
  const {
    projects,
    missions,
    tasks,
    selectedProjectId,
    setSelectedProjectId,
    selectedMissionId,
    setSelectedMissionId,
    exceptionRequests,
    departments
  } = useApp();

  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);

  const currentProject = projects.find(p => p.projectId === selectedProjectId) || projects[0];
  const currentDepartment = departments.find(d => d.departmentId === currentProject?.departmentId);
  const projectMissions = missions.filter(m => m.projectId === selectedProjectId);
  const activeMission = missions.find(m => m.missionId === selectedMissionId);

  // Scoped tasks calculation
  const scopedTasks = tasks.filter(t => {
    if (t.projectId !== selectedProjectId) return false;
    if (selectedMissionId !== 'all' && t.missionId !== selectedMissionId) return false;
    return true;
  });

  const pendingExceptions = exceptionRequests.filter(e => e.status === 'Pending');

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Clear Scope Hierarchy & Active Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5 hidden sm:inline">
            Scope:
          </div>

          {/* Project Selector with Department Label */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <FolderKanban className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={e => {
                  setSelectedProjectId(e.target.value);
                  setSelectedMissionId('all');
                }}
                className="text-xs font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                aria-label="Filter by project"
              >
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId} className="bg-white dark:bg-slate-900">
                    {p.code}: {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          {/* Mission Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <select
                value={selectedMissionId}
                onChange={e => setSelectedMissionId(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-xs truncate"
                aria-label="Filter by mission"
              >
                <option value="all" className="bg-white dark:bg-slate-900">
                  All Missions ({projectMissions.length})
                </option>
                {projectMissions.map(m => (
                  <option key={m.missionId} value={m.missionId} className="bg-white dark:bg-slate-900">
                    {m.missionCode}: {m.missionName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Mission Filter Chip (removes any confusion for selection!) */}
          {selectedMissionId !== 'all' && activeMission && (
            <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                Active: {activeMission.missionCode}
              </span>
              <button
                onClick={() => setSelectedMissionId('all')}
                className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded text-emerald-700 dark:text-emerald-300"
                title="Reset to All Missions"
                aria-label="Clear mission filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Live Scoped Tasks Indicator */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden md:inline-flex items-center gap-1">
            <span>·</span>
            <span>{scopedTasks.length} {scopedTasks.length === 1 ? 'task' : 'tasks'} scoped</span>
          </div>

          {/* Quick Exception Warning Banner if pending inconsistencies exist */}
          {pendingExceptions.length > 0 && (
            <button
              onClick={onOpenExceptionModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 transition-colors animate-pulse"
              title="Review Contradictory Tasks (Section 14: Inconsistent State Approvals)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{pendingExceptions.length} Inconsistent State(s)</span>
              <span className="underline ml-0.5">Review</span>
            </button>
          )}
        </div>

        {/* Right: Touch-Friendly Responsive Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
          {/* Primary CTA: Log Daily Activity */}
          <button
            onClick={onOpenDailyUpdateModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Log Daily Activity</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs"
            title="Import Excel / CSV spreadsheet with preview and column mapping"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
          </button>

          {/* Desktop Direct Add Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Task</span>
            </button>

            <button
              onClick={onOpenNewMissionModal}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mission</span>
            </button>
          </div>

          {/* Mobile Quick Create Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowQuickCreateMenu(!showQuickCreateMenu)}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg"
              aria-label="Create new item"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showQuickCreateMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1.5 z-40 text-xs">
                <button
                  onClick={() => {
                    setShowQuickCreateMenu(false);
                    onOpenNewTaskModal();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add New Task</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickCreateMenu(false);
                    onOpenNewMissionModal();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add New Mission</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
