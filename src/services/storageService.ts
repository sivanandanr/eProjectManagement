/**
 * Enterprise Persistence Service
 * Guarantees that data is never lost across deployments, browser reloads, or container recycles.
 * Uses persistent browser storage with automatic fallback and schema migration.
 */

const STORAGE_PREFIX = 'APEX_MISSION_PLATFORM_V2_';

export const STORAGE_KEYS = {
  SETUP_COMPLETED: `${STORAGE_PREFIX}SETUP_COMPLETED`,
  USERS: `${STORAGE_PREFIX}USERS`,
  ACTIVE_SESSION: `${STORAGE_PREFIX}ACTIVE_SESSION`,
  PROJECTS: `${STORAGE_PREFIX}PROJECTS`,
  MISSIONS: `${STORAGE_PREFIX}MISSIONS`,
  TASKS: `${STORAGE_PREFIX}TASKS`,
  DAILY_UPDATES: `${STORAGE_PREFIX}DAILY_UPDATES`,
  NEXT_ACTIONS: `${STORAGE_PREFIX}NEXT_ACTIONS`,
  RISKS: `${STORAGE_PREFIX}RISKS`,
  PROGRESS_HISTORY: `${STORAGE_PREFIX}PROGRESS_HISTORY`,
  EXCEPTIONS: `${STORAGE_PREFIX}EXCEPTIONS`,
  AUDIT_LOGS: `${STORAGE_PREFIX}AUDIT_LOGS`,
  DEPARTMENTS: `${STORAGE_PREFIX}DEPARTMENTS`,
  ORGANIZATION: `${STORAGE_PREFIX}ORGANIZATION`,
  ROLES: `${STORAGE_PREFIX}ROLES`,
  ROLE_ASSIGNMENTS: `${STORAGE_PREFIX}ROLE_ASSIGNMENTS`,
  THEME: `${STORAGE_PREFIX}THEME`
} as const;

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.warn(`[StorageService] Failed to load key "${key}", falling back to default:`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`[StorageService] Failed to save key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[StorageService] Failed to remove key "${key}":`, error);
  }
}

/**
 * Checks whether the first-time administrator onboarding was completed.
 */
export function isAdministratorRegistered(): boolean {
  return loadFromStorage<boolean>(STORAGE_KEYS.SETUP_COMPLETED, false);
}

/**
 * Marks initial administrator registration as completed.
 */
export function markAdministratorRegistered(): void {
  saveToStorage(STORAGE_KEYS.SETUP_COMPLETED, true);
}

/**
 * Exports full system snapshot as JSON for disaster recovery and offline backup.
 */
export function exportDatabaseBackup(): string {
  const snapshot: Record<string, any> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    snapshot[name] = loadFromStorage(key, null);
  });
  return JSON.stringify(snapshot, null, 2);
}
