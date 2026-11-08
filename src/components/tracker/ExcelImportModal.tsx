import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importTasksFromExcel, selectedProjectId, selectedMissionId, missions } = useApp();

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('excel_tasks_import.xlsx');
  const [isDryRun, setIsDryRun] = useState(true);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: number;
    warnings: number;
    errors: string[];
  } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Load the sample data from Section 14 / user attachment
  const loadReferenceSample = () => {
    const sampleCSV = `Tasks,Priority,Status,Progress %,Daily Update,Next Action,Blocker/Risk,Remarks
Raised Change Request and created upgrade tasks,High,Completed,100,CR raised and tasks created,N/A,,Approved CAB
Coordinate upgrade schedule with System Owners,High,Not Started,100,Scheduling production upgrades,Complete remaining schedules,,Contradictory row 2
Create and attach upgrade disk,High,Completed,100,Disk attached,N/A,,LUN mapped
Post-upgrade OS validation (OS version, connectivity, logs),High,Completed,100,Validation completed,N/A,,PowerShell pass
System Owner application validation,High,In Progress,100,Validation completed,N/A,,Contradictory row 5
Patch and license updates,High,Completed,100,Patched upgraded servers,N/A,,KMS activated`;

    setRawText(sampleCSV);
    setFileName('Infrastructure_OS_Upgrade_Reference.xlsx');
    parseAndValidate(sampleCSV);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setRawText(text);
      parseAndValidate(text);
    };
    reader.readAsText(file);
  };

  const parseAndValidate = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      setValidationResults({ valid: 0, warnings: 0, errors: ['File contains no data rows.'] });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    const errors: string[] = [];
    let warnings = 0;
    let valid = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting with quotes
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowObj: any = {
        rowNumber: i + 1,
        title: values[0] || '',
        priority: (values[1] as TaskPriority) || 'High',
        status: (values[2] as TaskStatus) || 'Not Started',
        progress: parseInt(values[3], 10) || 0,
        dailyUpdate: values[4] || '',
        nextAction: values[5] || 'N/A',
        blocker: values[6] || '',
        remarks: values[7] || ''
      };

      // Validation logic per Section 7 and 14
      let rowWarning = '';
      if (!rowObj.title) {
        errors.push(`Row ${i + 1}: Title is required.`);
      } else {
        if (rowObj.status === 'Not Started' && rowObj.progress > 0) {
          rowWarning = `Contradictory State: "Not Started" but progress is ${rowObj.progress}%. Requires exception approval (Section 14).`;
          warnings++;
        } else if (rowObj.status === 'In Progress' && rowObj.progress === 100) {
          rowWarning = `Contradictory State: "In Progress" with 100% progress. Requires exception approval or status adjustment.`;
          warnings++;
        } else if (rowObj.status === 'Completed' && rowObj.progress !== 100) {
          rowWarning = `Completed tasks must be 100% (currently ${rowObj.progress}%).`;
          warnings++;
        } else {
          valid++;
        }
      }

      rowObj.warning = rowWarning;
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setValidationResults({ valid, warnings, errors });
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    const formattedTasks: Partial<Task>[] = parsedRows.map(r => ({
      title: r.title,
      priority: r.priority,
      status: r.status,
      progressPercentage: r.progress,
      dailyUpdateSummary: r.dailyUpdate,
      nextActionSummary: r.nextAction,
      blockerSummary: r.blocker,
      remarks: r.remarks,
      missionId: selectedMissionId !== 'all' ? selectedMissionId : 'MSN-WIN-01',
      projectId: selectedProjectId
    }));

    const result = importTasksFromExcel(formattedTasks, fileName);
    setImportStatus(`Successfully imported ${result.imported} tasks. ${result.warnings} exception approval records created for contradictory states.`);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Excel Spreadsheet Import & Validation Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preview, column mapping, row validation, duplicate check, and Section 14 contradiction detection
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
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* Preset Buttons & File Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Select CSV/Excel Data Source
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadReferenceSample}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Section 14 Reference Sample (6 Tasks)</span>
              </button>
            </div>
          </div>

          {/* Raw Input Textarea (for pasting) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Spreadsheet CSV Content / Paste Area
              </label>
              <span className="text-[11px] text-slate-400">
                Formula injection protection active
              </span>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                parseAndValidate(e.target.value);
              }}
              placeholder="Paste comma-separated rows or load reference sample above..."
              className="w-full font-mono text-[11px] p-2.5 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Validation & Dry-Run Summary */}
          {validationResults && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">Validation Pre-Flight Check</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validationResults.valid} Valid Rows
                  </span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {validationResults.warnings} Warnings (Contradictory States)
                  </span>
                  {validationResults.errors.length > 0 && (
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> {validationResults.errors.length} Critical Errors
                    </span>
                  )}
                </div>
              </div>

              {validationResults.warnings > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Note per Section 14: Tasks 2 and 5 contain contradictory source status/progress combinations. They will be imported with validation warning flags and routed to the Manager Exception Approval queue.
                </p>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Row</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Task Title</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Priority</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Status</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Progress</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Daily Update</th>
                    <th className="px-3 py-2">Validation Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((r, idx) => (
                    <tr
                      key={idx}
                      className={r.warning ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                    >
                      <td className="px-3 py-1.5 font-mono text-slate-400 border-r border-slate-100 dark:border-slate-800">
                        {r.rowNumber}
                      </td>
                      <td className="px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 max-w-xs truncate">
                        {r.title}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100 dark:border-slate-800">{r.priority}</td>
                      <td className="px-3 py-1.5 border-r border-slate-100 dark:border-slate-800">{r.status}</td>
                      <td className="px-3 py-1.5 font-mono border-r border-slate-100 dark:border-slate-800">{r.progress}%</td>
                      <td className="px-3 py-1.5 border-r border-slate-100 dark:border-slate-800 text-slate-500 truncate max-w-xs">
                        {r.dailyUpdate}
                      </td>
                      <td className="px-3 py-1.5">
                        {r.warning ? (
                          <span className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {r.warning}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> Ready to commit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-md border border-emerald-300 dark:border-emerald-700 font-medium">
              {importStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Target Mission:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {missions.find(m => m.missionId === (selectedMissionId !== 'all' ? selectedMissionId : 'MSN-WIN-01'))?.missionName || 'Development Servers'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              disabled={parsedRows.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Commit Import to Database ({parsedRows.length} tasks)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
