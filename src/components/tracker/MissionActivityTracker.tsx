import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Mission, TaskStatus, TaskPriority, HealthStatus } from '../../types';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Columns,
  Download,
  Upload,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Edit2,
  MoreHorizontal,
  Check,
  X,
  ShieldAlert,
  ArrowUpDown,
  LayoutGrid,
  List,
  TableProperties
} from 'lucide-react';

interface MissionActivityTrackerProps {
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenDailyUpdateModal: (taskId?: string) => void;
  onOpenImportModal: () => void;
  onOpenExceptionModal: () => void;
}

export const MissionActivityTracker: React.FC<MissionActivityTrackerProps> = ({
  onOpenTaskDrawer,
  onOpenDailyUpdateModal,
  onOpenImportModal,
  onOpenExceptionModal
}) => {
  const {
    tasks,
    missions,
    projects,
    availableUsers,
    selectedProjectId,
    selectedMissionId,
    updateTaskInline,
    canEditTask,
    canApproveExceptions,
    currentUser
  } = useApp();

  // View Mode: Table (Excel) vs Cards (Touch/Mobile Friendly)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Collapsed missions state
  const [collapsedMissions, setCollapsedMissions] = useState<Record<string, boolean>>({});

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Multi-row selection for bulk updates
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | ''>('');
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | ''>('');

  // Inline editing state: { taskId, field: 'status' | 'progress' | 'dailyUpdate' | 'priority' | 'remarks' }
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Optional columns visibility
  const [showOptionalColumns, setShowOptionalColumns] = useState({
    taskId: true,
    assignedTo: true,
    dueDate: true,
    estHours: false,
    actHours: false,
    health: true,
    lastUpdated: false
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
  };

  // Filter tasks based on selected project, mission, and search
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Project filter
      if (task.projectId !== selectedProjectId) return false;
      // Mission filter
      if (selectedMissionId !== 'all' && task.missionId !== selectedMissionId) return false;
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      // Assignee filter
      if (assigneeFilter !== 'all' && task.assignedToId !== assigneeFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(term);
        const matchesDaily = (task.dailyUpdateSummary || '').toLowerCase().includes(term);
        const matchesNext = (task.nextActionSummary || '').toLowerCase().includes(term);
        const matchesBlocker = (task.blockerSummary || '').toLowerCase().includes(term);
        const matchesRemarks = (task.remarks || '').toLowerCase().includes(term);
        if (!matchesTitle && !matchesDaily && !matchesNext && !matchesBlocker && !matchesRemarks) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedProjectId, selectedMissionId, statusFilter, priorityFilter, assigneeFilter, searchTerm]);

  // Group filtered tasks by mission
  const tasksByMission = useMemo(() => {
    const map = new Map<string, Task[]>();
    // Include missions belonging to selected project
    const projectMissions = missions.filter(m => m.projectId === selectedProjectId);
    projectMissions.forEach(m => {
      if (selectedMissionId === 'all' || m.missionId === selectedMissionId) {
        map.set(m.missionId, []);
      }
    });

    filteredTasks.forEach(task => {
      if (!map.has(task.missionId)) {
        map.set(task.missionId, []);
      }
      map.get(task.missionId)!.push(task);
    });

    return map;
  }, [filteredTasks, missions, selectedProjectId, selectedMissionId]);

  const toggleMissionCollapse = (missionId: string) => {
    setCollapsedMissions(prev => ({
      ...prev,
      [missionId]: !prev[missionId]
    }));
  };

  // Start inline editing
  const startEditing = (task: Task, field: string, currentValue: any) => {
    if (!canEditTask(task)) {
      alert('You do not have authorization to edit this task.');
      return;
    }
    setEditingCell({ taskId: task.taskId, field });
    setEditValue(currentValue);
    setInlineError(null);
  };

  // Commit inline editing with validation
  const commitEdit = (task: Task) => {
    if (!editingCell) return;
    const { field } = editingCell;

    let updates: Partial<Task> = {};
    if (field === 'status') {
      updates.status = editValue as TaskStatus;
    } else if (field === 'progress') {
      const num = parseInt(editValue, 10);
      if (isNaN(num) || num < 0 || num > 100) {
        setInlineError('Progress must be between 0 and 100%');
        return;
      }
      updates.progressPercentage = num;
    } else if (field === 'dailyUpdate') {
      updates.dailyUpdateSummary = String(editValue);
    } else if (field === 'priority') {
      updates.priority = editValue as TaskPriority;
    } else if (field === 'remarks') {
      updates.remarks = String(editValue);
    }

    const result = updateTaskInline(task.taskId, updates);
    if (!result.success) {
      setInlineError(result.error || 'Failed to update');
      return;
    }

    setEditingCell(null);
    setInlineError(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setInlineError(null);
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.taskId));
    }
  };

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Bulk update handler
  const handleBulkUpdate = () => {
    if (selectedTaskIds.length === 0) return;
    if (!bulkStatus && !bulkPriority) return;

    selectedTaskIds.forEach(id => {
      const updates: Partial<Task> = {};
      if (bulkStatus) updates.status = bulkStatus;
      if (bulkPriority) updates.priority = bulkPriority;
      updateTaskInline(id, updates, 'Bulk update applied');
    });

    setSelectedTaskIds([]);
    setBulkStatus('');
    setBulkPriority('');
  };

  // Formula-safe CSV export (preventing CSV/Excel injection formula attacks)
  const exportToExcelCSV = () => {
    // Sanitize string to prevent spreadsheet formula injection (=, +, -, @)
    const sanitize = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = "'" + str; // prefix with single quote to deactivate formulas
      }
      return `"${str}"`;
    };

    const headers = [
      'Missions',
      'Tasks',
      'Priority',
      'Status',
      'Progress %',
      'Daily Update',
      'Next Action',
      'Blocker/Risk',
      'Remarks',
      'Task ID',
      'Assigned To',
      'Planned Start Date',
      'Due Date',
      'Health',
      'Last Updated Date'
    ];

    const rows = filteredTasks.map(t => {
      const missionName = missions.find(m => m.missionId === t.missionId)?.missionName || '';
      const assigneeName = availableUsers.find(u => u.userId === t.assignedToId)?.name || '';
      return [
        sanitize(missionName),
        sanitize(t.title),
        sanitize(t.priority),
        sanitize(t.status),
        t.progressPercentage,
        sanitize(t.dailyUpdateSummary),
        sanitize(t.nextActionSummary),
        sanitize(t.blockerSummary),
        sanitize(t.remarks),
        sanitize(t.taskCode),
        sanitize(assigneeName),
        sanitize(t.plannedStartDate),
        sanitize(t.dueDate),
        sanitize(t.health),
        sanitize(t.lastUpdatedDate)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MissionActivityTracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper styles for priority
  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/40 border-red-200 dark:border-red-900';
      case 'High':
        return 'text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
      case 'Medium':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900';
      case 'Low':
        return 'text-slate-700 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  // Helper styles for status
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'Blocked':
        return 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'Not Started':
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      case 'Cancelled':
        return 'text-slate-400 bg-slate-100 dark:text-slate-500 dark:bg-slate-900 line-through';
    }
  };

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (task.status === 'Completed' || task.status === 'Cancelled') return false;
    const due = new Date(task.dueDate).getTime();
    return due < Date.now();
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Tracker Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, updates, blockers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Status: All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Assignee: All</option>
            {availableUsers.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: View Mode, Column Visibility, Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle: Spreadsheet Grid vs Interactive Cards */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Spreadsheet Table View"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Interactive Card View (Optimized for Mobile/Touch)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Column Visibility Settings Dropdown (for Table view) */}
          {viewMode === 'table' && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Columns</span>
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-3 z-30">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Optional Columns
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.taskId}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, taskId: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Task ID Code</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.assignedTo}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, assignedTo: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Assigned To</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.dueDate}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, dueDate: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Due Date</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.estHours}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, estHours: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Est. Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.actHours}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, actHours: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Act. Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.health}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, health: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Health Status</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOptionalColumns.lastUpdated}
                        onChange={e =>
                          setShowOptionalColumns(p => ({ ...p, lastUpdated: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Last Updated</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export to Excel */}
          <button
            onClick={exportToExcelCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Download CSV reproducing the 9 Excel tracker columns"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Active Filters Clear Bar - Eliminates any confusion for selection */}
      {hasActiveFilters && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-900 dark:text-white">Active Filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                &quot;{searchTerm}&quot;
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                Status: {statusFilter}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                Priority: {priorityFilter}
              </span>
            )}
            {assigneeFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                Assignee: {availableUsers.find(u => u.userId === assigneeFilter)?.name || assigneeFilter}
              </span>
            )}
            <span className="text-slate-400 font-mono">({filteredTasks.length} matching)</span>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setAssigneeFilter('all');
            }}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {/* Multi-Selection Bulk Action Bar (Visible when rows selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-900 dark:text-blue-200">
              {selectedTaskIds.length} tasks selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value as TaskStatus)}
                className="bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-xs"
              >
                <option value="">Set Status...</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={bulkPriority}
                onChange={e => setBulkPriority(e.target.value as TaskPriority)}
                className="bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-xs"
              >
                <option value="">Set Priority...</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button
                onClick={handleBulkUpdate}
                disabled={!bulkStatus && !bulkPriority}
                className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Apply to Selected
              </button>
            </div>
          </div>
          <button
            onClick={() => setSelectedTaskIds([])}
            className="text-blue-700 dark:text-blue-300 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Interactive Cards View (Optimized for Mobile/Touch) */}
      {viewMode === 'cards' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {Array.from(tasksByMission.entries()).map(([missionId, missionTasks]) => {
            const mission = missions.find(m => m.missionId === missionId);
            if (!mission) return null;
            const isCollapsed = Boolean(collapsedMissions[missionId]);

            return (
              <div
                key={missionId}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 transition-all"
              >
                {/* Mission Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleMissionCollapse(missionId)}
                      className="p-1.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                          {mission.missionCode}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {mission.missionName}
                        </h3>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {missionTasks.length} {missionTasks.length === 1 ? 'task' : 'tasks'} · Status: <span className="font-medium text-slate-700 dark:text-slate-300">{mission.status}</span> · Health: <span className="font-medium text-slate-700 dark:text-slate-300">{mission.healthStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar in card header */}
                  <div className="flex items-center gap-2.5 w-full sm:w-48">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          mission.progressPercentage === 100
                            ? 'bg-emerald-500'
                            : mission.progressPercentage >= 50
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${mission.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold tabular-nums">
                      {mission.progressPercentage}%
                    </span>
                  </div>
                </div>

                {/* Child Task Cards Grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                    {missionTasks.map(task => {
                      const assignee = availableUsers.find(u => u.userId === task.assignedToId);
                      const overdue = isOverdue(task);

                      return (
                        <div
                          key={task.taskId}
                          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between gap-2.5"
                        >
                          <div>
                            {/* Card Top: Code, Priority & Status */}
                            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                              <span className="font-mono text-[10px] text-slate-400">{task.taskCode}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusStyle(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>

                            {/* Title */}
                            <h4
                              onClick={() => onOpenTaskDrawer(task.taskId)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2"
                            >
                              {task.title}
                            </h4>

                            {/* Assignee & Due Date */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                              <span>{assignee?.name || 'Unassigned'}</span>
                              <span className={overdue ? 'text-rose-600 font-bold' : ''}>
                                Due {task.dueDate}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${task.progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono tabular-nums">{task.progressPercentage}%</span>
                            </div>

                            {/* Daily update snippet */}
                            {task.dailyUpdateSummary && (
                              <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded line-clamp-2">
                                <strong className="text-slate-900 dark:text-white">Today:</strong> {task.dailyUpdateSummary}
                              </p>
                            )}

                            {/* Next action snippet */}
                            {task.nextActionSummary && (
                              <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 p-1.5 rounded truncate">
                                <strong>Next:</strong> {task.nextActionSummary}
                              </p>
                            )}

                            {/* Blocker alert if present */}
                            {task.blockerSummary && (
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded">
                                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{task.blockerSummary}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <button
                              onClick={() => onOpenDailyUpdateModal(task.taskId)}
                              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Log Activity</span>
                            </button>
                            <button
                              onClick={() => onOpenTaskDrawer(task.taskId)}
                              className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="p-10 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 m-2">
              <TableProperties className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {tasks.length === 0 ? 'No tasks recorded yet in this project scope' : 'No tasks found matching your filters.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {tasks.length === 0
                  ? 'Get started by importing your reference Excel spreadsheet or logging tasks under the provisioned master missions.'
                  : 'Try resetting the search bar or changing status filters.'}
              </p>
              {tasks.length === 0 ? (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={onOpenImportModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel Spreadsheet</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Spreadsheet Table Viewport with Sticky Column on Desktop */
        <div className="flex-1 overflow-auto relative">
          <table className="w-full border-collapse text-left text-xs">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 shadow-xs">
            <tr>
              {/* Select all checkbox */}
              <th className="w-10 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </th>

              {/* Col 1: Missions (Sticky Column on Desktop) */}
              <th className="md:sticky md:left-0 z-30 bg-slate-100 dark:bg-slate-800 min-w-[260px] max-w-[320px] px-4 py-3 border-r border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <span>1. Missions</span>
                </div>
              </th>

              {/* Col 2: Tasks */}
              <th className="min-w-[280px] max-w-[360px] px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                <span>2. Tasks</span>
              </th>

              {/* Optional: Task ID */}
              {showOptionalColumns.taskId && (
                <th className="w-24 px-3 py-3 border-r border-slate-200 dark:border-slate-700 font-mono text-center">
                  Task ID
                </th>
              )}

              {/* Col 3: Priority */}
              <th className="w-24 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                <span>3. Priority</span>
              </th>

              {/* Col 4: Status */}
              <th className="w-28 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                <span>4. Status</span>
              </th>

              {/* Col 5: Progress % */}
              <th className="w-32 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                <span>5. Progress %</span>
              </th>

              {/* Col 6: Daily Update */}
              <th className="min-w-[240px] px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                <span>6. Daily Update</span>
              </th>

              {/* Col 7: Next Action */}
              <th className="min-w-[200px] px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                <span>7. Next Action</span>
              </th>

              {/* Col 8: Blocker/Risk */}
              <th className="min-w-[180px] px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                <span>8. Blocker/Risk</span>
              </th>

              {/* Col 9: Remarks */}
              <th className="min-w-[180px] px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                <span>9. Remarks</span>
              </th>

              {/* Optional: Assigned To */}
              {showOptionalColumns.assignedTo && (
                <th className="w-32 px-3 py-3 border-r border-slate-200 dark:border-slate-700">
                  Assigned To
                </th>
              )}

              {/* Optional: Due Date */}
              {showOptionalColumns.dueDate && (
                <th className="w-28 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                  Due Date
                </th>
              )}

              {/* Optional: Estimated Hours */}
              {showOptionalColumns.estHours && (
                <th className="w-20 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right">
                  Est. Hrs
                </th>
              )}

              {/* Optional: Actual Hours */}
              {showOptionalColumns.actHours && (
                <th className="w-20 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right">
                  Act. Hrs
                </th>
              )}

              {/* Optional: Health */}
              {showOptionalColumns.health && (
                <th className="w-24 px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-center">
                  Health
                </th>
              )}

              {/* Row Action Controls */}
              <th className="w-24 px-3 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body grouped by Mission */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Array.from(tasksByMission.entries()).map(([missionId, missionTasks]) => {
              const mission = missions.find(m => m.missionId === missionId);
              if (!mission) return null;

              const isCollapsed = !!collapsedMissions[missionId];
              const taskCount = missionTasks.length;

              return (
                <React.Fragment key={missionId}>
                  {/* Mission Group Header Row */}
                  <tr className="bg-slate-50/90 dark:bg-slate-800/80 font-medium text-slate-800 dark:text-slate-200 border-t border-b border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => toggleMissionCollapse(missionId)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                        title={isCollapsed ? 'Expand tasks' : 'Collapse tasks'}
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Mission Name + Progress Badge */}
                    <td
                      colSpan={showOptionalColumns.taskId ? 4 : 3}
                      className="md:sticky md:left-0 bg-slate-50/90 dark:bg-slate-800/80 px-4 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {mission.missionName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ({taskCount} tasks)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                            Aggregated Progress: {mission.progressPercentage}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Aggregated Progress Bar */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              mission.progressPercentage === 100
                                ? 'bg-emerald-500'
                                : mission.progressPercentage >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${mission.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums w-8 text-right font-semibold">
                          {mission.progressPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Remaining grouped summary span */}
                    <td colSpan={10} className="px-4 py-2 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-4">
                        <span>
                          Status: <strong className="text-slate-700 dark:text-slate-300">{mission.status}</strong>
                        </span>
                        <span>
                          Health: <strong className="text-slate-700 dark:text-slate-300">{mission.healthStatus}</strong>
                        </span>
                        <span>
                          Hours: <strong className="text-slate-700 dark:text-slate-300">{mission.actualHours} / {mission.estimatedHours} hrs</strong>
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Child Task Rows (if not collapsed) */}
                  {!isCollapsed &&
                    missionTasks.map((task, index) => {
                      const isSelected = selectedTaskIds.includes(task.taskId);
                      const overdue = isOverdue(task);
                      const isRowWarning = task.hasValidationWarning;

                      return (
                        <tr
                          key={task.taskId}
                          className={`hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors group ${
                            isSelected ? 'bg-blue-50/60 dark:bg-blue-950/40' : ''
                          } ${isRowWarning ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}
                        >
                          {/* Row selection check */}
                          <td className="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-800">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectTask(task.taskId)}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                          </td>

                          {/* Col 1: Missions (Sticky Column for continuous reference) */}
                          <td className="md:sticky md:left-0 bg-white dark:bg-slate-900 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-950/20 px-4 py-2.5 border-r border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 max-w-[300px]">
                            <div className="truncate text-xs" title={mission.missionName}>
                              {index === 0 ? mission.missionName : ''}
                            </div>
                          </td>

                          {/* Col 2: Tasks (Click to open Drawer) */}
                          <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            <div className="flex items-start gap-1.5">
                              {/* Validation Warning badge for Tasks 2 & 5 (Section 14) */}
                              {isRowWarning && (
                                <button
                                  onClick={onOpenExceptionModal}
                                  className="shrink-0 mt-0.5 text-amber-600 hover:text-amber-800 dark:text-amber-400"
                                  title={task.validationWarningMessage}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                                </button>
                              )}

                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => onOpenTaskDrawer(task.taskId)}
                                  className="text-left font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                                  title={task.title}
                                >
                                  {task.title}
                                </button>

                                {isRowWarning && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.2 rounded">
                                      Contradictory State
                                    </span>
                                    <button
                                      onClick={onOpenExceptionModal}
                                      className="text-[10px] text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                                    >
                                      Review
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Optional Col: Task ID */}
                          {showOptionalColumns.taskId && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-500 text-center">
                              {task.taskCode}
                            </td>
                          )}

                          {/* Col 3: Priority (Inline editable) */}
                          <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 text-center">
                            {editingCell?.taskId === task.taskId && editingCell.field === 'priority' ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="text-xs border border-blue-500 rounded p-1 bg-white dark:bg-slate-800"
                                  autoFocus
                                >
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                                <button onClick={() => commitEdit(task)} className="text-emerald-600">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="text-slate-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(task, 'priority', task.priority)}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getPriorityStyle(
                                  task.priority
                                )} hover:opacity-80 transition-opacity cursor-pointer`}
                                title="Click to change priority"
                              >
                                {task.priority}
                              </button>
                            )}
                          </td>

                          {/* Col 4: Status (Inline editable) */}
                          <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 text-center">
                            {editingCell?.taskId === task.taskId && editingCell.field === 'status' ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="text-xs border border-blue-500 rounded p-1 bg-white dark:bg-slate-800"
                                  autoFocus
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Blocked">Blocked</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                <button onClick={() => commitEdit(task)} className="text-emerald-600">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="text-slate-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(task, 'status', task.status)}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(
                                  task.status
                                )} hover:opacity-80 transition-opacity cursor-pointer`}
                                title="Click to change status"
                              >
                                {task.status}
                              </button>
                            )}
                          </td>

                          {/* Col 5: Progress % (Inline editable with slider or input) */}
                          <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            {editingCell?.taskId === task.taskId && editingCell.field === 'progress' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="w-14 text-xs font-mono border border-blue-500 rounded p-1 text-right bg-white dark:bg-slate-800"
                                  autoFocus
                                />
                                <span className="text-xs">%</span>
                                <button onClick={() => commitEdit(task)} className="text-emerald-600">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="text-slate-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => startEditing(task, 'progress', task.progressPercentage)}
                                className="flex items-center gap-2 cursor-pointer group/prog"
                                title="Click to adjust progress percentage"
                              >
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      task.progressPercentage === 100
                                        ? 'bg-emerald-500'
                                        : task.progressPercentage > 50
                                        ? 'bg-blue-600'
                                        : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${task.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs tabular-nums w-8 text-right group-hover/prog:font-bold text-slate-800 dark:text-slate-200">
                                  {task.progressPercentage}%
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Col 6: Daily Update (Inline editable or open Daily Update Modal) */}
                          <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            {editingCell?.taskId === task.taskId && editingCell.field === 'dailyUpdate' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="flex-1 text-xs border border-blue-500 rounded p-1 bg-white dark:bg-slate-800"
                                  autoFocus
                                />
                                <button onClick={() => commitEdit(task)} className="text-emerald-600">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="text-slate-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group/cell">
                                <span
                                  onClick={() => startEditing(task, 'dailyUpdate', task.dailyUpdateSummary)}
                                  className="text-slate-700 dark:text-slate-300 truncate cursor-text block"
                                  title={task.dailyUpdateSummary || 'Click to edit today\'s update'}
                                >
                                  {task.dailyUpdateSummary || <span className="text-slate-400 italic">No update today</span>}
                                </span>
                                <button
                                  onClick={() => onOpenDailyUpdateModal(task.taskId)}
                                  className="opacity-0 group-hover/cell:opacity-100 text-blue-600 dark:text-blue-400 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 shrink-0 ml-1"
                                  title="Log structured daily activity"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Col 7: Next Action */}
                          <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            <span
                              className="text-slate-700 dark:text-slate-300 truncate block"
                              title={task.nextActionSummary}
                            >
                              {task.nextActionSummary || 'N/A'}
                            </span>
                          </td>

                          {/* Col 8: Blocker/Risk */}
                          <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            {task.blockerSummary ? (
                              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate" title={task.blockerSummary}>
                                  {task.blockerSummary}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Col 9: Remarks */}
                          <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            {editingCell?.taskId === task.taskId && editingCell.field === 'remarks' ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="flex-1 text-xs border border-blue-500 rounded p-1 bg-white dark:bg-slate-800"
                                  autoFocus
                                />
                                <button onClick={() => commitEdit(task)} className="text-emerald-600">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="text-slate-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => startEditing(task, 'remarks', task.remarks)}
                                className="text-slate-600 dark:text-slate-400 truncate block cursor-text"
                                title={task.remarks}
                              >
                                {task.remarks || '—'}
                              </span>
                            )}
                          </td>

                          {/* Optional: Assigned To */}
                          {showOptionalColumns.assignedTo && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5 truncate">
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-[9px]">
                                  {(availableUsers.find(u => u.userId === task.assignedToId)?.name || 'U').slice(0, 2)}
                                </div>
                                <span className="text-slate-700 dark:text-slate-300 truncate">
                                  {availableUsers.find(u => u.userId === task.assignedToId)?.name || 'Unassigned'}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Optional: Due Date */}
                          {showOptionalColumns.dueDate && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px] text-center">
                              <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                                {task.dueDate}
                                {overdue && ' (Overdue)'}
                              </span>
                            </td>
                          )}

                          {/* Optional: Est Hours */}
                          {showOptionalColumns.estHours && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px] text-right text-slate-600 dark:text-slate-400">
                              {task.estimatedHours}h
                            </td>
                          )}

                          {/* Optional: Act Hours */}
                          {showOptionalColumns.actHours && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px] text-right text-slate-600 dark:text-slate-400">
                              {task.actualHours}h
                            </td>
                          )}

                          {/* Optional: Health */}
                          {showOptionalColumns.health && (
                            <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800 text-center">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  task.health === 'Completed'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                    : task.health === 'Critical'
                                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                    : task.health === 'At Risk'
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                    : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {task.health}
                              </span>
                            </td>
                          )}

                          {/* Actions */}
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onOpenDailyUpdateModal(task.taskId)}
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Record Daily Activity"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenTaskDrawer(task.taskId)}
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Details, Risks, Actions, History"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <TableProperties className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {tasks.length === 0 ? 'No tasks recorded yet in this project scope' : 'No tasks found matching your filters.'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {tasks.length === 0
                ? 'Get started by importing your reference Excel spreadsheet or logging tasks under the provisioned master missions.'
                : 'Try resetting the search bar or changing status filters.'}
            </p>
            {tasks.length === 0 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onOpenImportModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Excel Spreadsheet</span>
                </button>
              </div>
            ) : (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      )}

      {/* Tracker Status Footer */}
      <div className="px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            Total Rows: <strong className="text-slate-800 dark:text-slate-200">{filteredTasks.length}</strong>
          </span>
          <span>
            Completed: <strong className="text-emerald-600">{filteredTasks.filter(t => t.status === 'Completed').length}</strong>
          </span>
          <span>
            In Progress: <strong className="text-blue-600">{filteredTasks.filter(t => t.status === 'In Progress').length}</strong>
          </span>
          <span>
            Blocked: <strong className="text-rose-600">{filteredTasks.filter(t => t.status === 'Blocked').length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>RowVersion Concurrency: Enforced</span>
          <span>·</span>
          <span>Double-Counting Prevention: Active</span>
        </div>
      </div>
    </div>
  );
};
