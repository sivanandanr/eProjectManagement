import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressHistory, AuditLog } from '../../types';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const ProgressHistoryView: React.FC = () => {
  const { progressHistory, auditLogs, tasks, availableUsers, selectedProjectId } = useApp();

  const [activeTab, setActiveTab] = useState<'progress' | 'audit'>('progress');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProgressHistory = useMemo(() => {
    return progressHistory.filter(h => {
      const task = tasks.find(t => t.taskId === h.taskId);
      if (task && task.projectId !== selectedProjectId) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (
          !task?.title.toLowerCase().includes(term) &&
          !(h.reason || '').toLowerCase().includes(term) &&
          !task?.taskCode.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [progressHistory, tasks, selectedProjectId, searchTerm]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Progress History & Audit Timeline (Screen 57)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable historical record of every progress change, status transition, and exception authorization
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'progress'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Progress Transitions ({filteredProgressHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            System Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by task title, code, or change reason..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
        />
      </div>

      {/* Tab 1: Progress Transitions */}
      {activeTab === 'progress' && (
        <div className="space-y-3">
          {filteredProgressHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              No progress transitions recorded.
            </div>
          ) : (
            filteredProgressHistory.map(entry => {
              const task = tasks.find(t => t.taskId === entry.taskId);
              const author = availableUsers.find(u => u.userId === entry.updatedBy);

              return (
                <div
                  key={entry.historyId}
                  className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{author?.name || entry.updatedBy}</span>
                      <span>·</span>
                      <span className="font-mono">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : 'Recent'}</span>
                    </div>
                    <span className="font-mono text-slate-400">{entry.historyId}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {task?.taskCode}: {task?.title}
                    </span>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {entry.oldStatus} ({entry.oldProgress}%)
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded font-bold text-blue-700 dark:text-blue-300">
                        {entry.newStatus} ({entry.newProgress}%)
                      </span>
                    </div>
                  </div>

                  {entry.reason && (
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded text-[11px]">
                      <strong>Change Reason / Justification:</strong> {entry.reason}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: System Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Timestamp</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Entity</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Action</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Actor</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map(log => {
                const actor = availableUsers.find(u => u.userId === log.changedBy);
                return (
                  <tr key={log.auditId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-500 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                      {log.changedAt ? new Date(log.changedAt).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                      {actor?.name || log.changedBy}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-sans">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
