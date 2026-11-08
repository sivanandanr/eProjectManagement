import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MissionPriority, MissionStatus, HealthStatus } from '../../types';
import { Target, X } from 'lucide-react';

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({ isOpen, onClose }) => {
  const { selectedProjectId, createMission, currentUser, availableUsers, departments } = useApp();

  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MissionPriority>('High');
  const [status, setStatus] = useState<MissionStatus>('In Progress');
  const [estimatedHours, setEstimatedHours] = useState<number>(160);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [plannedEndDate, setPlannedEndDate] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [ownerId, setOwnerId] = useState(currentUser.userId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionName.trim()) return;

    createMission({
      projectId: selectedProjectId,
      missionName: missionName.trim(),
      description: description.trim(),
      missionOwnerId: ownerId,
      departmentId: departments[0]?.departmentId || 'DEP-IT-01',
      priority,
      status,
      startDate,
      plannedEndDate,
      estimatedHours: Number(estimatedHours),
      actualHours: 0,
      progressPercentage: 0,
      healthStatus: 'On Track',
      createdBy: currentUser.userId,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.userId,
      isArchived: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create First-Class Mission Entity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add a core mission milestone under current project</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form id="new-mission-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold block mb-1">Mission Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Windows OS Production Staging & DR Switchover..."
              value={missionName}
              onChange={e => setMissionName(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Mission Description</label>
            <textarea
              rows={2}
              placeholder="Objective, scope boundaries, and completion criteria..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as MissionPriority)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as MissionStatus)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Draft">Draft</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Est. Effort (Hrs)</label>
              <input
                type="number"
                min={10}
                max={2000}
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Target End Date</label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={e => setPlannedEndDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Mission Owner</label>
              <select
                value={ownerId}
                onChange={e => setOwnerId(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {availableUsers.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-mission-form"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs transition-colors text-xs flex items-center gap-1.5"
          >
            <Target className="w-4 h-4" />
            <span>Save Mission</span>
          </button>
        </div>
      </div>
    </div>
  );
};
