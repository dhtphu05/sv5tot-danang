import {
  CollectiveApplication,
  AUTHORIZED_COLLECTIVE_REGISTRY,
  StructuredMemberRecord,
} from "../collectiveTypes";
import { SchoolReviewUnitId } from "../schoolReviewTypes";
import {
  INITIAL_DEMO_COLLECTIVE_APPLICATION,
  DEMO_ASSIGNED_COLLECTIVE_APPLICATION,
  DEMO_COMPLETED_COLLECTIVE_APPLICATION,
  DEMO_PUBLISHED_COLLECTIVE_APPLICATION,
} from "./collectiveFixtures";
import { isBackendMode } from "../../shared/config/executionMode";

const LOCAL_STORAGE_KEY = '5tot_collective_applications_store';

export function isUserAuthorizedForCollective(
  userEmail: string,
  collectiveId?: string
): boolean {
  if (!userEmail) return false;
  const norm = userEmail.trim().toLowerCase();
  // Ordinary student check
  if (norm.includes('student') || norm.startsWith('minhanh.nguyen') || norm.includes('@sv.')) {
    return false;
  }
  // Authorized collective preparer check
  if (
    norm === 'mai.nt@dut.udn.vn' ||
    norm === 'linh.pt@due.udn.vn' ||
    norm === 'khoa.nd@duytan.edu.vn' ||
    norm.includes('collective') ||
    norm.includes('chihoi') ||
    norm.includes('lch')
  ) {
    return true;
  }
  // Check authorized registry
  const match = AUTHORIZED_COLLECTIVE_REGISTRY.some(
    (c) =>
      c.authorizedPreparerEmail.toLowerCase() === norm &&
      (!collectiveId || c.id === collectiveId)
  );
  return match;
}

export type StoreListener = () => void;
const listeners = new Set<StoreListener>();

export function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToCollectiveStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function loadApplicationsFromStorage(): CollectiveApplication[] {
  const defaultList = [
    INITIAL_DEMO_COLLECTIVE_APPLICATION,
    DEMO_ASSIGNED_COLLECTIVE_APPLICATION,
    DEMO_COMPLETED_COLLECTIVE_APPLICATION,
    DEMO_PUBLISHED_COLLECTIVE_APPLICATION,
  ];
  if (typeof window === 'undefined') {
    return isBackendMode() ? [] : defaultList;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      if (isBackendMode()) return [];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultList));
      return defaultList;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      if (isBackendMode()) return [];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultList));
      return defaultList;
    }
    if (isBackendMode()) {
      return parsed;
    }
    // Ensure all 4 canonical demo apps are present in DEMO mode if not found
    const merged = [...parsed];
    for (const demoApp of defaultList) {
      if (!merged.some((p: any) => p.id === demoApp.id)) {
        merged.push(demoApp);
      }
    }
    return merged;
  } catch (err) {
    console.warn('Failed to parse collective applications from storage, using initial:', err);
    return isBackendMode() ? [] : defaultList;
  }
}

export function saveApplicationsToStorage(apps: CollectiveApplication[]): void {
  if (typeof window === 'undefined') {
    notifyListeners();
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
    notifyListeners();
  } catch (err) {
    console.error('Failed to save collective applications to storage:', err);
  }
}

// In-memory cache
let cachedApps: CollectiveApplication[] | null = null;

export function hydrateCollectiveStore(apps: CollectiveApplication[]): void {
  cachedApps = [...apps];
  saveApplicationsToStorage(cachedApps);
}

export function getStoreApps(): CollectiveApplication[] {
  if (!cachedApps) {
    cachedApps = loadApplicationsFromStorage();
  }
  return cachedApps;
}

export function getAllCollectiveApplications(): CollectiveApplication[] {
  return [...getStoreApps()];
}

export function getCollectiveApplicationById(id: string): CollectiveApplication | undefined {
  return getStoreApps().find((a) => a.id === id);
}

export function getCollectiveApplicationsForPreparer(userEmail: string): CollectiveApplication[] {
  return getStoreApps().filter(
    (a) => a.preparedByUserEmail.toLowerCase() === userEmail.toLowerCase()
  );
}

export function getCollectiveApplicationsForSchoolReviewUnit(
  unitId: SchoolReviewUnitId
): CollectiveApplication[] {
  return getStoreApps().filter((a) => a.schoolReviewUnitId === unitId);
}

export function saveCollectiveApplication(app: CollectiveApplication): void {
  const current = getStoreApps();
  const index = current.findIndex((a) => a.id === app.id);
  let next: CollectiveApplication[];
  if (index >= 0) {
    next = [...current];
    next[index] = { ...app, updatedAt: new Date().toISOString() };
  } else {
    next = [app, ...current];
  }
  cachedApps = next;
  saveApplicationsToStorage(next);
}

export function resetCollectiveStore(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    sessionStorage.removeItem("5tot_collective_evidence_vault");
  } catch {
    // Ignore in SSR
  }
  cachedApps = null;
  notifyListeners();
}
