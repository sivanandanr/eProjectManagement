/**
 * Enterprise Project & Task Management Platform - Domain Models & DTOs
 * Master Specification v2.0 - Mission-Based Architecture
 */

export type Role = 'admin' | 'manager' | 'staff' | string;

export interface RoleDefinition {
  roleId: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export interface RoleAssignment {
  assignmentId: string;
  userId: string;
  roleId: string;
  scopeType: 'Global' | 'Project' | 'Department';
  scopeId?: string;
  assignedAt: string;
  assignedBy: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  avatarUrl?: string;
  jobTitle: string;
  password?: string;
  isDisabled?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Organization {
  organizationId: string;
  name: string;
  code: string;
}

export interface Department {
  departmentId: string;
  organizationId: string;
  name: string;
  code: string;
  managerId: string;
}

export interface Project {
  projectId: string;
  departmentId: string;
  name: string;
  code: string;
  description: string;
  managerId: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
  startDate: string;
  targetEndDate: string;
  budget?: number;
}

export type MissionPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MissionStatus = 'Draft' | 'Not Started' | 'In Progress' | 'On Hold' | 'Blocked' | 'Completed' | 'Cancelled';
export type HealthStatus = 'On Track' | 'At Risk' | 'Critical' | 'Completed';

export interface Mission {
  missionId: string;
  missionCode: string;
  projectId: string;
  missionName: string;
  description: string;
  missionOwnerId: string;
  departmentId: string;
  priority: MissionPriority;
  status: MissionStatus;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  estimatedHours: number;
  actualHours: number;
  progressPercentage: number;
  healthStatus: HealthStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  rowVersion: number;
  isArchived: boolean;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed' | 'Cancelled';

export interface Task {
  taskId: string;
  taskCode: string;
  missionId: string;
  projectId: string;
  title: string;
  description: string;
  assignedToId: string;
  ownerId: string;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercentage: number;
  estimatedHours: number;
  actualHours: number;
  plannedStartDate: string;
  dueDate: string;
  health: HealthStatus;
  // Excel Tracking Summary Fields (Synchronized with latest activity updates)
  dailyUpdateSummary: string;
  nextActionSummary: string;
  blockerSummary: string;
  remarks: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  // Concurrency and metadata
  rowVersion: number;
  createdAt: string;
  hasValidationWarning?: boolean;
  validationWarningMessage?: string;
  exceptionApproved?: boolean;
  exceptionReason?: string;
}

export interface Subtask {
  subtaskId: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  assignedToId?: string;
  estimatedHours?: number;
}

export interface DailyUpdate {
  dailyUpdateId: string;
  taskId: string;
  projectId: string;
  missionId: string;
  updateDate: string; // YYYY-MM-DD
  workCompletedToday: string;
  previousProgressPercentage: number;
  newProgressPercentage: number;
  hoursSpent: number;
  currentStatus: TaskStatus;
  plannedNextAction: string;
  blockerSummary: string;
  remarks: string;
  submittedBy: string; // UserId
  submittedAt: string; // ISO
  lastModifiedAt?: string;
  rowVersion: number;
}

export type NextActionStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';

export interface NextAction {
  nextActionId: string;
  taskId: string;
  description: string;
  assignedTo: string; // UserId
  targetDate: string;
  status: NextActionStatus;
  priority: TaskPriority;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export type RiskType = 'Risk' | 'Blocker' | 'Dependency' | 'Issue';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskStatus = 'Open' | 'Investigating' | 'Mitigating' | 'Resolved' | 'Closed';

export interface RiskAndBlocker {
  riskId: string;
  projectId: string;
  missionId: string;
  taskId?: string;
  riskType: RiskType;
  title: string;
  description: string;
  severity: Severity;
  probability?: 'Low' | 'Medium' | 'High';
  impact?: 'Minor' | 'Moderate' | 'Severe';
  status: RiskStatus;
  reportedBy: string; // UserId
  assignedTo: string; // UserId
  reportedAt: string;
  targetResolutionDate?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  escalationLevel: number;
}

export interface ProgressHistory {
  historyId: string;
  taskId: string;
  oldProgress: number;
  newProgress: number;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
  isExceptionApproved?: boolean;
  approvedBy?: string;
}

export interface TaskComment {
  commentId: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  attachmentId: string;
  taskId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface AuditLog {
  auditId: string;
  entityType: 'Mission' | 'Task' | 'DailyUpdate' | 'Risk' | 'NextAction' | 'Exception' | 'User' | 'Role' | 'RoleAssignment' | 'Project' | 'Department';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PROGRESS_UPDATE' | 'EXCEPTION_APPROVED' | 'IMPORT';
  changedBy: string;
  changedAt: string;
  details: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface RealTimeEvent {
  id: string;
  type: 'TASK_UPDATED' | 'DAILY_UPDATE_SUBMITTED' | 'BLOCKER_RAISED' | 'MISSION_RECALCULATED' | 'EXCEPTION_APPROVED';
  title: string;
  description: string;
  timestamp: string;
  author: string;
  projectId: string;
  missionId?: string;
  taskId?: string;
  read: boolean;
}

export interface ExceptionApprovalRequest {
  exceptionId: string;
  taskId: string;
  taskTitle: string;
  missionName: string;
  sourceStatus: TaskStatus;
  sourceProgress: number;
  recommendedStatus: TaskStatus;
  recommendedProgress: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Corrected' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
}
