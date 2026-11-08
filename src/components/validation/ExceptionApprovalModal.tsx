import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExceptionApprovalRequest, TaskStatus } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  FileCheck2
} from 'lucide-react';

interface ExceptionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExceptionApprovalModal: React.FC<ExceptionApprovalModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    exceptionRequests,
    approveException,
    correctInconsistentTask,
    canApproveExceptions,
    currentUser
  } = useApp();

  const [activeExceptionId, setActiveExceptionId] = useState<string | null>(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [correctStatus, setCorrectStatus] = useState<TaskStatus>('In Progress');
  const [correctProgress, setCorrectProgress] = useState<number>(50);
  const [correctionReason, setCorrectionReason] = useState('');

  if (!isOpen) return null;

  const pendingExceptions = exceptionRequests.filter(e => e.status === 'Pending');

  const handleApprove = (exceptionId: string) => {
    if (!approvalReason.trim()) {
      alert('A mandatory justification reason is required to approve a contradictory state exception (Section 7).');
      return;
    }
    approveException(exceptionId, approvalReason.trim());
    setActiveExceptionId(null);
    setApprovalReason('');
  };

  const handleCorrect = (req: ExceptionApprovalRequest) => {
    if (!correctionReason.trim()) {
      alert('Please provide a correction reason for the audit trail.');
      return;
    }
    correctInconsistentTask(req.taskId, correctStatus, correctProgress, correctionReason.trim());
    setActiveExceptionId(null);
    setCorrectionReason('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 rounded-lg text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Task Progress & Status Inconsistency Governance (Section 14)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review contradictory status/progress combinations from legacy Excel imports and authorize exceptions
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

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {pendingExceptions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                No Pending Inconsistent State Exceptions
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All tasks adhere to validated progress rules (Not Started = 0%, In Progress = 1–99%, Completed = 100%).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                <strong>Section 14 Reference Rule:</strong> Tasks 2 and 5 intentionally contain inconsistent source status/progress combinations from the reference Excel tracker. Do not silently discard or mutate them. Choose either to:
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><strong>Approve Exception:</strong> Keep the source values with mandatory documented executive reason.</li>
                  <li><strong>Reconcile & Correct:</strong> Align status and progress values for clean dashboard metrics with audit history.</li>
                </ul>
              </div>

              {pendingExceptions.map(req => {
                const isSelected = activeExceptionId === req.exceptionId;

                return (
                  <div
                    key={req.exceptionId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          {req.exceptionId} · {req.missionName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {req.taskTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          Status: "{req.sourceStatus}" vs Progress: {req.sourceProgress}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                      <strong>Reason for Flag:</strong> {req.reason}
                    </p>

                    {/* Action Selector */}
                    {!isSelected ? (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveExceptionId(req.exceptionId);
                            setCorrectStatus(req.recommendedStatus);
                            setCorrectProgress(req.recommendedProgress);
                            setCorrectionReason(
                              `Reconciled ${req.taskTitle}: aligned status to ${req.recommendedStatus} and progress to ${req.recommendedProgress}% per Section 14.`
                            );
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-xs"
                        >
                          Resolve or Approve Exception
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 pt-3">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          Resolution Workflow
                        </div>

                        {/* Option A: Reconcile / Correct */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 space-y-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                            Option A: Reconcile & Correct Task Values
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Corrected Status</label>
                              <select
                                value={correctStatus}
                                onChange={e => setCorrectStatus(e.target.value as TaskStatus)}
                                className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Not Started">Not Started</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Corrected Progress %</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={correctProgress}
                                onChange={e => setCorrectProgress(Number(e.target.value))}
                                className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Correction Audit Reason</label>
                            <input
                              type="text"
                              value={correctionReason}
                              onChange={e => setCorrectionReason(e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>
                          <button
                            onClick={() => handleCorrect(req)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs mt-1"
                          >
                            Apply Reconciled Values & Update Progress History
                          </button>
                        </div>

                        {/* Option B: Approve Exception */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 space-y-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                            Option B: Authorize Exception (Preserve Contradictory Source Values)
                          </span>
                          <input
                            type="text"
                            placeholder="Mandatory management justification reason..."
                            value={approvalReason}
                            onChange={e => setApprovalReason(e.target.value)}
                            className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <button
                            onClick={() => handleApprove(req.exceptionId)}
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs"
                          >
                            Authorize Exception Under Management Override
                          </button>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => setActiveExceptionId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Current Approver: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
