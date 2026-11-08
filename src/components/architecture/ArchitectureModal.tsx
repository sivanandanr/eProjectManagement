import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  Table,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Server
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'erd' | 'permissions' | 'architecture' | 'calculations'>('erd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Blueprint & Technical Architecture Specification v2.0
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidated Architecture, Revised Database ERD, Permission Matrix, and Aggregation Rules
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('erd')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'erd'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Revised Database ERD (mission & activity schemas)</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Role Permission Matrix (RBAC)</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3. Clean Architecture & SignalR Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('calculations')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'calculations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>4. Weighted Progress & Validation Rules</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* TAB 1: ERD */}
          {activeTab === 'erd' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Hierarchy Entity Relationships:
                </h3>
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 flex flex-wrap items-center gap-2">
                  <span>Organization (1)</span>
                  <span>→</span>
                  <span>Department (1..N)</span>
                  <span>→</span>
                  <span>Project (1..N)</span>
                  <span>→</span>
                  <span className="font-bold underline text-indigo-600 dark:text-indigo-300">Mission (1..N) [First-Class]</span>
                  <span>→</span>
                  <span>Task (1..N)</span>
                  <span>→</span>
                  <span>Subtask (0..N)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schema 1: mission */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <Database className="w-4 h-4" />
                    <span>Schema: mission</span>
                  </div>
                  <ul className="space-y-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>mission.Missions</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: MissionId | FK: ProjectId, DepartmentId, MissionOwnerId | Priority, Status, StartDate, PlannedEndDate, ActualEndDate, EstimatedHours, ActualHours, ProgressPercentage, HealthStatus, RowVersion, IsArchived
                      </div>
                    </li>
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>mission.MissionStatusHistory</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: HistoryId | FK: MissionId | OldStatus, NewStatus, ChangedBy, ChangedAt, Reason
                      </div>
                    </li>
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>mission.MissionProgressSnapshots</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: SnapshotId | FK: MissionId | AggregatedProgress, ActiveTaskCount, SnapshotDate (UTC)
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Schema 2: activity */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Database className="w-4 h-4" />
                    <span>Schema: activity</span>
                  </div>
                  <ul className="space-y-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>activity.DailyUpdates</strong> (Preserves Full History)
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: DailyUpdateId | FK: TaskId, ProjectId, MissionId, SubmittedBy | UpdateDate, WorkCompletedToday, PreviousProgress, NewProgress, HoursSpent, CurrentStatus, PlannedNextAction, BlockerSummary, Remarks, RowVersion
                      </div>
                    </li>
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>activity.NextActions</strong> (Structured Item)
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: NextActionId | FK: TaskId, AssignedTo, CreatedBy | Description, TargetDate, Status, Priority, CompletedAt
                      </div>
                    </li>
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>activity.RisksAndBlockers</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: RiskId | FK: ProjectId, MissionId, TaskId, ReportedBy, AssignedTo | RiskType, Severity, Probability, Impact, Status, EscalationLevel, ResolutionNotes
                      </div>
                    </li>
                    <li className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                      <strong>activity.ProgressHistory</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PK: HistoryId | FK: TaskId, UpdatedBy | OldProgress, NewProgress, OldStatus, NewStatus, Reason, IsExceptionApproved
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Permission Matrix */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Operation / Capability</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">Administrator</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">Project Manager</th>
                      <th className="p-3 text-center">Assigned Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Create Departments & Users
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-slate-400">Denied</td>
                      <td className="p-3 text-center text-slate-400">Denied</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Create & Edit Missions
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed (Authorized Projects)</td>
                      <td className="p-3 text-center text-slate-400">Denied</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Assign Tasks to Staff
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center text-slate-400">Denied</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Log Daily Activity Updates & Progress
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">Allowed (Assigned Tasks)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Approve Contradictory Progress Exceptions
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed (with mandatory reason)</td>
                      <td className="p-3 text-center text-rose-500 font-bold">Denied</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                        Import & Export Excel Trackers
                      </td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center border-r text-emerald-600 font-bold">Allowed</td>
                      <td className="p-3 text-center text-slate-500 font-bold">Export Only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Clean Architecture & SignalR */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Clean Architecture Layers:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                    <strong className="block text-blue-600">Domain</strong>
                    <span>Entities, Value Objects, Domain Events, Enums</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                    <strong className="block text-indigo-600">Application</strong>
                    <span>CQRS Handlers, FluentValidation, DTOs, Behaviors</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                    <strong className="block text-purple-600">Infrastructure</strong>
                    <span>EF Core, SQL Server, SignalR Hubs, Outbox Publisher</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                    <strong className="block text-emerald-600">Presentation</strong>
                    <span>ASP.NET Core Controllers, React Vite UI, OIDC Tokens</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">SignalR Real-Time Hub Pipeline:</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  When a staff member submits a daily update or raises a blocker, the server commits the EF Core transaction, writes to the Outbox table, and dispatches a scoped SignalR event (<code className="font-mono text-blue-600">OnTaskUpdated</code>, <code className="font-mono text-rose-600">OnBlockerRaised</code>) strictly to authorized project group connections. The manager's dashboard and board view automatically reconcile state with zero full-page refreshes.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Calculations & Validation */}
          {activeTab === 'calculations' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200 space-y-2">
                <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                  Weighted Aggregation Rule (Section 1):
                </h3>
                <p className="font-mono text-xs bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
                  MissionProgress = sum(Task.ProgressPercentage * Task.EstimatedHours) / sum(Task.EstimatedHours)
                </p>
                <p className="text-xs">
                  <strong>Fallback Rule:</strong> When total estimated hours equals 0, the engine falls back to an arithmetic average: <code className="font-mono">sum(Task.ProgressPercentage) / ActiveTaskCount</code>.
                </p>
                <p className="text-xs">
                  <strong>Double-Counting Prevention:</strong> Subtasks roll up into their immediate parent task; only parent tasks are included in the mission calculation.
                </p>
                <p className="text-xs">
                  <strong>Cancelled Tasks:</strong> Retain their historical progress in audit logs but are excluded from the active denominator.
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 space-y-2">
                <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  Progress Validation Rules (Section 7 & 14):
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Not Started:</strong> Must be 0%. If progress &gt; 0%, flagged as contradictory.</li>
                  <li><strong>In Progress:</strong> Must be 1% to 99%. If 100%, prompted to complete or flagged.</li>
                  <li><strong>Completed:</strong> Must be exactly 100%.</li>
                  <li><strong>Blocked:</strong> 0% to 99% while preserving actual progress achieved.</li>
                  <li><strong>Exceptions:</strong> When contradictory records (like Tasks 2 and 5) are loaded, they are flagged with warnings and require Manager Exception Approval with mandatory reason recording.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Enterprise Architecture Specification · Version 2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
