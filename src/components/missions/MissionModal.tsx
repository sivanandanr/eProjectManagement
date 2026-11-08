import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mission, MissionPriority, MissionStatus, HealthStatus } from '../../types';
import { Target, X, Calendar, User, Clock, AlertTriangle } from 'lucide-react';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionToEdit?: Mission | null;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  isOpen,
  onClose,
  missionToEdit
}) => {
  const {
    projects,
    selectedProjectId,
    createMission,
    updateMission,
    currentUser,
    availableUsers,
    departments
  } = useApp();

  const isEditing = Boolean(missionToEdit);

  const [projectId, setProjectId] = useState(selectedProjectId);
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MissionPriority>('High');
  const [status, setStatus] = useState<MissionStatus>('In Progress');
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('On Track');
  const [estimatedHours, setEstimatedHours] = useState<number>(160);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [plannedEndDate, setPlannedEndDate] = useState(
    () => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [actualEndDate, setActualEndDate] = useState<string>('');
  const [ownerId, setOwnerId] = useState(currentUser.userId);
  const [departmentId, setDepartmentId] = useState(departments[0]?.departmentId || 'DEP-IT-01');
  const [isArchived, setIsArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (missionToEdit) {
      setProjectId(missionToEdit.projectId);
      setMissionName(missionToEdit.missionName);
      setDescription(missionToEdit.description);
      setPriority(missionToEdit.priority);
      setStatus(missionToEdit.status);
      setHealthStatus(missionToEdit.healthStatus);
      setEstimatedHours(missionToEdit.estimatedHours);
      setStartDate(missionToEdit.startDate);
      setPlannedEndDate(missionToEdit.plannedEndDate);
      setActualEndDate(missionToEdit.actualEndDate || '');
      setOwnerId(missionToEdit.missionOwnerId);
      setDepartmentId(missionToEdit.departmentId);
      setIsArchived(missionToEdit.isArchived);
    } else {
      setProjectId(selectedProjectId);
      setMissionName('');
      setDescription('');
      setPriority('High');
      setStatus('In Progress');
      setHealthStatus('On Track');
      setEstimatedHours(160);
      setStartDate(new Date().toISOString().split('T')[0]);
      setPlannedEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setActualEndDate('');
      setOwnerId(currentUser.userId);
      setDepartmentId(departments[0]?.departmentId || 'DEP-IT-01');
      setIsArchived(false);
    }
    setError(null);
  }, [missionToEdit, selectedProjectId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionName.trim()) {
      setError('Mission Name is required.');
      return;
    }

    if (isEditing && missionToEdit) {
      updateMission(missionToEdit.missionId, {
        projectId,
        missionName: missionName.trim(),
        description: description.trim(),
        missionOwnerId: ownerId,
        departmentId,
        priority,
        status,
        healthStatus,
        startDate,
        plannedEndDate,
        actualEndDate: actualEndDate || undefined,
        estimatedHours: Number(estimatedHours),
        isArchived
      });
    } else {
      createMission({
        projectId: projectId || selectedProjectId,
        missionName: missionName.trim(),
        description: description.trim(),
        missionOwnerId: ownerId,
        departmentId,
        priority,
        status,
        startDate,
        plannedEndDate,
        actualEndDate: actualEndDate || undefined,
        estimatedHours: Number(estimatedHours),
        actualHours: 0,
        progressPercentage: 0,
        healthStatus,
        createdBy: currentUser.userId,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.userId,
        isArchived
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isEditing
                  ? `Edit Mission: ${missionToEdit?.missionCode}`
                  : 'Create First-Class Mission Entity'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? 'Update mission governance, targets, owner, and lifecycle state'
                  : 'Establish a new mission under the project with effort-weighted aggregation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
            {/* Project & Department Binding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Parent Project *
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Assigned Department *
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mission Name */}
          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Mission Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Windows OS Production Staging & DR Switchover..."
              value={missionName}
              onChange={e => setMissionName(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Mission Description */}
          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Objective & Scope Boundaries
            </label>
            <textarea
              rows={2}
              placeholder="Objective, operational scope boundaries, and key completion criteria..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Priority, Status, Health */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as MissionPriority)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as MissionStatus)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Draft">Draft</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Health Status
              </label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value as HealthStatus)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Critical">Critical</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Timeline & Effort */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Planned End Date
              </label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={e => setPlannedEndDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Est. Hours
              </label>
              <input
                type="number"
                min={0}
                max={5000}
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Owner & Archive */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Mission Owner (Accountable Lead)
              </label>
              <select
                value={ownerId}
                onChange={e => setOwnerId(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {availableUsers.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={e => setIsArchived(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-medium">Archive Completed Mission</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action buttons (Pinned Footer) */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
