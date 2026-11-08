import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  Layers
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    projects,
    missions,
    tasks,
    dailyUpdates,
    risksAndBlockers,
    nextActions,
    availableUsers,
    selectedProjectId
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'daily_status' | 'manager_summary' | 'weekly_progress'>('daily_status');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);

  const currentProject = projects.find(p => p.projectId === selectedProjectId) || projects[0];
  const projectMissions = missions.filter(m => m.projectId === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const projectUpdates = dailyUpdates.filter(u => u.projectId === selectedProjectId);
  const projectBlockers = risksAndBlockers.filter(r => r.projectId === selectedProjectId);

  // Trigger browser print for PDF export
  const handlePrint = () => {
    window.print();
  };

  // Export Daily Status CSV
  const handleExportCSV = () => {
    const sanitize = (val: any) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = [
      'Project',
      'Mission',
      'Task',
      'Assigned To',
      'Priority',
      'Status',
      'Progress %',
      "Today's Update",
      'Next Action',
      'Blocker/Risk',
      'Remarks',
      'Last Updated',
      'Due Date'
    ];

    const rows = projectTasks.map(t => {
      const mission = missions.find(m => m.missionId === t.missionId);
      const assignee = availableUsers.find(u => u.userId === t.assignedToId);
      return [
        sanitize(currentProject.name),
        sanitize(mission?.missionName),
        sanitize(t.title),
        sanitize(assignee?.name),
        sanitize(t.priority),
        sanitize(t.status),
        t.progressPercentage,
        sanitize(t.dailyUpdateSummary),
        sanitize(t.nextActionSummary),
        sanitize(t.blockerSummary),
        sanitize(t.remarks),
        sanitize(t.lastUpdatedDate),
        sanitize(t.dueDate)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DailyProjectStatusReport_${currentProject.code}_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Report Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Automated Daily & Weekly Reporting Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Audit-grade, verified metrics generated directly from stored operational records (Section 9)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveReportTab('daily_status')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeReportTab === 'daily_status'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          1. Daily Project Status Report
        </button>
        <button
          onClick={() => setActiveReportTab('manager_summary')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeReportTab === 'manager_summary'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          2. Daily Manager Executive Summary
        </button>
        <button
          onClick={() => setActiveReportTab('weekly_progress')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeReportTab === 'weekly_progress'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          3. Weekly Mission Progress Report
        </button>
      </div>

      {/* REPORT 1: Daily Project Status Report (Elevated Excel Layout) */}
      {activeReportTab === 'daily_status' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs print:p-0 print:border-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Official Daily Status Report</div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {currentProject.name} — Operating Cadence Snapshot
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Date: {reportDate}</div>
              <div>Project Code: {currentProject.code}</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Missions</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Tasks</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Assigned To</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 text-center">Priority</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 text-center">Status</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 text-center">Progress %</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Today's Update</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Next Action</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Blocker/Risk</th>
                  <th className="px-3 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projectTasks.map(t => {
                  const mission = missions.find(m => m.missionId === t.missionId);
                  const assignee = availableUsers.find(u => u.userId === t.assignedToId);

                  return (
                    <tr key={t.taskId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                        {mission?.missionName}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                        {t.title}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                        {assignee?.name}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">
                        {t.priority}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800">
                        {t.status}
                      </td>
                      <td className="px-3 py-2 text-center font-mono tabular-nums font-bold border-r border-slate-100 dark:border-slate-800">
                        {t.progressPercentage}%
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                        {t.dailyUpdateSummary || '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                        {t.nextActionSummary || 'N/A'}
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100 dark:border-slate-800 font-medium text-rose-600">
                        {t.blockerSummary || '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {t.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
                {projectTasks.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No tasks found for this project. Create tasks or import from Excel to generate daily reports.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: Daily Manager Summary */}
      {activeReportTab === 'manager_summary' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase text-slate-400">Section 9 Compliance</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Manager Executive Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted briefing for project leads covering completed milestones, delayed deliverables, and open blockers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Work Completed ({projectTasks.filter(t => t.status === 'Completed').length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {projectTasks.filter(t => t.status === 'Completed').map(t => (
                  <li key={t.taskId} className="flex items-start gap-1">
                    <span>·</span>
                    <span className="font-medium">{t.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 text-xs flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>In-Progress Deliverables ({projectTasks.filter(t => t.status === 'In Progress').length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {projectTasks.filter(t => t.status === 'In Progress').map(t => (
                  <li key={t.taskId} className="flex items-start gap-1">
                    <span>·</span>
                    <span className="font-medium">{t.title} ({t.progressPercentage}%)</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <h3 className="font-bold text-rose-900 dark:text-rose-200 text-xs flex items-center gap-1.5 mb-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Open Blockers Requiring Attention ({projectBlockers.length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-rose-800 dark:text-rose-200">
                {projectBlockers.map(b => (
                  <li key={b.riskId} className="flex items-start gap-1">
                    <span>·</span>
                    <span className="font-semibold">{b.title} ({b.severity})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: Weekly Mission Progress Report */}
      {activeReportTab === 'weekly_progress' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase text-slate-400">Section 9 Compliance</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Mission Progress Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Velocity trends, planned vs actual effort variances, and cumulative completion trajectory
            </p>
          </div>

          <div className="space-y-4">
            {projectMissions.map(m => {
              const mTasks = projectTasks.filter(t => t.missionId === m.missionId);
              const completedCount = mTasks.filter(t => t.status === 'Completed').length;

              return (
                <div key={m.missionId} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.missionCode}: {m.missionName}
                      </span>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                        {m.progressPercentage}% Complete
                      </span>
                      <span className="block text-[10px] text-slate-400">Health: {m.healthStatus}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Planned Hours:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{m.estimatedHours}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Actual Hours Logged:</span>
                      <span className="font-bold text-blue-600">{m.actualHours}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Effort Variance:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {m.actualHours - m.estimatedHours > 0 ? `+${m.actualHours - m.estimatedHours}h` : `${m.actualHours - m.estimatedHours}h`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tasks Completed:</span>
                      <span className="font-bold text-emerald-600">{completedCount} / {mTasks.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
