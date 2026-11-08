import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import {
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertOctagon,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTaskId?: string;
}

export const DailyUpdateModal: React.FC<DailyUpdateModalProps> = ({
  isOpen,
  onClose,
  preselectedTaskId
}) => {
  const { tasks, submitDailyUpdate, currentUser, canEditTask } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(preselectedTaskId || '');
  const [updateDate, setUpdateDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [workCompletedToday, setWorkCompletedToday] = useState('');
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [hoursSpent, setHoursSpent] = useState<number>(2);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>('In Progress');
  const [plannedNextAction, setPlannedNextAction] = useState('');
  const [blockerSummary, setBlockerSummary] = useState('');
  const [remarks, setRemarks] = useState('');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Available tasks for the current user
  const editableTasks = tasks.filter(t => canEditTask(t));

  useEffect(() => {
    if (preselectedTaskId) {
      setSelectedTaskId(preselectedTaskId);
    } else if (editableTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(editableTasks[0].taskId);
    }
  }, [preselectedTaskId, editableTasks]);

  // When task selection changes, populate existing values
  useEffect(() => {
    const task = tasks.find(t => t.taskId === selectedTaskId);
    if (task) {
      setCurrentProgress(task.progressPercentage);
      setCurrentStatus(task.status);
      setPlannedNextAction(task.nextActionSummary !== 'N/A' ? task.nextActionSummary : '');
      setBlockerSummary(task.blockerSummary || '');
      setRemarks('');
      setWorkCompletedToday('');
    }
  }, [selectedTaskId, tasks]);

  // Progress rule validation check
  useEffect(() => {
    if (currentStatus === 'Not Started' && currentProgress > 0) {
      setValidationWarning('Validation Warning: "Not Started" tasks should have 0% progress.');
    } else if (currentStatus === 'Completed' && currentProgress !== 100) {
      setValidationWarning('Validation Warning: "Completed" tasks should have 100% progress.');
    } else if (currentStatus === 'In Progress' && currentProgress === 100) {
      setValidationWarning('Notice: If progress is 100%, consider marking status as "Completed".');
    } else {
      setValidationWarning(null);
    }
  }, [currentStatus, currentProgress]);

  if (!isOpen) return null;

  const currentTask = tasks.find(t => t.taskId === selectedTaskId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    if (!workCompletedToday.trim()) {
      alert('Please specify what work you completed today.');
      return;
    }

    const result = submitDailyUpdate({
      taskId: currentTask.taskId,
      projectId: currentTask.projectId,
      missionId: currentTask.missionId,
      updateDate,
      workCompletedToday: workCompletedToday.trim(),
      previousProgressPercentage: currentTask.progressPercentage,
      newProgressPercentage: Number(currentProgress),
      hoursSpent: Number(hoursSpent),
      currentStatus,
      plannedNextAction: plannedNextAction.trim(),
      blockerSummary: blockerSummary.trim(),
      remarks: remarks.trim(),
      submittedBy: currentUser.userId
    });

    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to submit daily update');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Activity Entry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record your daily progress, effort hours, next actions, and blockers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Task Selector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Task to Update
              </label>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {tasks.map(t => (
                  <option key={t.taskId} value={t.taskId}>
                    {t.taskCode} - {t.title} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Activity Date
              </label>
              <input
                type="date"
                value={updateDate}
                onChange={e => setUpdateDate(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Question 1: What did you complete today? */}
          <div>
            <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>What did you complete today? <strong className="text-red-500">*</strong></span>
            </label>
            <textarea
              required
              rows={2}
              value={workCompletedToday}
              onChange={e => setWorkCompletedToday(e.target.value)}
              placeholder="e.g., Disk attached, validation completed, or CAB change request submitted..."
              className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Question 2: Progress & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-semibold text-slate-900 dark:text-white flex items-center justify-between mb-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>What is the current progress?</span>
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">
                  {currentProgress}%
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={currentProgress}
                onChange={e => setCurrentProgress(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Current Task Status
              </label>
              <select
                value={currentStatus}
                onChange={e => setCurrentStatus(e.target.value as TaskStatus)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {validationWarning && (
              <div className="sm:col-span-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationWarning}</span>
              </div>
            )}
          </div>

          {/* Question 3: How much time did you spend? */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>How much time did you spend today? (Hours)</span>
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={hoursSpent}
                  onChange={e => setHoursSpent(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Accumulates to total actual task hours without duplicate time entries.
              </p>
            </div>

            {/* Question 4: What will you do next? */}
            <div>
              <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                <span>What will you do next?</span>
              </label>
              <input
                type="text"
                value={plannedNextAction}
                onChange={e => setPlannedNextAction(e.target.value)}
                placeholder="e.g., Complete remaining schedules with System Owners"
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Question 5: Are there any blockers? */}
          <div>
            <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
              <span>Are there any blockers or risks? (Leave blank if none)</span>
            </label>
            <div className="relative">
              <AlertOctagon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-rose-500" />
              <input
                type="text"
                value={blockerSummary}
                onChange={e => setBlockerSummary(e.target.value)}
                placeholder="e.g., OData feed timeout on host DEV-SRV-22, or pending approval signature..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Question 6: Additional Remarks */}
          <div>
            <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">6</span>
              <span>Additional remarks (Optional)</span>
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g., Verified in CAB Session #44, test certificates archived..."
              className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Logged by: <strong className="text-slate-700 dark:text-slate-300">{currentUser.name}</strong> ({currentUser.role})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Submit Daily Activity</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
