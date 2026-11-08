import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus } from '../../types';
import { Plus, X } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { missions, availableUsers, selectedProjectId, selectedMissionId, createTask, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [missionId, setMissionId] = useState(selectedMissionId !== 'all' ? selectedMissionId : missions[0]?.missionId || '');
  const [assignedToId, setAssignedToId] = useState(currentUser.userId);
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(20);
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [dailyUpdateSummary, setDailyUpdateSummary] = useState('');
  const [nextActionSummary, setNextActionSummary] = useState('N/A');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      missionId,
      projectId: selectedProjectId,
      title: title.trim(),
      description: description.trim(),
      assignedToId,
      ownerId: currentUser.userId,
      priority,
      status,
      progressPercentage,
      estimatedHours: Number(estimatedHours),
      actualHours: 0,
      plannedStartDate: new Date().toISOString().split('T')[0],
      dueDate,
      health: 'On Track',
      dailyUpdateSummary: dailyUpdateSummary.trim(),
      nextActionSummary: nextActionSummary.trim(),
      blockerSummary: '',
      remarks: remarks.trim(),
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      lastUpdatedBy: currentUser.userId
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New Task Under Mission</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Create a task with scope, schedule, and assignment.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="new-task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Target Mission *</label>
            <select
              value={missionId}
              onChange={e => setMissionId(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {missions.map(m => (
                <option key={m.missionId} value={m.missionId}>
                  {m.missionCode}: {m.missionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Post-upgrade OS validation, configure disk LUNs..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Scope details, checklist, acceptance conditions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
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
                onChange={e => {
                  const newStat = e.target.value as TaskStatus;
                  setStatus(newStat);
                  if (newStat === 'Completed') setProgressPercentage(100);
                  if (newStat === 'Not Started') setProgressPercentage(0);
                }}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Est. Hours</label>
              <input
                type="number"
                min={1}
                max={500}
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">Assigned Staff</label>
              <select
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {availableUsers.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Next Action Summary</label>
              <input
                type="text"
                placeholder="e.g., Complete remaining schedules"
                value={nextActionSummary}
                onChange={e => setNextActionSummary(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
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
            form="new-task-form"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-xs transition-colors text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};
