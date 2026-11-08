import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Mission, MissionStatus, MissionPriority, HealthStatus } from '../../types';
import {
  Target,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Archive,
  Layers,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface MissionListingViewProps {
  onOpenNewMissionModal: () => void;
  onEditMission?: (mission: Mission) => void;
}

export const MissionListingView: React.FC<MissionListingViewProps> = ({
  onOpenNewMissionModal
}) => {
  const {
    missions,
    projects,
    tasks,
    availableUsers,
    selectedProjectId,
    navigateToMissionDetails,
    updateMission,
    deleteMission,
    archiveMission,
    canManageMissions
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Edit / Delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      if (m.projectId !== selectedProjectId) return false;
      if (!showArchived && m.isArchived) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (healthFilter !== 'all' && m.healthStatus !== healthFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (
          !m.missionName.toLowerCase().includes(term) &&
          !m.missionCode.toLowerCase().includes(term) &&
          !m.description.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [missions, selectedProjectId, showArchived, statusFilter, healthFilter, searchTerm]);

  const handleOpenCreate = () => {
    setMissionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mission: Mission, e: React.MouseEvent) => {
    e.stopPropagation();
    setMissionToEdit(mission);
    setIsModalOpen(true);
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    const res = deleteMission(deleteConfirm.id);
    if (!res.success) {
      notify('error', res.error || 'Failed to delete mission.');
    } else {
      notify('success', `Mission ${deleteConfirm.code} deleted successfully.`);
    }
    setDeleteConfirm(null);
  };

  const handleToggleArchive = (missionId: string, currentArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    archiveMission(missionId, !currentArchived);
    notify('success', `Mission ${!currentArchived ? 'archived' : 'restored'}.`);
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <span>Missions Catalog (Screen 43)</span>
          </h1>
          <p className="text-xs text-slate-500">
            First-class mission entities, effort-weighted progress aggregation, and health governance
          </p>
        </div>

        {canManageMissions() && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Mission</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search missions by name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-60 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={e => setHealthFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Health: All</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Critical">Critical</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
            className="rounded text-blue-600 focus:ring-0"
          />
          <span>Show Archived Missions</span>
        </label>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No missions found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your search filters or create a new mission to get started.
            </p>
            {canManageMissions() && (
              <button
                onClick={handleOpenCreate}
                className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold"
              >
                Create Mission
              </button>
            )}
          </div>
        ) : (
          filteredMissions.map(mission => {
            const missionTasks = tasks.filter(t => t.missionId === mission.missionId);
            const completedTasks = missionTasks.filter(t => t.status === 'Completed').length;
            const owner = availableUsers.find(u => u.userId === mission.missionOwnerId);

            return (
              <div
                key={mission.missionId}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {mission.missionCode}
                        </span>
                        {mission.isArchived && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {mission.missionName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          mission.healthStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : mission.healthStatus === 'Critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : mission.healthStatus === 'At Risk'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {mission.healthStatus}
                      </span>

                      {canManageMissions() && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={e => handleOpenEdit(mission, e)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Mission"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setDeleteConfirm({
                                id: mission.missionId,
                                code: mission.missionCode,
                                name: mission.missionName
                              });
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Mission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {mission.description}
                  </p>
                </div>

                {/* Progress & Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400">
                      Weighted Aggregated Progress
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {mission.progressPercentage}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        mission.progressPercentage === 100
                          ? 'bg-emerald-500'
                          : mission.progressPercentage >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${mission.progressPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <div>
                      <span className="block text-[10px] text-slate-400">Tasks</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {completedTasks} / {missionTasks.length} Done
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Effort Logged</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {mission.actualHours}h / {mission.estimatedHours}h
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Mission Owner</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate block">
                        {owner?.name || 'Unassigned'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={e => handleToggleArchive(mission.missionId, mission.isArchived, e)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{mission.isArchived ? 'Unarchive' : 'Archive'}</span>
                  </button>

                  <button
                    onClick={() => navigateToMissionDetails(mission.missionId)}
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>Mission Details & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Unified Mission Modal (Create & Edit) */}
      <MissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        missionToEdit={missionToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
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
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deleteConfirm.code}: {deleteConfirm.name}</strong>?
              Missions with active child tasks cannot be deleted until tasks are reassigned or deleted.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
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
