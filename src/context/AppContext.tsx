import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Department,
  Mission,
  Organization,
  Project,
  Task,
  User,
  DailyUpdate,
  NextAction,
  RiskAndBlocker,
  ProgressHistory,
  AuditLog,
  RealTimeEvent,
  ExceptionApprovalRequest,
  TaskStatus,
  TaskPriority,
  HealthStatus,
  RoleDefinition,
  RoleAssignment
} from '../types';
import {
  seedOrganization,
  seedDepartments,
  seedProjects,
  seedMissions,
  seedUsers,
  seedRoles,
  seedRoleAssignments,
  initialAuditLogs
} from '../data/masterDataSeeds';
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  isAdministratorRegistered,
  markAdministratorRegistered
} from '../services/storageService';

interface AppContextType {
  // Authentication & Initial Setup State
  isInitialSetupCompleted: boolean;
  isAuthenticated: boolean;
  registerInitialAdministrator: (adminData: { name: string; email: string; jobTitle: string; password?: string }) => void;
  login: (email: string, password?: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  setUserDisabled: (userId: string, disabled: boolean) => void;
  setUserPassword: (userId: string, newPassword: string) => void;
  resetPasswordWithOtp: (email: string, newPassword: string) => void;

  // Current user & authentication simulation
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  users: User[];
  roles: RoleDefinition[];
  roleAssignments: RoleAssignment[];

  // UI Theme mode: Light, Dark, Fluorescent
  themeMode: 'light' | 'dark' | 'fluorescent';
  setThemeMode: (mode: 'light' | 'dark' | 'fluorescent') => void;

  // Entities
  organization: Organization;
  departments: Department[];
  projects: Project[];
  missions: Mission[];
  tasks: Task[];
  dailyUpdates: DailyUpdate[];
  nextActions: NextAction[];
  risksAndBlockers: RiskAndBlocker[];
  progressHistory: ProgressHistory[];
  exceptionRequests: ExceptionApprovalRequest[];
  auditLogs: AuditLog[];
  realTimeEvents: RealTimeEvent[];
  signalRConnected: boolean;

  // Selected filters / global context
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedMissionId: string;
  setSelectedMissionId: (id: string) => void;
  selectedMissionIdForDetails: string | null;
  setSelectedMissionIdForDetails: (id: string | null) => void;
  navigateToMissionDetails: (missionId: string) => void;
  activeView: 'tracker' | 'dashboard' | 'board' | 'activity_dashboard' | 'my_updates' | 'team_updates' | 'missions' | 'mission_details' | 'actions' | 'risks' | 'reports' | 'audit' | 'architecture' | 'master_data';
  setActiveView: (view: 'tracker' | 'dashboard' | 'board' | 'activity_dashboard' | 'my_updates' | 'team_updates' | 'missions' | 'mission_details' | 'actions' | 'risks' | 'reports' | 'audit' | 'architecture' | 'master_data') => void;
  selectedTaskIdForDrawer: string | null;
  setSelectedTaskIdForDrawer: (taskId: string | null) => void;

  // Permissions helpers
  canEditTask: (task: Task) => boolean;
  canManageMissions: () => boolean;
  canApproveExceptions: () => boolean;
  canManageDepartments: () => boolean;
  canManageMasterData: () => boolean;

  // Master Data CRUD Actions
  createUser: (userData: Omit<User, 'userId'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  createRole: (roleData: Omit<RoleDefinition, 'roleId'>) => void;
  updateRole: (roleId: string, updates: Partial<RoleDefinition>) => void;
  deleteRole: (roleId: string) => { success: boolean; error?: string };
  assignRole: (assignmentData: Omit<RoleAssignment, 'assignmentId' | 'assignedAt' | 'assignedBy'>) => void;
  revokeRoleAssignment: (assignmentId: string) => void;
  createProject: (projectData: Omit<Project, 'projectId'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => { success: boolean; error?: string };
  createDepartment: (deptData: Omit<Department, 'departmentId'>) => void;
  updateDepartment: (deptId: string, updates: Partial<Department>) => void;
  deleteDepartment: (deptId: string) => { success: boolean; error?: string };

  // Business Actions
  updateTaskInline: (taskId: string, updates: Partial<Task>, reason?: string) => { success: boolean; error?: string };
  submitDailyUpdate: (updateData: Omit<DailyUpdate, 'dailyUpdateId' | 'submittedAt' | 'rowVersion'>) => { success: boolean; error?: string };
  createNextAction: (actionData: Omit<NextAction, 'nextActionId' | 'createdAt' | 'updatedAt'>) => void;
  completeNextAction: (nextActionId: string) => void;
  createRiskOrBlocker: (riskData: Omit<RiskAndBlocker, 'riskId' | 'reportedAt' | 'escalationLevel'>) => void;
  escalateBlocker: (riskId: string) => void;
  resolveBlocker: (riskId: string, notes: string) => void;
  approveException: (exceptionId: string, reason: string) => void;
  correctInconsistentTask: (taskId: string, newStatus: TaskStatus, newProgress: number, reason: string) => void;
  createTask: (newTask: Omit<Task, 'taskId' | 'taskCode' | 'createdAt' | 'rowVersion'>) => void;
  createMission: (newMission: Omit<Mission, 'missionId' | 'missionCode' | 'createdAt' | 'rowVersion'>) => void;
  updateMission: (missionId: string, updates: Partial<Mission>) => void;
  deleteMission: (missionId: string) => { success: boolean; error?: string };
  archiveMission: (missionId: string, archive?: boolean) => void;
  markEventRead: (eventId: string) => void;
  clearAllEvents: () => void;
  importTasksFromExcel: (importedTasks: Partial<Task>[], fileName: string) => { imported: number; warnings: number; errors: string[] };
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // First-time administrator setup check: checked against persistent storage
  const [isInitialSetupCompleted, setIsInitialSetupCompleted] = useState<boolean>(() => {
    return isAdministratorRegistered();
  });

  // User Accounts & Master Seeds from persistent storage
  const [users, setUsers] = useState<User[]>(() => {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, seedUsers);
  });

  // Active Session and Authentication state
  const [activeSession, setActiveSession] = useState<{ userId: string } | null>(() => {
    return loadFromStorage<{ userId: string } | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS, seedUsers);
    const session = loadFromStorage<{ userId: string } | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
    if (session) {
      const match = savedUsers.find(u => u.userId === session.userId && !u.isDisabled);
      if (match) return match;
    }
    // Default to first active user
    const firstActive = savedUsers.find(u => !u.isDisabled) || savedUsers[0] || seedUsers[0];
    return firstActive;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS, seedUsers);
    const session = loadFromStorage<{ userId: string } | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
    return Boolean(session && savedUsers.some(u => u.userId === session.userId && !u.isDisabled));
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    return loadFromStorage<RoleDefinition[]>(STORAGE_KEYS.ROLES, seedRoles);
  });

  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>(() => {
    return loadFromStorage<RoleAssignment[]>(STORAGE_KEYS.ROLE_ASSIGNMENTS, seedRoleAssignments);
  });

  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'fluorescent'>(() => {
    return loadFromStorage<'light' | 'dark' | 'fluorescent'>(STORAGE_KEYS.THEME, 'light');
  });

  const setThemeMode = (mode: 'light' | 'dark' | 'fluorescent') => {
    setThemeModeState(mode);
    saveToStorage(STORAGE_KEYS.THEME, mode);
    const root = document.documentElement;
    if (mode === 'light') {
      root.classList.remove('dark', 'theme-fluorescent');
    } else if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('theme-fluorescent');
    } else if (mode === 'fluorescent') {
      root.classList.add('dark', 'theme-fluorescent');
    }
  };

  // Master Data (Persistent across deployments)
  const [organization, setOrganization] = useState<Organization>(() => {
    return loadFromStorage<Organization>(STORAGE_KEYS.ORGANIZATION, seedOrganization);
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    return loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, seedDepartments);
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    return loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, seedProjects);
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    return loadFromStorage<Mission[]>(STORAGE_KEYS.MISSIONS, seedMissions);
  });

  // Operational Entities (Persistent across deployments)
  const [tasks, setTasks] = useState<Task[]>(() => {
    return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  });

  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>(() => {
    return loadFromStorage<DailyUpdate[]>(STORAGE_KEYS.DAILY_UPDATES, []);
  });

  const [nextActions, setNextActions] = useState<NextAction[]>(() => {
    return loadFromStorage<NextAction[]>(STORAGE_KEYS.NEXT_ACTIONS, []);
  });

  const [risksAndBlockers, setRisksAndBlockers] = useState<RiskAndBlocker[]>(() => {
    return loadFromStorage<RiskAndBlocker[]>(STORAGE_KEYS.RISKS, []);
  });

  const [progressHistory, setProgressHistory] = useState<ProgressHistory[]>(() => {
    return loadFromStorage<ProgressHistory[]>(STORAGE_KEYS.PROGRESS_HISTORY, []);
  });

  const [exceptionRequests, setExceptionRequests] = useState<ExceptionApprovalRequest[]>(() => {
    return loadFromStorage<ExceptionApprovalRequest[]>(STORAGE_KEYS.EXCEPTIONS, []);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  });

  // Real-time Event Queue
  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([]);
  const [signalRConnected] = useState<boolean>(true);

  // Persistent Storage Sync Effects - Guarantees data is never lost across reloads/deployments
  useEffect(() => { saveToStorage(STORAGE_KEYS.USERS, users); }, [users]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROJECTS, projects); }, [projects]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.MISSIONS, missions); }, [missions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.TASKS, tasks); }, [tasks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.DAILY_UPDATES, dailyUpdates); }, [dailyUpdates]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.NEXT_ACTIONS, nextActions); }, [nextActions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RISKS, risksAndBlockers); }, [risksAndBlockers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROGRESS_HISTORY, progressHistory); }, [progressHistory]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.EXCEPTIONS, exceptionRequests); }, [exceptionRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments); }, [departments]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ORGANIZATION, organization); }, [organization]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ROLES, roles); }, [roles]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ROLE_ASSIGNMENTS, roleAssignments); }, [roleAssignments]);

  // Navigation & Filtering
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-INFRA-01');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');
  const [selectedMissionIdForDetails, setSelectedMissionIdForDetails] = useState<string | null>('MSN-WIN-01');
  const [activeView, setActiveView] = useState<'tracker' | 'dashboard' | 'board' | 'activity_dashboard' | 'my_updates' | 'team_updates' | 'missions' | 'mission_details' | 'actions' | 'risks' | 'reports' | 'audit' | 'architecture' | 'master_data'>('tracker');
  const [selectedTaskIdForDrawer, setSelectedTaskIdForDrawer] = useState<string | null>(null);

  const navigateToMissionDetails = (missionId: string) => {
    setSelectedMissionIdForDetails(missionId);
    setActiveView('mission_details');
  };

  // Real-Time Event Dispatcher helper
  const broadcastEvent = (event: Omit<RealTimeEvent, 'id' | 'timestamp' | 'read'>) => {
    const newEvent: RealTimeEvent = {
      ...event,
      id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setRealTimeEvents(prev => [newEvent, ...prev.slice(0, 24)]);
  };

  // Audit Logging helper
  const addAuditLog = (
    entityType: AuditLog['entityType'],
    entityId: string,
    action: AuditLog['action'],
    details: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    const newLog: AuditLog = {
      auditId: `AUD-${Date.now().toString().slice(-6)}`,
      entityType,
      entityId,
      action,
      changedBy: currentUser.userId,
      changedAt: new Date().toISOString(),
      details,
      oldValues,
      newValues
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Recalculate Mission Progress using Configurable Weighted Rule (Section 1)
  const recalculateMissionProgress = (missionId: string, updatedTaskList: Task[]) => {
    const childTasks = updatedTaskList.filter(t => t.missionId === missionId);
    if (childTasks.length === 0) return;

    // Filter out Cancelled tasks from active progress aggregation
    const activeTasks = childTasks.filter(t => t.status !== 'Cancelled');
    if (activeTasks.length === 0) return;

    // Check if effort-based weighting is possible
    const totalEstimatedHours = activeTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    let weightedProgress = 0;

    if (totalEstimatedHours > 0) {
      // Effort-based weighting
      const weightedSum = activeTasks.reduce((sum, t) => {
        const weight = t.estimatedHours || 1;
        return sum + (t.progressPercentage * weight);
      }, 0);
      weightedProgress = Math.round(weightedSum / totalEstimatedHours);
    } else {
      // Defined fallback for tasks without estimates: simple arithmetic mean
      const simpleSum = activeTasks.reduce((sum, t) => sum + t.progressPercentage, 0);
      weightedProgress = Math.round(simpleSum / activeTasks.length);
    }

    const totalActualHours = childTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const hasCriticalBlocker = risksAndBlockers.some(
      r => r.missionId === missionId && (r.status === 'Open' || r.status === 'Investigating') && (r.severity === 'Critical' || r.riskType === 'Blocker')
    );
    const hasWarningTasks = childTasks.some(t => t.hasValidationWarning);

    let healthStatus: HealthStatus = 'On Track';
    if (weightedProgress === 100) {
      healthStatus = 'Completed';
    } else if (hasCriticalBlocker) {
      healthStatus = 'Critical';
    } else if (hasWarningTasks || weightedProgress < 50) {
      healthStatus = 'At Risk';
    }

    setMissions(prevMissions =>
      prevMissions.map(m => {
        if (m.missionId === missionId) {
          return {
            ...m,
            progressPercentage: Math.min(100, Math.max(0, weightedProgress)),
            actualHours: totalActualHours,
            healthStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.userId,
            rowVersion: m.rowVersion + 1
          };
        }
        return m;
      })
    );

    broadcastEvent({
      type: 'MISSION_RECALCULATED',
      title: 'Mission Progress Recalculated',
      description: `Progress aggregated to ${weightedProgress}% (${healthStatus})`,
      author: 'System Aggregator',
      projectId: selectedProjectId,
      missionId
    });
  };

  // RBAC Permission Helpers
  const canEditTask = (task: Task): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      // Manager can edit tasks in projects belonging to their department or where they are project manager
      const project = projects.find(p => p.projectId === task.projectId);
      return project?.managerId === currentUser.userId || project?.departmentId === currentUser.departmentId;
    }
    // Staff can edit tasks assigned to them or where they are owner
    return task.assignedToId === currentUser.userId || task.ownerId === currentUser.userId;
  };

  const canManageMissions = (): boolean => {
    return currentUser.role === 'admin' || currentUser.role === 'manager';
  };

  const canApproveExceptions = (): boolean => {
    return currentUser.role === 'admin' || currentUser.role === 'manager';
  };

  const canManageDepartments = (): boolean => {
    return currentUser.role === 'admin';
  };

  const canManageMasterData = (): boolean => {
    return currentUser.role === 'admin' || currentUser.role === 'manager';
  };

  // Master Data CRUD Actions
  const createUser = (userData: Omit<User, 'userId'>) => {
    const userId = `USR-${Date.now().toString().slice(-4)}`;
    const newUser: User = {
      password: userData.password || 'Enterprise@2026',
      isDisabled: userData.isDisabled ?? false,
      isEmailVerified: userData.isEmailVerified ?? true,
      createdAt: userData.createdAt || new Date().toISOString(),
      ...userData,
      userId
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('User', userId, 'CREATE', `Created user ${newUser.name} (${newUser.email}) - Role: ${newUser.role}`);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.userId === userId ? { ...u, ...updates } : u)));
    if (currentUser.userId === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    addAuditLog('User', userId, 'UPDATE', `Updated user details for ${userId}`);
  };

  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    if (currentUser.userId === userId) {
      return { success: false, error: 'Cannot delete the currently logged in user.' };
    }
    const isAssigned = tasks.some(t => t.assignedToId === userId || t.ownerId === userId);
    if (isAssigned) {
      return { success: false, error: 'Cannot delete user: Active tasks or ownership assignments exist for this user.' };
    }
    setUsers(prev => prev.filter(u => u.userId !== userId));
    setRoleAssignments(prev => prev.filter(ra => ra.userId !== userId));
    addAuditLog('User', userId, 'DELETE', `Deleted user ${userId}`);
    return { success: true };
  };

  // First-Time Administrator Registration
  const registerInitialAdministrator = (adminData: {
    name: string;
    email: string;
    jobTitle: string;
    password?: string;
  }) => {
    const adminUser: User = {
      userId: `USR-ADMIN-${Date.now().toString().slice(-4)}`,
      name: adminData.name,
      email: adminData.email.trim().toLowerCase(),
      role: 'admin',
      departmentId: departments[0]?.departmentId || 'DEP-IT-01',
      jobTitle: adminData.jobTitle,
      password: adminData.password || 'Admin@2026!',
      isDisabled: false,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase() !== adminUser.email.toLowerCase() && u.role !== 'admin');
      const updated = [adminUser, ...filtered];
      saveToStorage(STORAGE_KEYS.USERS, updated);
      return updated;
    });

    setCurrentUser(adminUser);
    setIsInitialSetupCompleted(true);
    setIsAuthenticated(true);

    markAdministratorRegistered();
    saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, { userId: adminUser.userId, loginAt: new Date().toISOString() });

    addAuditLog(
      'User',
      adminUser.userId,
      'CREATE',
      `Master Administrator registered: ${adminUser.name} (${adminUser.email}) with verified email OTP.`
    );
  };

  // Login
  const login = (email: string, password?: string, rememberMe = true): { success: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalized);

    if (!user) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (user.isDisabled) {
      return {
        success: false,
        error: 'Account Inactive: This user account has been disabled by the system administrator. Access denied.'
      };
    }

    if (user.password && password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify credentials or reset password via email OTP.' };
    }

    const updatedUser: User = { ...user, lastLoginAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => (u.userId === user.userId ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);

    if (rememberMe) {
      saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, { userId: user.userId, loginAt: new Date().toISOString() });
    } else {
      removeFromStorage(STORAGE_KEYS.ACTIVE_SESSION);
    }

    addAuditLog('User', user.userId, 'UPDATE', `User ${user.name} logged into platform.`);
    return { success: true };
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    removeFromStorage(STORAGE_KEYS.ACTIVE_SESSION);
    if (currentUser) {
      addAuditLog('User', currentUser.userId, 'UPDATE', `User ${currentUser.name} signed out.`);
    }
  };

  // Disable / Enable User by Admin
  const setUserDisabled = (userId: string, disabled: boolean) => {
    setUsers(prev =>
      prev.map(u => (u.userId === userId ? { ...u, isDisabled: disabled } : u))
    );

    // If disabled user is current user, terminate session immediately
    if (currentUser.userId === userId && disabled) {
      logout();
    }

    addAuditLog(
      'User',
      userId,
      'UPDATE',
      `Administrator ${disabled ? 'disabled' : 'enabled'} user account (${userId}).`
    );
  };

  // Set / Reset User Password by Admin
  const setUserPassword = (userId: string, newPassword: string) => {
    setUsers(prev =>
      prev.map(u => (u.userId === userId ? { ...u, password: newPassword } : u))
    );

    addAuditLog(
      'User',
      userId,
      'UPDATE',
      `Administrator updated password for user (${userId}).`
    );
  };

  // Reset Password via verified OTP
  const resetPasswordWithOtp = (email: string, newPassword: string) => {
    setUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u))
    );

    addAuditLog(
      'User',
      email,
      'UPDATE',
      `User password reset via email OTP verification for ${email}.`
    );
  };

  const createRole = (roleData: Omit<RoleDefinition, 'roleId'>) => {
    const roleId = `ROL-${Date.now().toString().slice(-4)}`;
    const newRole: RoleDefinition = {
      ...roleData,
      roleId
    };
    setRoles(prev => [...prev, newRole]);
    addAuditLog('Role', roleId, 'CREATE', `Created role ${newRole.name} (${newRole.code})`);
  };

  const updateRole = (roleId: string, updates: Partial<RoleDefinition>) => {
    setRoles(prev => prev.map(r => (r.roleId === roleId ? { ...r, ...updates } : r)));
    addAuditLog('Role', roleId, 'UPDATE', `Updated role ${roleId}`);
  };

  const deleteRole = (roleId: string): { success: boolean; error?: string } => {
    const role = roles.find(r => r.roleId === roleId);
    if (role?.isSystem) {
      return { success: false, error: 'System roles (Admin, Manager, Staff, Auditor) cannot be deleted.' };
    }
    const assigned = roleAssignments.some(ra => ra.roleId === roleId);
    if (assigned) {
      return { success: false, error: 'Cannot delete role: active role assignments exist for this role.' };
    }
    setRoles(prev => prev.filter(r => r.roleId !== roleId));
    addAuditLog('Role', roleId, 'DELETE', `Deleted role ${roleId}`);
    return { success: true };
  };

  const assignRole = (assignmentData: Omit<RoleAssignment, 'assignmentId' | 'assignedAt' | 'assignedBy'>) => {
    const assignmentId = `ASN-${Date.now().toString().slice(-4)}`;
    const newAssignment: RoleAssignment = {
      ...assignmentData,
      assignmentId,
      assignedAt: new Date().toISOString(),
      assignedBy: currentUser.userId
    };
    setRoleAssignments(prev => [...prev, newAssignment]);
    addAuditLog('RoleAssignment', assignmentId, 'CREATE', `Assigned role ${assignmentData.roleId} to user ${assignmentData.userId}`);
  };

  const revokeRoleAssignment = (assignmentId: string) => {
    setRoleAssignments(prev => prev.filter(ra => ra.assignmentId !== assignmentId));
    addAuditLog('RoleAssignment', assignmentId, 'DELETE', `Revoked role assignment ${assignmentId}`);
  };

  const createProject = (projectData: Omit<Project, 'projectId'>) => {
    const projectId = `PRJ-${projectData.code || Date.now().toString().slice(-4)}`;
    const newProject: Project = {
      ...projectData,
      projectId
    };
    setProjects(prev => [...prev, newProject]);
    addAuditLog('Project', projectId, 'CREATE', `Created project ${newProject.name} (${newProject.code})`);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.projectId === projectId ? { ...p, ...updates } : p)));
    addAuditLog('Project', projectId, 'UPDATE', `Updated project ${projectId}`);
  };

  const deleteProject = (projectId: string): { success: boolean; error?: string } => {
    const hasMissions = missions.some(m => m.projectId === projectId);
    if (hasMissions) {
      return { success: false, error: 'Cannot delete project: active missions exist under this project.' };
    }
    setProjects(prev => prev.filter(p => p.projectId !== projectId));
    if (selectedProjectId === projectId && projects.length > 1) {
      const remaining = projects.filter(p => p.projectId !== projectId);
      if (remaining.length > 0) setSelectedProjectId(remaining[0].projectId);
    }
    addAuditLog('Project', projectId, 'DELETE', `Deleted project ${projectId}`);
    return { success: true };
  };

  const createDepartment = (deptData: Omit<Department, 'departmentId'>) => {
    const departmentId = `DEP-${deptData.code || Date.now().toString().slice(-4)}`;
    const newDept: Department = {
      ...deptData,
      departmentId,
      organizationId: organization.organizationId
    };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('Department', departmentId, 'CREATE', `Created department ${newDept.name} (${newDept.code})`);
  };

  const updateDepartment = (deptId: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.departmentId === deptId ? { ...d, ...updates } : d)));
    addAuditLog('Department', deptId, 'UPDATE', `Updated department ${deptId}`);
  };

  const deleteDepartment = (deptId: string): { success: boolean; error?: string } => {
    const hasProjects = projects.some(p => p.departmentId === deptId);
    if (hasProjects) {
      return { success: false, error: 'Cannot delete department: associated projects exist under this department.' };
    }
    setDepartments(prev => prev.filter(d => d.departmentId !== deptId));
    addAuditLog('Department', deptId, 'DELETE', `Deleted department ${deptId}`);
    return { success: true };
  };

  // Validate Progress Rules (Section 7)
  const validateProgressRules = (status: TaskStatus, progress: number): { isValid: boolean; warning?: string } => {
    if (status === 'Not Started' && progress > 0) {
      return {
        isValid: false,
        warning: `Contradictory state: Task is "Not Started" but progress is ${progress}%. Progress must be 0% or status changed to In Progress.`
      };
    }
    if (status === 'Completed' && progress !== 100) {
      return {
        isValid: false,
        warning: `Contradictory state: Task is "Completed" but progress is ${progress}%. Completed tasks must be 100%.`
      };
    }
    if (status === 'In Progress' && progress === 100) {
      return {
        isValid: false,
        warning: `Contradictory state: Task is "In Progress" with 100% progress. If finished, mark status as Completed.`
      };
    }
    if (status === 'In Progress' && progress === 0) {
      return {
        isValid: false,
        warning: `Contradictory state: Task is "In Progress" with 0% progress. Progress should be 1-99%.`
      };
    }
    return { isValid: true };
  };

  // Inline Task Update (Excel-style tracker inline edits)
  const updateTaskInline = (taskId: string, updates: Partial<Task>, reason?: string): { success: boolean; error?: string } => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    if (!canEditTask(task)) {
      return { success: false, error: 'Authorization Denied: You do not have permission to modify this task.' };
    }

    const newStatus = updates.status ?? task.status;
    const newProgress = updates.progressPercentage !== undefined ? updates.progressPercentage : task.progressPercentage;

    const validation = validateProgressRules(newStatus, newProgress);
    const hasWarning = !validation.isValid;
    const warningMessage = validation.warning;

    const oldValues = { ...task };

    const updatedTask: Task = {
      ...task,
      ...updates,
      status: newStatus,
      progressPercentage: newProgress,
      hasValidationWarning: hasWarning,
      validationWarningMessage: warningMessage,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      lastUpdatedBy: currentUser.userId,
      rowVersion: task.rowVersion + 1
    };

    const newTasks = tasks.map(t => (t.taskId === taskId ? updatedTask : t));
    setTasks(newTasks);

    // Record progress history if status or progress changed
    if (newStatus !== task.status || newProgress !== task.progressPercentage) {
      const historyEntry: ProgressHistory = {
        historyId: `HIST-${Date.now().toString().slice(-6)}`,
        taskId,
        oldProgress: task.progressPercentage,
        newProgress,
        oldStatus: task.status,
        newStatus,
        updatedBy: currentUser.userId,
        updatedAt: new Date().toISOString(),
        reason: reason || 'Inline Tracker modification'
      };
      setProgressHistory(prev => [historyEntry, ...prev]);
    }

    // Audit log
    addAuditLog('Task', taskId, 'UPDATE', `Inline update on task ${task.taskCode}: ${task.title}`, oldValues, updatedTask);

    // Broadcast
    broadcastEvent({
      type: 'TASK_UPDATED',
      title: `Task Updated: ${task.taskCode}`,
      description: `${currentUser.name} updated status to ${newStatus} (${newProgress}%)`,
      author: currentUser.name,
      projectId: task.projectId,
      missionId: task.missionId,
      taskId
    });

    // Recalculate parent mission
    recalculateMissionProgress(task.missionId, newTasks);

    return { success: true };
  };

  // Submit Daily Activity Update (Section 4)
  const submitDailyUpdate = (updateData: Omit<DailyUpdate, 'dailyUpdateId' | 'submittedAt' | 'rowVersion'>) => {
    const task = tasks.find(t => t.taskId === updateData.taskId);
    if (!task) return { success: false, error: 'Task not found' };

    if (!canEditTask(task)) {
      return { success: false, error: 'Authorization Denied: Only assigned staff or project managers can log daily activity.' };
    }

    const newDailyUpdate: DailyUpdate = {
      ...updateData,
      dailyUpdateId: `UPD-${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toISOString(),
      rowVersion: 1
    };

    // Stored separately from task summary fields to preserve complete history
    setDailyUpdates(prev => [newDailyUpdate, ...prev]);

    // Validation rule check
    const validation = validateProgressRules(updateData.currentStatus, updateData.newProgressPercentage);

    // Update Task summary fields
    const updatedTask: Task = {
      ...task,
      status: updateData.currentStatus,
      progressPercentage: updateData.newProgressPercentage,
      actualHours: task.actualHours + (updateData.hoursSpent || 0), // accurately adds hours without duplicate time entries
      dailyUpdateSummary: updateData.workCompletedToday,
      nextActionSummary: updateData.plannedNextAction || task.nextActionSummary,
      blockerSummary: updateData.blockerSummary || '',
      remarks: updateData.remarks || task.remarks,
      lastUpdatedDate: updateData.updateDate,
      lastUpdatedBy: currentUser.userId,
      hasValidationWarning: !validation.isValid,
      validationWarningMessage: validation.warning,
      rowVersion: task.rowVersion + 1
    };

    const newTasks = tasks.map(t => (t.taskId === task.taskId ? updatedTask : t));
    setTasks(newTasks);

    // Record progress history
    const historyEntry: ProgressHistory = {
      historyId: `HIST-${Date.now().toString().slice(-6)}`,
      taskId: task.taskId,
      oldProgress: updateData.previousProgressPercentage,
      newProgress: updateData.newProgressPercentage,
      oldStatus: task.status,
      newStatus: updateData.currentStatus,
      updatedBy: currentUser.userId,
      updatedAt: new Date().toISOString(),
      reason: `Daily Activity Logged: ${updateData.workCompletedToday}`
    };
    setProgressHistory(prev => [historyEntry, ...prev]);

    // If next action was provided, add to NextAction entity if not existing
    if (updateData.plannedNextAction && updateData.plannedNextAction !== 'N/A' && updateData.plannedNextAction.trim() !== '') {
      const nextAct: NextAction = {
        nextActionId: `ACT-${Date.now().toString().slice(-6)}`,
        taskId: task.taskId,
        description: updateData.plannedNextAction,
        assignedTo: task.assignedToId,
        targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Open',
        priority: task.priority,
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNextActions(prev => [nextAct, ...prev]);
    }

    // If blocker was provided, raise a Blocker entity
    if (updateData.blockerSummary && updateData.blockerSummary.trim() !== '') {
      const newBlocker: RiskAndBlocker = {
        riskId: `BLK-${Date.now().toString().slice(-6)}`,
        projectId: task.projectId,
        missionId: task.missionId,
        taskId: task.taskId,
        riskType: 'Blocker',
        title: updateData.blockerSummary,
        description: `Identified during daily update: ${updateData.workCompletedToday}`,
        severity: 'High',
        status: 'Open',
        reportedBy: currentUser.userId,
        assignedTo: task.ownerId,
        reportedAt: new Date().toISOString(),
        escalationLevel: 1
      };
      setRisksAndBlockers(prev => [newBlocker, ...prev]);

      broadcastEvent({
        type: 'BLOCKER_RAISED',
        title: `Blocker Raised on ${task.taskCode}`,
        description: updateData.blockerSummary,
        author: currentUser.name,
        projectId: task.projectId,
        missionId: task.missionId,
        taskId: task.taskId
      });
    }

    // Audit log
    addAuditLog('DailyUpdate', newDailyUpdate.dailyUpdateId, 'CREATE', `Logged daily update for ${task.taskCode} (${updateData.hoursSpent} hrs)`);

    // Broadcast
    broadcastEvent({
      type: 'DAILY_UPDATE_SUBMITTED',
      title: `Daily Update Logged: ${task.taskCode}`,
      description: `${currentUser.name}: ${updateData.workCompletedToday.slice(0, 60)}...`,
      author: currentUser.name,
      projectId: task.projectId,
      missionId: task.missionId,
      taskId: task.taskId
    });

    // Recalculate parent mission
    recalculateMissionProgress(task.missionId, newTasks);

    return { success: true };
  };

  // Next Action Management
  const createNextAction = (actionData: Omit<NextAction, 'nextActionId' | 'createdAt' | 'updatedAt'>) => {
    const newAction: NextAction = {
      ...actionData,
      nextActionId: `ACT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNextActions(prev => [newAction, ...prev]);

    // Update summary field on task
    setTasks(prev =>
      prev.map(t => (t.taskId === actionData.taskId ? { ...t, nextActionSummary: actionData.description } : t))
    );

    addAuditLog('NextAction', newAction.nextActionId, 'CREATE', `Created next action: ${actionData.description}`);
  };

  const completeNextAction = (nextActionId: string) => {
    setNextActions(prev =>
      prev.map(a => {
        if (a.nextActionId === nextActionId) {
          return {
            ...a,
            status: 'Completed',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      })
    );
    addAuditLog('NextAction', nextActionId, 'UPDATE', `Marked next action ${nextActionId} as Completed`);
  };

  // Risk and Blocker Management
  const createRiskOrBlocker = (riskData: Omit<RiskAndBlocker, 'riskId' | 'reportedAt' | 'escalationLevel'>) => {
    const newRisk: RiskAndBlocker = {
      ...riskData,
      riskId: riskData.riskType === 'Blocker' ? `BLK-${Date.now().toString().slice(-6)}` : `RSK-${Date.now().toString().slice(-6)}`,
      reportedAt: new Date().toISOString(),
      escalationLevel: 0
    };

    setRisksAndBlockers(prev => [newRisk, ...prev]);

    if (riskData.taskId) {
      setTasks(prev =>
        prev.map(t => (t.taskId === riskData.taskId ? { ...t, blockerSummary: riskData.title, health: 'Critical' } : t))
      );
    }

    addAuditLog('Risk', newRisk.riskId, 'CREATE', `Created ${riskData.riskType}: ${riskData.title}`);

    broadcastEvent({
      type: 'BLOCKER_RAISED',
      title: `${riskData.riskType} Logged`,
      description: `${riskData.title} (${riskData.severity} Severity)`,
      author: currentUser.name,
      projectId: riskData.projectId,
      missionId: riskData.missionId,
      taskId: riskData.taskId
    });
  };

  const escalateBlocker = (riskId: string) => {
    setRisksAndBlockers(prev =>
      prev.map(r => {
        if (r.riskId === riskId) {
          const newLevel = r.escalationLevel + 1;
          return {
            ...r,
            escalationLevel: newLevel,
            severity: 'Critical'
          };
        }
        return r;
      })
    );
    addAuditLog('Risk', riskId, 'UPDATE', `Escalated blocker ${riskId} to executive tier`);
  };

  const resolveBlocker = (riskId: string, notes: string) => {
    const risk = risksAndBlockers.find(r => r.riskId === riskId);
    setRisksAndBlockers(prev =>
      prev.map(r => {
        if (r.riskId === riskId) {
          return {
            ...r,
            status: 'Resolved',
            resolvedAt: new Date().toISOString(),
            resolutionNotes: notes
          };
        }
        return r;
      })
    );

    if (risk?.taskId) {
      setTasks(prev =>
        prev.map(t => (t.taskId === risk.taskId ? { ...t, blockerSummary: '', health: 'On Track' } : t))
      );
    }

    addAuditLog('Risk', riskId, 'UPDATE', `Resolved blocker ${riskId}: ${notes}`);
  };

  // Exception Approval for Contradictory Records (Section 14 & Section 7)
  const approveException = (exceptionId: string, reason: string) => {
    if (!canApproveExceptions()) {
      alert('Only Project Managers and Administrators can approve validation exceptions.');
      return;
    }

    const req = exceptionRequests.find(e => e.exceptionId === exceptionId);
    if (!req) return;

    setExceptionRequests(prev =>
      prev.map(e => (e.exceptionId === exceptionId ? { ...e, status: 'Approved', approvedBy: currentUser.userId, approvedAt: new Date().toISOString() } : e))
    );

    setTasks(prev =>
      prev.map(t => {
        if (t.taskId === req.taskId) {
          return {
            ...t,
            hasValidationWarning: false,
            exceptionApproved: true,
            exceptionReason: reason,
            remarks: `${t.remarks ? t.remarks + ' | ' : ''}Exception Approved: ${reason}`,
            rowVersion: t.rowVersion + 1
          };
        }
        return t;
      })
    );

    addAuditLog('Exception', exceptionId, 'EXCEPTION_APPROVED', `Approved exception for task ${req.taskId}: ${reason}`);

    broadcastEvent({
      type: 'EXCEPTION_APPROVED',
      title: 'Validation Exception Approved',
      description: `Task ${req.taskTitle} exception authorized by ${currentUser.name}`,
      author: currentUser.name,
      projectId: selectedProjectId,
      taskId: req.taskId
    });
  };

  // Correct Inconsistent Task (Aligning Status and Progress)
  const correctInconsistentTask = (taskId: string, newStatus: TaskStatus, newProgress: number, reason: string) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      progressPercentage: newProgress,
      hasValidationWarning: false,
      validationWarningMessage: undefined,
      exceptionApproved: true,
      exceptionReason: `Corrected: ${reason}`,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      lastUpdatedBy: currentUser.userId,
      rowVersion: task.rowVersion + 1
    };

    const newTasks = tasks.map(t => (t.taskId === taskId ? updatedTask : t));
    setTasks(newTasks);

    // Update exception requests if any
    setExceptionRequests(prev =>
      prev.map(e => (e.taskId === taskId ? { ...e, status: 'Corrected', approvedBy: currentUser.userId, approvedAt: new Date().toISOString() } : e))
    );

    // Add progress history
    setProgressHistory(prev => [
      {
        historyId: `HIST-${Date.now().toString().slice(-6)}`,
        taskId,
        oldProgress: task.progressPercentage,
        newProgress,
        oldStatus: task.status,
        newStatus,
        updatedBy: currentUser.userId,
        updatedAt: new Date().toISOString(),
        reason: `Reconciliation correction: ${reason}`
      },
      ...prev
    ]);

    addAuditLog('Task', taskId, 'PROGRESS_UPDATE', `Reconciled contradictory state: Status set to ${newStatus}, Progress to ${newProgress}%. Reason: ${reason}`);

    // Recalculate parent mission
    recalculateMissionProgress(task.missionId, newTasks);
  };

  // Create Task
  const createTask = (newTaskData: Omit<Task, 'taskId' | 'taskCode' | 'createdAt' | 'rowVersion'>) => {
    const taskId = `TSK-${Date.now().toString().slice(-4)}`;
    const taskCode = `TSK-${tasks.length + 1}`.padStart(7, '0');

    const validation = validateProgressRules(newTaskData.status, newTaskData.progressPercentage);

    const newTask: Task = {
      ...newTaskData,
      taskId,
      taskCode,
      createdAt: new Date().toISOString(),
      rowVersion: 1,
      hasValidationWarning: !validation.isValid,
      validationWarningMessage: validation.warning
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);

    addAuditLog('Task', taskId, 'CREATE', `Created task ${taskCode}: ${newTask.title}`);
    recalculateMissionProgress(newTask.missionId, newTasks);
  };

  // Create Mission
  const createMission = (newMissionData: Omit<Mission, 'missionId' | 'missionCode' | 'createdAt' | 'rowVersion'>) => {
    const missionId = `MSN-${Date.now().toString().slice(-4)}`;
    const missionCode = `MSN-GEN-${missions.length + 1}`;

    const newMission: Mission = {
      ...newMissionData,
      missionId,
      missionCode,
      createdAt: new Date().toISOString(),
      rowVersion: 1
    };

    setMissions(prev => [...prev, newMission]);
    addAuditLog('Mission', missionId, 'CREATE', `Created mission ${missionCode}: ${newMission.missionName}`);
  };

  const updateMission = (missionId: string, updates: Partial<Mission>) => {
    setMissions(prev =>
      prev.map(m => (m.missionId === missionId ? { ...m, ...updates, updatedAt: new Date().toISOString(), updatedBy: currentUser.userId, rowVersion: m.rowVersion + 1 } : m))
    );
    addAuditLog('Mission', missionId, 'UPDATE', `Updated mission details for ${missionId}`);
  };

  const deleteMission = (missionId: string): { success: boolean; error?: string } => {
    const childTasks = tasks.filter(t => t.missionId === missionId);
    if (childTasks.length > 0) {
      return {
        success: false,
        error: `Cannot delete mission: ${childTasks.length} task(s) are actively linked to this mission. Please reassign or delete tasks first, or archive the mission.`
      };
    }

    const mission = missions.find(m => m.missionId === missionId);
    setMissions(prev => prev.filter(m => m.missionId !== missionId));
    if (selectedMissionId === missionId) {
      setSelectedMissionId('all');
    }
    if (selectedMissionIdForDetails === missionId) {
      const remaining = missions.filter(m => m.missionId !== missionId);
      setSelectedMissionIdForDetails(remaining.length > 0 ? remaining[0].missionId : null);
    }

    addAuditLog('Mission', missionId, 'DELETE', `Deleted mission ${mission?.missionCode || missionId}: ${mission?.missionName || ''}`);
    broadcastEvent({
      type: 'MISSION_RECALCULATED',
      title: 'Mission Deleted',
      description: `Mission ${mission?.missionCode || missionId} removed from project`,
      author: currentUser.name,
      projectId: mission?.projectId || selectedProjectId,
      missionId
    });

    return { success: true };
  };

  const archiveMission = (missionId: string, archive = true) => {
    const mission = missions.find(m => m.missionId === missionId);
    updateMission(missionId, { isArchived: archive });
    addAuditLog('Mission', missionId, 'UPDATE', `${archive ? 'Archived' : 'Unarchived'} mission ${mission?.missionCode || missionId}`);
    broadcastEvent({
      type: 'MISSION_RECALCULATED',
      title: archive ? 'Mission Archived' : 'Mission Restored',
      description: `Mission ${mission?.missionCode} ${archive ? 'archived' : 'restored'}`,
      author: currentUser.name,
      projectId: mission?.projectId || selectedProjectId,
      missionId
    });
  };

  const markEventRead = (eventId: string) => {
    setRealTimeEvents(prev => prev.map(e => (e.id === eventId ? { ...e, read: true } : e)));
  };

  const clearAllEvents = () => {
    setRealTimeEvents([]);
  };

  // Excel Import with validation & duplicate detection (Section 3 & Section 14)
  const importTasksFromExcel = (
    importedTasks: Partial<Task>[],
    fileName: string
  ): { imported: number; warnings: number; errors: string[] } => {
    let importedCount = 0;
    let warningCount = 0;
    const errors: string[] = [];

    const newTaskList: Task[] = [...tasks];

    importedTasks.forEach((row, index) => {
      if (!row.title) {
        errors.push(`Row ${index + 1}: Task title is missing.`);
        return;
      }

      // Check for duplicate title within mission
      const existing = newTaskList.find(t => t.title.toLowerCase() === row.title?.toLowerCase() && t.missionId === (row.missionId || selectedMissionId));
      if (existing) {
        errors.push(`Row ${index + 1}: Duplicate task detected ("${row.title}"). Skipped.`);
        return;
      }

      const status: TaskStatus = row.status || 'Not Started';
      const progress: number = row.progressPercentage !== undefined ? row.progressPercentage : 0;
      const validation = validateProgressRules(status, progress);

      const isWarning = !validation.isValid;
      if (isWarning) {
        warningCount++;
      }

      const newTask: Task = {
        taskId: `TSK-IMP-${Date.now().toString().slice(-4)}-${index}`,
        taskCode: `TSK-${(newTaskList.length + 1).toString().padStart(3, '0')}`,
        missionId: row.missionId || selectedMissionId !== 'all' ? selectedMissionId : 'MSN-WIN-01',
        projectId: selectedProjectId,
        title: row.title,
        description: row.description || `Imported from ${fileName}`,
        assignedToId: row.assignedToId || currentUser.userId,
        ownerId: currentUser.userId,
        priority: (row.priority as TaskPriority) || 'High',
        status,
        progressPercentage: progress,
        estimatedHours: row.estimatedHours || 20,
        actualHours: row.actualHours || 0,
        plannedStartDate: row.plannedStartDate || new Date().toISOString().split('T')[0],
        dueDate: row.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        health: isWarning ? 'At Risk' : status === 'Completed' ? 'Completed' : 'On Track',
        dailyUpdateSummary: row.dailyUpdateSummary || '',
        nextActionSummary: row.nextActionSummary || 'N/A',
        blockerSummary: row.blockerSummary || '',
        remarks: row.remarks || `Imported from ${fileName}`,
        lastUpdatedDate: new Date().toISOString().split('T')[0],
        lastUpdatedBy: currentUser.userId,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
        hasValidationWarning: isWarning,
        validationWarningMessage: validation.warning,
        exceptionApproved: false
      };

      newTaskList.push(newTask);
      importedCount++;

      // If imported task had validation warning (like Tasks 2 and 5), create exception record
      if (isWarning) {
        const newException: ExceptionApprovalRequest = {
          exceptionId: `EXC-IMP-${Date.now().toString().slice(-4)}-${index}`,
          taskId: newTask.taskId,
          taskTitle: newTask.title,
          missionName: missions.find(m => m.missionId === newTask.missionId)?.missionName || 'Mission',
          sourceStatus: status,
          sourceProgress: progress,
          recommendedStatus: progress === 100 ? 'Completed' : 'In Progress',
          recommendedProgress: status === 'Not Started' ? 0 : progress,
          reason: `Imported with contradictory status (${status}) and progress (${progress}%).`,
          requestedBy: currentUser.userId,
          requestedAt: new Date().toISOString(),
          status: 'Pending'
        };
        setExceptionRequests(prev => [newException, ...prev]);
      }
    });

    setTasks(newTaskList);
    addAuditLog('Task', 'BATCH-IMPORT', 'IMPORT', `Imported ${importedCount} tasks from ${fileName}. ${warningCount} warnings generated.`);

    return { imported: importedCount, warnings: warningCount, errors };
  };

  const resetToSampleData = () => {
    setDepartments(seedDepartments);
    setProjects(seedProjects);
    setMissions(seedMissions);
    setTasks([]);
    setDailyUpdates([]);
    setNextActions([]);
    setRisksAndBlockers([]);
    setProgressHistory([]);
    setExceptionRequests([]);
    setAuditLogs(initialAuditLogs);
    setUsers(seedUsers);
    setRoles(seedRoles);
    setRoleAssignments(seedRoleAssignments);
  };

  return (
    <AppContext.Provider
      value={{
        isInitialSetupCompleted,
        isAuthenticated,
        registerInitialAdministrator,
        login,
        logout,
        setUserDisabled,
        setUserPassword,
        resetPasswordWithOtp,
        currentUser,
        setCurrentUser,
        availableUsers: users,
        users,
        roles,
        roleAssignments,
        themeMode,
        setThemeMode,
        organization,
        departments,
        projects,
        missions,
        tasks,
        dailyUpdates,
        nextActions,
        risksAndBlockers,
        progressHistory,
        exceptionRequests,
        auditLogs,
        realTimeEvents,
        signalRConnected,
        selectedProjectId,
        setSelectedProjectId,
        selectedMissionId,
        setSelectedMissionId,
        selectedMissionIdForDetails,
        setSelectedMissionIdForDetails,
        navigateToMissionDetails,
        activeView,
        setActiveView,
        selectedTaskIdForDrawer,
        setSelectedTaskIdForDrawer,
        canEditTask,
        canManageMissions,
        canApproveExceptions,
        canManageDepartments,
        canManageMasterData,
        createUser,
        updateUser,
        deleteUser,
        createRole,
        updateRole,
        deleteRole,
        assignRole,
        revokeRoleAssignment,
        createProject,
        updateProject,
        deleteProject,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        updateTaskInline,
        submitDailyUpdate,
        createNextAction,
        completeNextAction,
        createRiskOrBlocker,
        escalateBlocker,
        resolveBlocker,
        approveException,
        correctInconsistentTask,
        createTask,
        createMission,
        updateMission,
        deleteMission,
        archiveMission,
        markEventRead,
        clearAllEvents,
        importTasksFromExcel,
        resetToSampleData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
