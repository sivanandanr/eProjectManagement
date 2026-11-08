import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskAndBlocker, RiskType, Severity, RiskStatus } from '../../types';
import {
  AlertOctagon,
  AlertTriangle,
  Plus,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  ArrowUp,
  Check,
  X
} from 'lucide-react';

export const RiskBlockerRegister: React.FC = () => {
  const {
    risksAndBlockers,
    projects,
    missions,
    tasks,
    availableUsers,
    selectedProjectId,
    createRiskOrBlocker,
    escalateBlocker,
    resolveBlocker,
    currentUser
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [resolvingRiskId, setResolvingRiskId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Form state
  const [newType, setNewType] = useState<RiskType>('Blocker');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<Severity>('High');
  const [newTaskId, setNewTaskId] = useState<string>('');

  const projectRisks = risksAndBlockers.filter(r => r.projectId === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createRiskOrBlocker({
      projectId: selectedProjectId,
      missionId: projectTasks.find(t => t.taskId === newTaskId)?.missionId || missions[0].missionId,
      taskId: newTaskId || undefined,
      riskType: newType,
      title: newTitle.trim(),
      description: newDesc.trim() || 'No detailed description provided',
      severity: newSeverity,
      status: 'Open',
      reportedBy: currentUser.userId,
      assignedTo: currentUser.userId
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleConfirmResolve = (riskId: string) => {
    if (!resolutionNotes.trim()) {
      setResolveError('Please enter resolution notes before resolving.');
      return;
    }
    resolveBlocker(riskId, resolutionNotes.trim());
    setResolvingRiskId(null);
    setResolutionNotes('');
    setResolveError(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Enterprise Risk & Blocker Register</span>
          </h1>
          <p className="text-xs text-slate-500">
            Escalation management, root-cause resolution, and cross-mission dependency tracking (Section 6)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Risk / Blocker</span>
        </button>
      </div>

      {/* Risks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">ID</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Type</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Title & Description</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Severity</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Status</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Linked Task</th>
              <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center">Escalation</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {projectRisks.map(risk => {
              const task = tasks.find(t => t.taskId === risk.taskId);
              const isResolved = risk.status === 'Resolved' || risk.status === 'Closed';

              return (
                <tr key={risk.riskId} className={isResolved ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}>
                  <td className="px-4 py-3 font-mono font-bold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    {risk.riskId}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      risk.riskType === 'Blocker' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {risk.riskType}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 max-w-sm">
                    <div className="font-semibold text-slate-900 dark:text-white">{risk.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{risk.description}</div>
                    {risk.resolutionNotes && (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded">
                        <strong>Resolution:</strong> {risk.resolutionNotes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      risk.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : risk.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {risk.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800 font-medium">
                    {risk.status}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {task ? (
                      <span className="truncate block" title={task.title}>
                        {task.taskCode}: {task.title}
                      </span>
                    ) : (
                      <span className="text-slate-400">Mission-level</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono border-r border-slate-100 dark:border-slate-800">
                    Tier {risk.escalationLevel}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!isResolved ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setResolvingRiskId(risk.riskId)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded font-semibold text-[11px] hover:bg-emerald-100"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => escalateBlocker(risk.riskId)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded font-semibold text-[11px] hover:bg-rose-100 flex items-center gap-1"
                          title="Escalate to Executive tier"
                        >
                          <ArrowUp className="w-3 h-3" />
                          <span>Escalate</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {projectRisks.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No risks or blockers recorded for this project scope. Click "+ Raise Risk / Blocker" to register an impediment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Resolve Notes */}
      {resolvingRiskId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 w-full max-w-md space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Record Resolution & Close Blocker
            </h3>
            <p className="text-xs text-slate-500">
              Document root cause mitigation for permanent audit history.
            </p>
            <textarea
              rows={3}
              placeholder="e.g., Firewall port 443 rule updated, vendor hotfix applied, CAB signature obtained..."
              value={resolutionNotes}
              onChange={e => {
                setResolutionNotes(e.target.value);
                if (resolveError) setResolveError(null);
              }}
              className="w-full text-xs p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            {resolveError && (
              <p className="text-xs text-rose-600 font-medium">{resolveError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingRiskId(null)}
                className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmResolve(resolvingRiskId)}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded font-semibold"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Risk/Blocker */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Raise New Risk or Blocker
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Blocker">Blocker (Impediment)</option>
                    <option value="Risk">Risk (Potential)</option>
                    <option value="Dependency">Dependency</option>
                    <option value="Issue">Issue</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Associated Task (Optional)</label>
                <select
                  value={newTaskId}
                  onChange={e => setNewTaskId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">General Project / Mission Scope</option>
                  {projectTasks.map(t => (
                    <option key={t.taskId} value={t.taskId}>
                      {t.taskCode}: {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., OData feed timeout on DEV-SRV-22..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description & Impact</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical impact, root causes, or pending approvals..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 text-white rounded font-semibold"
                >
                  Submit Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
