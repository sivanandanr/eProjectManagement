import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  RoleDefinition,
  RoleAssignment,
  Project,
  Mission,
  Department,
  Role
} from '../../types';
import {
  Users,
  Shield,
  KeyRound,
  FolderKanban,
  Target,
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  Briefcase,
  Mail,
  ShieldAlert,
  Info,
  Archive,
  RefreshCw
} from 'lucide-react';
import { MissionModal } from '../missions/MissionModal';
import { sendOtpToEmail, verifyOtp } from '../../services/otpService';

type AdminTab = 'users' | 'roles' | 'assignments' | 'projects' | 'missions' | 'departments';

export const MasterDataAdminView: React.FC = () => {
  const {
    currentUser,
    users,
    roles,
    roleAssignments,
    projects,
    missions,
    departments,
    organization,
    createUser,
    updateUser,
    deleteUser,
    setUserDisabled,
    setUserPassword,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRoleAssignment,
    createProject,
    updateProject,
    deleteProject,
    deleteMission,
    archiveMission,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    canManageMasterData
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Set Password Modal state
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [targetUserForPassword, setTargetUserForPassword] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    entity: 'user' | 'role' | 'assignment' | 'project' | 'mission' | 'department';
    id: string;
    title: string;
  } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Users Form State & OTP Verification ---
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as Role,
    departmentId: departments[0]?.departmentId || '',
    jobTitle: '',
    password: ''
  });

  const [userOtpInput, setUserOtpInput] = useState('');
  const [isUserOtpSent, setIsUserOtpSent] = useState(false);
  const [isUserEmailVerified, setIsUserEmailVerified] = useState(false);
  const [userOtpError, setUserOtpError] = useState('');
  const [isSendingUserOtp, setIsSendingUserOtp] = useState(false);

  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        jobTitle: user.jobTitle,
        password: ''
      });
      setIsUserEmailVerified(user.isEmailVerified ?? true);
      setIsUserOtpSent(false);
      setUserOtpInput('');
      setUserOtpError('');
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        email: '',
        role: 'staff',
        departmentId: departments[0]?.departmentId || '',
        jobTitle: '',
        password: 'User@2026!'
      });
      setIsUserEmailVerified(false);
      setIsUserOtpSent(false);
      setUserOtpInput('');
      setUserOtpError('');
    }
    setIsUserModalOpen(true);
  };

  const handleSendUserOtp = () => {
    const trimmedEmail = userFormData.email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      notify('error', 'Please enter a valid email address first.');
      return;
    }
    setIsSendingUserOtp(true);
    setUserOtpError('');
    try {
      const res = sendOtpToEmail(trimmedEmail);
      if (res.success) {
        setIsUserOtpSent(true);
        notify('success', `Verification OTP sent to ${trimmedEmail}.`);
      } else {
        notify('error', res.message);
      }
    } catch {
      notify('error', 'Failed to dispatch verification code.');
    } finally {
      setIsSendingUserOtp(false);
    }
  };

  const handleVerifyUserOtp = () => {
    if (!userOtpInput.trim()) {
      setUserOtpError('Please enter the 6-digit verification code.');
      return;
    }
    const result = verifyOtp(userFormData.email.trim(), userOtpInput.trim());
    if (result.success) {
      setIsUserEmailVerified(true);
      setUserOtpError('');
      notify('success', 'Email successfully verified with OTP code!');
    } else {
      setUserOtpError(result.message || 'Invalid or expired OTP code.');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      notify('error', 'Name and Email are required.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.userId, {
        name: userFormData.name.trim(),
        email: userFormData.email.trim().toLowerCase(),
        role: userFormData.role,
        departmentId: userFormData.departmentId,
        jobTitle: userFormData.jobTitle.trim(),
        ...(userFormData.password ? { password: userFormData.password } : {}),
        isEmailVerified: isUserEmailVerified
      });
      notify('success', `User ${userFormData.name} updated successfully.`);
    } else {
      createUser({
        name: userFormData.name.trim(),
        email: userFormData.email.trim().toLowerCase(),
        role: userFormData.role,
        departmentId: userFormData.departmentId,
        jobTitle: userFormData.jobTitle.trim(),
        password: userFormData.password || 'User@2026!',
        isDisabled: false,
        isEmailVerified: isUserEmailVerified
      });
      notify('success', `User ${userFormData.name} created successfully.`);
    }
    setIsUserModalOpen(false);
  };

  // --- Set Password Handlers ---
  const handleOpenSetPasswordModal = (user: User) => {
    setTargetUserForPassword(user);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowNewPassword(false);
    setIsSetPasswordModalOpen(true);
  };

  const handleSaveSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForPassword) return;

    if (!newPasswordInput || newPasswordInput.length < 6) {
      notify('error', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      notify('error', 'Passwords do not match.');
      return;
    }

    setUserPassword(targetUserForPassword.userId, newPasswordInput);
    notify('success', `Password successfully updated for ${targetUserForPassword.name}.`);
    setIsSetPasswordModalOpen(false);
  };

  // --- Toggle User Disabled Status ---
  const handleToggleUserDisabled = (user: User) => {
    if (currentUser.userId === user.userId) {
      notify('error', 'Cannot disable active session administrator account.');
      return;
    }
    const nextState = !user.isDisabled;
    setUserDisabled(user.userId, nextState);
    notify(
      nextState ? 'error' : 'success',
      `User account ${user.name} is now ${nextState ? 'Disabled (Access Denied)' : 'Active (Access Granted)'}.`
    );
  };

  // --- Roles Form State ---
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [] as string[],
    isSystem: false
  });

  const availablePermissions = [
    'MANAGE_MASTER_DATA',
    'MANAGE_PROJECTS',
    'MANAGE_MISSIONS',
    'EDIT_ALL_TASKS',
    'SUBMIT_DAILY_UPDATES',
    'APPROVE_EXCEPTIONS',
    'MANAGE_RISKS_AND_BLOCKERS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS'
  ];

  const handleOpenRoleModal = (role?: RoleDefinition) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        code: role.code,
        description: role.description,
        permissions: [...role.permissions],
        isSystem: role.isSystem
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        code: `ROL-${Math.floor(100 + Math.random() * 900)}`,
        description: '',
        permissions: ['SUBMIT_DAILY_UPDATES'],
        isSystem: false
      });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name.trim() || !roleFormData.code.trim()) {
      notify('error', 'Role Name and Code are required.');
      return;
    }
    if (editingRole) {
      updateRole(editingRole.roleId, roleFormData);
      notify('success', `Role ${roleFormData.name} updated successfully.`);
    } else {
      createRole(roleFormData);
      notify('success', `Role ${roleFormData.name} created successfully.`);
    }
    setIsRoleModalOpen(false);
  };

  // --- Role Assignment Form State ---
  const [assignmentFormData, setAssignmentFormData] = useState<{
    userId: string;
    roleId: string;
    scopeType: 'Global' | 'Project' | 'Department';
    scopeId?: string;
  }>({
    userId: users[0]?.userId || '',
    roleId: roles[0]?.roleId || '',
    scopeType: 'Global',
    scopeId: undefined
  });

  const handleOpenAssignmentModal = () => {
    setAssignmentFormData({
      userId: users[0]?.userId || '',
      roleId: roles[0]?.roleId || '',
      scopeType: 'Global',
      scopeId: undefined
    });
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    assignRole(assignmentFormData);
    notify('success', 'Role assigned successfully.');
    setIsAssignmentModalOpen(false);
  };

  // --- Project Form State ---
  const [projectFormData, setProjectFormData] = useState({
    code: '',
    name: '',
    description: '',
    departmentId: departments[0]?.departmentId || '',
    managerId: users.find(u => u.role === 'manager')?.userId || users[0]?.userId || '',
    status: 'Active' as Project['status'],
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 150000
  });

  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectFormData({
        code: project.code,
        name: project.name,
        description: project.description,
        departmentId: project.departmentId,
        managerId: project.managerId,
        status: project.status,
        startDate: project.startDate,
        targetEndDate: project.targetEndDate,
        budget: project.budget || 150000
      });
    } else {
      setEditingProject(null);
      setProjectFormData({
        code: `PRJ-SEC-${Math.floor(10 + Math.random() * 90)}`,
        name: '',
        description: '',
        departmentId: departments[0]?.departmentId || '',
        managerId: users.find(u => u.role === 'manager')?.userId || users[0]?.userId || '',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 120000
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.name.trim() || !projectFormData.code.trim()) {
      notify('error', 'Project Code and Name are required.');
      return;
    }
    if (editingProject) {
      updateProject(editingProject.projectId, projectFormData);
      notify('success', `Project ${projectFormData.name} updated successfully.`);
    } else {
      createProject(projectFormData);
      notify('success', `Project ${projectFormData.name} created successfully.`);
    }
    setIsProjectModalOpen(false);
  };

  // --- Mission Handlers ---
  const handleOpenMissionModal = (mission?: Mission) => {
    setEditingMission(mission || null);
    setIsMissionModalOpen(true);
  };

  // --- Department Form State ---
  const [deptFormData, setDeptFormData] = useState({
    code: '',
    name: '',
    managerId: users[0]?.userId || '',
    organizationId: organization.organizationId
  });

  const handleOpenDeptModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setDeptFormData({
        code: dept.code,
        name: dept.name,
        managerId: dept.managerId,
        organizationId: dept.organizationId
      });
    } else {
      setEditingDept(null);
      setDeptFormData({
        code: `DEP-GOV-${Math.floor(10 + Math.random() * 90)}`,
        name: '',
        managerId: users[0]?.userId || '',
        organizationId: organization.organizationId
      });
    }
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormData.name.trim() || !deptFormData.code.trim()) {
      notify('error', 'Department Code and Name are required.');
      return;
    }
    if (editingDept) {
      updateDepartment(editingDept.departmentId, deptFormData);
      notify('success', `Department ${deptFormData.name} updated successfully.`);
    } else {
      createDepartment(deptFormData);
      notify('success', `Department ${deptFormData.name} created successfully.`);
    }
    setIsDeptModalOpen(false);
  };

  // --- Delete Handler ---
  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    const { entity, id } = deleteConfirm;

    if (entity === 'user') {
      const res = deleteUser(id);
      if (!res.success) {
        notify('error', res.error || 'Failed to delete user.');
      } else {
        notify('success', 'User deleted successfully.');
      }
    } else if (entity === 'role') {
      const res = deleteRole(id);
      if (!res.success) {
        notify('error', res.error || 'Failed to delete role.');
      } else {
        notify('success', 'Role deleted successfully.');
      }
    } else if (entity === 'assignment') {
      revokeRoleAssignment(id);
      notify('success', 'Role assignment revoked.');
    } else if (entity === 'project') {
      const res = deleteProject(id);
      if (!res.success) {
        notify('error', res.error || 'Failed to delete project.');
      } else {
        notify('success', 'Project deleted successfully.');
      }
    } else if (entity === 'mission') {
      const res = deleteMission(id);
      if (!res.success) {
        notify('error', res.error || 'Failed to delete mission.');
      } else {
        notify('success', 'Mission deleted successfully.');
      }
    } else if (entity === 'department') {
      const res = deleteDepartment(id);
      if (!res.success) {
        notify('error', res.error || 'Failed to delete department.');
      } else {
        notify('success', 'Department deleted successfully.');
      }
    }

    setDeleteConfirm(null);
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = roles.filter(
    r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMissions = missions.filter(
    m =>
      m.missionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.missionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepartments = departments.filter(
    d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Master Data Administration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Centralized CRUD management for organizational entities: Users, RBAC Roles, Scope Assignments, Projects, Missions, and Departments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Permissions Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 block">Operator Persona</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
          {!canManageMasterData() && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs border border-amber-200 dark:border-amber-800/60 font-medium">
              <ShieldAlert className="w-4 h-4" />
              <span>Read-Only (Requires Admin/Manager role to write)</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'users'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{users.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Users</p>
          <p className="text-[10px] text-slate-400">Identity & Profiles</p>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'roles'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{roles.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Roles</p>
          <p className="text-[10px] text-slate-400">RBAC Definitions</p>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'assignments'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{roleAssignments.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Role Grants</p>
          <p className="text-[10px] text-slate-400">User Scopes</p>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'projects'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <FolderKanban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{projects.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Projects</p>
          <p className="text-[10px] text-slate-400">Portfolios</p>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'missions'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{missions.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Missions</p>
          <p className="text-[10px] text-slate-400">Deliverables</p>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'departments'
              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{departments.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Departments</p>
          <p className="text-[10px] text-slate-400">Business Units</p>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Roles ({roles.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'assignments'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Role Grants ({roleAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'missions'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Missions ({missions.length})
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Departments ({departments.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Create Button */}
            {canManageMasterData() && (
              <button
                onClick={() => {
                  if (activeTab === 'users') handleOpenUserModal();
                  else if (activeTab === 'roles') handleOpenRoleModal();
                  else if (activeTab === 'assignments') handleOpenAssignmentModal();
                  else if (activeTab === 'projects') handleOpenProjectModal();
                  else if (activeTab === 'missions') handleOpenMissionModal();
                  else if (activeTab === 'departments') handleOpenDeptModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'users' && 'Add User'}
                  {activeTab === 'roles' && 'Add Role'}
                  {activeTab === 'assignments' && 'Assign Role'}
                  {activeTab === 'projects' && 'Add Project'}
                  {activeTab === 'missions' && 'Create Mission'}
                  {activeTab === 'departments' && 'Add Department'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ================= TAB 1: USERS ================= */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredUsers.map(user => {
                  const dept = departments.find(d => d.departmentId === user.departmentId);
                  const isCurrent = currentUser.userId === user.userId;
                  return (
                    <tr
                      key={user.userId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        user.isDisabled ? 'opacity-65 bg-slate-50/50 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                              user.isDisabled ? 'bg-slate-400' : 'bg-blue-600'
                            }`}
                          >
                            {user.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold block flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded font-normal">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{user.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{user.email}</span>
                          {user.isEmailVerified && (
                            <span title="Email verified via OTP">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            user.role === 'admin'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : user.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : user.role === 'auditor'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">{dept?.name || user.departmentId}</td>
                      <td className="p-3">
                        {user.isDisabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <UserX className="w-3 h-3" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {canManageMasterData() && (
                          <div className="flex items-center justify-end gap-1">
                            {/* Set / Reset Password */}
                            <button
                              onClick={() => handleOpenSetPasswordModal(user)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              title="Set / Reset Password"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>

                            {/* Enable / Disable User */}
                            <button
                              onClick={() => handleToggleUserDisabled(user)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded transition-colors ${
                                isCurrent
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                  : user.isDisabled
                                  ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : 'hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              }`}
                              title={
                                isCurrent
                                  ? 'Cannot disable active session account'
                                  : user.isDisabled
                                  ? 'Enable User Account (Allow Login)'
                                  : 'Disable User Account (Block Login)'
                              }
                            >
                              {user.isDisabled ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Edit Profile */}
                            <button
                              onClick={() => handleOpenUserModal(user)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit User Profile"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  entity: 'user',
                                  id: user.userId,
                                  title: `User: ${user.name}`
                                })
                              }
                              disabled={isCurrent}
                              className={`p-1.5 rounded transition-colors ${
                                isCurrent
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
                              }`}
                              title={
                                isCurrent
                                  ? 'Cannot delete active session user'
                                  : 'Delete User'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 2: ROLES ================= */}
        {activeTab === 'roles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">Role Code / Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Permissions Matrix</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredRoles.map(role => (
                  <tr key={role.roleId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span>{role.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{role.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs">{role.description}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {role.permissions.map(perm => (
                          <span
                            key={perm}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      {role.isSystem ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          System Role
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                          Custom Role
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {canManageMasterData() && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRoleModal(role)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Role"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  entity: 'role',
                                  id: role.roleId,
                                  title: `Role: ${role.name}`
                                })
                              }
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: ROLE ASSIGNMENTS ================= */}
        {activeTab === 'assignments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">User</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Scope Type</th>
                  <th className="p-3">Scope Identifier</th>
                  <th className="p-3">Assigned At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {roleAssignments.map(asg => {
                  const targetUser = users.find(u => u.userId === asg.userId);
                  const targetRole = roles.find(r => r.roleId === asg.roleId);
                  return (
                    <tr key={asg.assignmentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <span>{targetUser?.name || asg.userId}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{targetUser?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                          {targetRole?.name || asg.roleId}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="capitalize font-medium">{asg.scopeType}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {asg.scopeId || 'Global (All Projects)'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{asg.assignedAt.slice(0, 10)}</td>
                      <td className="p-3 text-right">
                        {canManageMasterData() && (
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                entity: 'assignment',
                                id: asg.assignmentId,
                                title: `Assignment for ${targetUser?.name}`
                              })
                            }
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Revoke Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 4: PROJECTS ================= */}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">Project Code / Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Manager</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timeline</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredProjects.map(project => {
                  const dept = departments.find(d => d.departmentId === project.departmentId);
                  const mgr = users.find(u => u.userId === project.managerId);
                  return (
                    <tr key={project.projectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <span>{project.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{project.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{dept?.name || project.departmentId}</td>
                      <td className="p-3">{mgr?.name || project.managerId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                          {project.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-mono text-slate-500">
                        {project.startDate} → {project.targetEndDate}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ${project.budget ? project.budget.toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        {canManageMasterData() && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenProjectModal(project)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Edit Project"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  entity: 'project',
                                  id: project.projectId,
                                  title: `Project: ${project.name}`
                                })
                              }
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 5: MISSIONS (First-Class CRUD) ================= */}
        {activeTab === 'missions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">Mission Code / Name</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Mission Owner</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Health</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Effort</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredMissions.map(m => {
                  const prj = projects.find(p => p.projectId === m.projectId);
                  const owner = users.find(u => u.userId === m.missionOwnerId);
                  return (
                    <tr key={m.missionId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-semibold block">{m.missionName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {m.missionCode} {m.isArchived ? '(Archived)' : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{prj?.name || m.projectId}</td>
                      <td className="p-3">{owner?.name || m.missionOwnerId}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            m.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : m.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {m.priority}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{m.status}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.healthStatus === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : m.healthStatus === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : m.healthStatus === 'At Risk'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {m.healthStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold tabular-nums">
                        {m.progressPercentage}%
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {m.actualHours}h / {m.estimatedHours}h
                      </td>
                      <td className="p-3 text-right">
                        {canManageMasterData() && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenMissionModal(m)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Edit Mission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  entity: 'mission',
                                  id: m.missionId,
                                  title: `Mission: ${m.missionCode} (${m.missionName})`
                                })
                              }
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Mission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 6: DEPARTMENTS ================= */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-3">Department Code / Name</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Department Head</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredDepartments.map(dept => {
                  const mgr = users.find(u => u.userId === dept.managerId);
                  return (
                    <tr key={dept.departmentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <span>{dept.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{dept.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-sm">
                        {organization.name} ({organization.code})
                      </td>
                      <td className="p-3">{mgr?.name || dept.managerId}</td>
                      <td className="p-3 text-right">
                        {canManageMasterData() && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDeptModal(dept)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Edit Department"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  entity: 'department',
                                  id: dept.departmentId,
                                  title: `Department: ${dept.name}`
                                })
                              }
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= USER MODAL ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Edit User Profile' : 'Add New User'}
              </h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email with OTP Verification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold">Email Address</label>
                  {isUserEmailVerified ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Email Verified via OTP
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendUserOtp}
                      disabled={isSendingUserOtp || !userFormData.email.trim()}
                      className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold underline disabled:opacity-50"
                    >
                      {isSendingUserOtp ? 'Sending OTP...' : isUserOtpSent ? 'Resend OTP' : 'Validate with OTP'}
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={e => {
                    setUserFormData({ ...userFormData, email: e.target.value });
                    if (isUserEmailVerified) setIsUserEmailVerified(false);
                  }}
                  placeholder="e.g. user@enterprise.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Inline OTP Validation Box */}
              {isUserOtpSent && !isUserEmailVerified && (
                <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300">
                      Enter 6-Digit Email OTP
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">
                      Simulated in top banner
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={userOtpInput}
                      onChange={e => setUserOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-32 px-3 py-1.5 rounded-md border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-center font-mono text-xs tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyUserOtp}
                      className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                  {userOtpError && (
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                      {userOtpError}
                    </p>
                  )}
                </div>
              )}

              {/* Password Setting for New or Existing User */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {editingUser ? 'Reset Password (optional)' : 'Initial Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={userFormData.password}
                    onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">System Role</label>
                  <select
                    value={userFormData.role}
                    onChange={e => setUserFormData({ ...userFormData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="staff">Staff (Operational)</option>
                    <option value="manager">Manager (Approvals)</option>
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="auditor">Auditor (Compliance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={userFormData.departmentId}
                    onChange={e => setUserFormData({ ...userFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  value={userFormData.jobTitle}
                  onChange={e => setUserFormData({ ...userFormData, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Infrastructure Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SET PASSWORD MODAL ================= */}
      {isSetPasswordModalOpen && targetUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Set User Password
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {targetUserForPassword.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSetPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSetPassword} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Confirm Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ROLE MODAL ================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingRole ? 'Edit Role Definition' : 'Define New Role'}
              </h2>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name}
                    onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    placeholder="e.g. Release Manager"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role Code</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.code}
                    onChange={e => setRoleFormData({ ...roleFormData, code: e.target.value })}
                    placeholder="e.g. REL_MGR"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={roleFormData.description}
                  onChange={e => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="Describe duties and governance bounds"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-2">
                  Assigned Permission Tokens
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  {availablePermissions.map(perm => {
                    const checked = roleFormData.permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: [...roleFormData.permissions, perm]
                              });
                            } else {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: roleFormData.permissions.filter(p => p !== perm)
                              });
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ROLE ASSIGNMENT MODAL ================= */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Assign Role to User</h2>
              <button
                onClick={() => setIsAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target User</label>
                <select
                  value={assignmentFormData.userId}
                  onChange={e => setAssignmentFormData({ ...assignmentFormData, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role Definition</label>
                <select
                  value={assignmentFormData.roleId}
                  onChange={e => setAssignmentFormData({ ...assignmentFormData, roleId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {roles.map(r => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Scope Type</label>
                <select
                  value={assignmentFormData.scopeType}
                  onChange={e =>
                    setAssignmentFormData({
                      ...assignmentFormData,
                      scopeType: e.target.value as 'Global' | 'Project' | 'Department'
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Global">Global (All Projects & Departments)</option>
                  <option value="Project">Project-Specific Scope</option>
                  <option value="Department">Department-Specific Scope</option>
                </select>
              </div>

              {assignmentFormData.scopeType === 'Project' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Project</label>
                  <select
                    value={assignmentFormData.scopeId || ''}
                    onChange={e => setAssignmentFormData({ ...assignmentFormData, scopeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Choose Project...</option>
                    {projects.map(p => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignmentFormData.scopeType === 'Department' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Department</label>
                  <select
                    value={assignmentFormData.scopeId || ''}
                    onChange={e => setAssignmentFormData({ ...assignmentFormData, scopeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Choose Department...</option>
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROJECT MODAL ================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingProject ? 'Edit Project Master' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.code}
                    onChange={e => setProjectFormData({ ...projectFormData, code: e.target.value })}
                    placeholder="e.g. PRJ-SEC-01"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.name}
                    onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    placeholder="e.g. Zero-Trust Security Architecture"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={projectFormData.description}
                  onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  placeholder="Strategic scope and objectives"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={projectFormData.departmentId}
                    onChange={e => setProjectFormData({ ...projectFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Project Manager</label>
                  <select
                    value={projectFormData.managerId}
                    onChange={e => setProjectFormData({ ...projectFormData, managerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value as Project['status'] })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectFormData.startDate}
                    onChange={e => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={projectFormData.targetEndDate}
                    onChange={e => setProjectFormData({ ...projectFormData, targetEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Budget Allocation ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={projectFormData.budget}
                  onChange={e => setProjectFormData({ ...projectFormData, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DEPARTMENT MODAL ================= */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Dept Code</label>
                  <input
                    type="text"
                    required
                    value={deptFormData.code}
                    onChange={e => setDeptFormData({ ...deptFormData, code: e.target.value })}
                    placeholder="e.g. DEP-SEC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Dept Name</label>
                  <input
                    type="text"
                    required
                    value={deptFormData.name}
                    onChange={e => setDeptFormData({ ...deptFormData, name: e.target.value })}
                    placeholder="e.g. Information Security"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Department Head</label>
                <select
                  value={deptFormData.managerId}
                  onChange={e => setDeptFormData({ ...deptFormData, managerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MISSION MODAL (CRUD) ================= */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        missionToEdit={editingMission}
      />

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{deleteConfirm.title}</strong>? This action will be recorded in the enterprise audit log.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
