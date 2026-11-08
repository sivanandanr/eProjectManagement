import {
  Department,
  Mission,
  Organization,
  Project,
  User,
  RoleDefinition,
  RoleAssignment,
  AuditLog
} from '../types';

/**
 * Enterprise Master Data Seeds
 * Foundational entities: Organization, Departments, Projects, Missions, Roles, Users, Role Assignments.
 * Pure master data seeds without mock operational records (tasks, daily updates, fake logs).
 */

export const seedOrganization: Organization = {
  organizationId: 'ORG-CORP-01',
  name: 'Apex Global Financial Technologies',
  code: 'AGFT'
};

export const seedDepartments: Department[] = [
  {
    departmentId: 'DEP-IT-01',
    organizationId: 'ORG-CORP-01',
    name: 'IT Infrastructure & Operations',
    code: 'INFRA',
    managerId: 'USR-002'
  },
  {
    departmentId: 'DEP-APP-01',
    organizationId: 'ORG-CORP-01',
    name: 'Core Application Engineering',
    code: 'APP-ENG',
    managerId: 'USR-002'
  },
  {
    departmentId: 'DEP-SEC-01',
    organizationId: 'ORG-CORP-01',
    name: 'Information Security & Compliance',
    code: 'INFOSEC',
    managerId: 'USR-001'
  }
];

export const seedProjects: Project[] = [
  {
    projectId: 'PRJ-INFRA-01',
    departmentId: 'DEP-IT-01',
    name: 'Infrastructure Modernization',
    code: 'INF-MOD',
    description: 'Enterprise data center server operating system lifecycle upgrade, consolidation, and security hardening.',
    managerId: 'USR-002',
    status: 'Active',
    startDate: '2026-10-01',
    targetEndDate: '2026-12-31',
    budget: 450000
  },
  {
    projectId: 'PRJ-CLOUD-02',
    departmentId: 'DEP-IT-01',
    name: 'Cloud Resilience & Database Modernization',
    code: 'CLD-RES',
    description: 'Transition of legacy core transaction clusters to managed high-availability SQL and distributed cache engines.',
    managerId: 'USR-002',
    status: 'Active',
    startDate: '2026-09-15',
    targetEndDate: '2027-02-28',
    budget: 680000
  }
];

export const seedMissions: Mission[] = [
  {
    missionId: 'MSN-WIN-01',
    missionCode: 'MSN-WIN-01',
    projectId: 'PRJ-INFRA-01',
    missionName: 'Windows OS In-Place Upgrade - Development Servers',
    description: 'Execute staged in-place Windows Server upgrades across 48 non-production nodes with full validation.',
    missionOwnerId: 'USR-002',
    departmentId: 'DEP-IT-01',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-10-15',
    plannedEndDate: '2026-11-20',
    estimatedHours: 160,
    actualHours: 0,
    progressPercentage: 0,
    healthStatus: 'On Track',
    createdAt: '2026-10-10T08:00:00Z',
    createdBy: 'USR-002',
    updatedAt: '2026-10-10T08:00:00Z',
    updatedBy: 'USR-002',
    rowVersion: 1,
    isArchived: false
  },
  {
    missionId: 'MSN-PROD-02',
    missionCode: 'MSN-PROD-02',
    projectId: 'PRJ-INFRA-01',
    missionName: 'Windows OS Production Staging & DR Switchover',
    description: 'Preparation of disaster recovery warm standby nodes and change approval board gating for production ring 1.',
    missionOwnerId: 'USR-002',
    departmentId: 'DEP-IT-01',
    priority: 'Critical',
    status: 'In Progress',
    startDate: '2026-11-01',
    plannedEndDate: '2026-12-15',
    estimatedHours: 220,
    actualHours: 0,
    progressPercentage: 0,
    healthStatus: 'On Track',
    createdAt: '2026-10-20T09:00:00Z',
    createdBy: 'USR-002',
    updatedAt: '2026-10-20T09:00:00Z',
    updatedBy: 'USR-002',
    rowVersion: 1,
    isArchived: false
  },
  {
    missionId: 'MSN-DB-03',
    missionCode: 'MSN-DB-03',
    projectId: 'PRJ-CLOUD-02',
    missionName: 'Database High-Availability Clustering & Schema Sync',
    description: 'Provisioning multi-subnet failover clusters and running regression benchmarks on analytical workloads.',
    missionOwnerId: 'USR-002',
    departmentId: 'DEP-IT-01',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-10-01',
    plannedEndDate: '2026-11-30',
    estimatedHours: 190,
    actualHours: 0,
    progressPercentage: 0,
    healthStatus: 'On Track',
    createdAt: '2026-09-25T11:00:00Z',
    createdBy: 'USR-002',
    updatedAt: '2026-09-25T11:00:00Z',
    updatedBy: 'USR-002',
    rowVersion: 1,
    isArchived: false
  }
];

export const seedUsers: User[] = [
  {
    userId: 'USR-001',
    name: 'Sarah Lin',
    email: 'sarah.lin@apexcorp.internal',
    role: 'admin',
    departmentId: 'DEP-IT-01',
    jobTitle: 'Chief Information Officer & Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    password: 'Enterprise@2026',
    isDisabled: false,
    isEmailVerified: true,
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    userId: 'USR-002',
    name: 'David Ross',
    email: 'david.ross@apexcorp.internal',
    role: 'manager',
    departmentId: 'DEP-IT-01',
    jobTitle: 'Infrastructure Operations Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    password: 'Enterprise@2026',
    isDisabled: false,
    isEmailVerified: true,
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    userId: 'USR-003',
    name: 'Alex Chen',
    email: 'alex.chen@apexcorp.internal',
    role: 'staff',
    departmentId: 'DEP-IT-01',
    jobTitle: 'Senior Systems Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'Enterprise@2026',
    isDisabled: false,
    isEmailVerified: true,
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    userId: 'USR-004',
    name: 'Maria Garcia',
    email: 'maria.garcia@apexcorp.internal',
    role: 'staff',
    departmentId: 'DEP-IT-01',
    jobTitle: 'Cloud Infrastructure Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    password: 'Enterprise@2026',
    isDisabled: false,
    isEmailVerified: true,
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    userId: 'USR-005',
    name: 'James Wilson',
    email: 'james.wilson@apexcorp.internal',
    role: 'staff',
    departmentId: 'DEP-SEC-01',
    jobTitle: 'Cybersecurity & Compliance Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    password: 'Enterprise@2026',
    isDisabled: false,
    isEmailVerified: true,
    createdAt: '2026-10-01T08:00:00Z'
  }
];

export const seedRoles: RoleDefinition[] = [
  {
    roleId: 'ROL-001',
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Organization-wide access, user and department administration, exception overrides',
    isSystem: true,
    permissions: [
      'MANAGE_USERS',
      'MANAGE_ROLES',
      'MANAGE_PROJECTS',
      'MANAGE_DEPARTMENTS',
      'MANAGE_MISSIONS',
      'APPROVE_EXCEPTIONS',
      'LOG_DAILY_ACTIVITIES',
      'EXPORT_REPORTS',
      'RECALCULATE_PROGRESS'
    ]
  },
  {
    roleId: 'ROL-002',
    name: 'Project Manager',
    code: 'MGR',
    description: 'Project & mission ownership, task assignment, progress exception authorization',
    isSystem: true,
    permissions: [
      'MANAGE_MISSIONS',
      'ASSIGN_TASKS',
      'APPROVE_EXCEPTIONS',
      'LOG_DAILY_ACTIVITIES',
      'EXPORT_REPORTS',
      'RECALCULATE_PROGRESS'
    ]
  },
  {
    roleId: 'ROL-003',
    name: 'Staff Engineer',
    code: 'STAFF',
    description: 'Assigned task execution, daily updates submission, next actions, blockers',
    isSystem: true,
    permissions: [
      'LOG_DAILY_ACTIVITIES',
      'RAISE_BLOCKERS',
      'CREATE_NEXT_ACTIONS',
      'EXPORT_REPORTS'
    ]
  },
  {
    roleId: 'ROL-004',
    name: 'Security & Compliance Auditor',
    code: 'AUDITOR',
    description: 'Read-only audit trail verification, compliance gating, risk registry access',
    isSystem: false,
    permissions: [
      'VIEW_AUDIT_LOGS',
      'VIEW_RISKS',
      'EXPORT_REPORTS'
    ]
  }
];

export const seedRoleAssignments: RoleAssignment[] = [
  {
    assignmentId: 'ASN-001',
    userId: 'USR-001',
    roleId: 'ROL-001',
    scopeType: 'Global',
    assignedAt: '2026-10-01T08:00:00Z',
    assignedBy: 'USR-001'
  },
  {
    assignmentId: 'ASN-002',
    userId: 'USR-002',
    roleId: 'ROL-002',
    scopeType: 'Department',
    scopeId: 'DEP-IT-01',
    assignedAt: '2026-10-01T08:00:00Z',
    assignedBy: 'USR-001'
  },
  {
    assignmentId: 'ASN-003',
    userId: 'USR-003',
    roleId: 'ROL-003',
    scopeType: 'Project',
    scopeId: 'PRJ-INFRA-01',
    assignedAt: '2026-10-01T08:00:00Z',
    assignedBy: 'USR-002'
  },
  {
    assignmentId: 'ASN-004',
    userId: 'USR-004',
    roleId: 'ROL-003',
    scopeType: 'Project',
    scopeId: 'PRJ-CLOUD-02',
    assignedAt: '2026-10-01T08:00:00Z',
    assignedBy: 'USR-002'
  },
  {
    assignmentId: 'ASN-005',
    userId: 'USR-005',
    roleId: 'ROL-004',
    scopeType: 'Department',
    scopeId: 'DEP-SEC-01',
    assignedAt: '2026-10-01T08:00:00Z',
    assignedBy: 'USR-001'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    auditId: 'LOG-INIT-001',
    entityType: 'Project',
    entityId: 'PRJ-INFRA-01',
    action: 'CREATE',
    changedBy: 'USR-001',
    changedAt: '2026-10-01T08:00:00Z',
    details: 'Enterprise master data seeds provisioned: Organization, Departments, Roles, Users, Role Assignments, Projects, and Missions.'
  }
];
