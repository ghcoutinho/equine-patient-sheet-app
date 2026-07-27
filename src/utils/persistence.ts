import { useCallback, useEffect, useState } from 'react';
import type { Patient } from '../types';

/**
 * Local persistence.
 *
 * Everything the clinician enters previously lived in useState and was lost on
 * refresh, which for a barn-side tool meant a whole round's charting could
 * vanish. Patients, rounds and the archive are now written to localStorage on
 * every change and rehydrated on load.
 *
 * Writes are wrapped because localStorage throws in private-browsing modes and
 * when the quota is exceeded; a failed write must not take the app down
 * mid-round.
 */

const KEY_PATIENTS = 'eps.patients.v1';
const KEY_CLINICIAN = 'eps.clinician.v1';
const KEY_SCHEMA = 'eps.schema.v1';
const SCHEMA_VERSION = '1';

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadPatients(fallback: Patient[]): Patient[] {
  const stored = readJson<Patient[]>(KEY_PATIENTS);
  const version = (() => {
    try {
      return localStorage.getItem(KEY_SCHEMA);
    } catch {
      return null;
    }
  })();

  if (!stored || !Array.isArray(stored) || version !== SCHEMA_VERSION) {
    return fallback;
  }
  return stored;
}

export function savePatients(patients: Patient[]): boolean {
  try {
    localStorage.setItem(KEY_SCHEMA, SCHEMA_VERSION);
  } catch {
    /* ignore */
  }
  return writeJson(KEY_PATIENTS, patients);
}

export function loadClinician(): string {
  try {
    return localStorage.getItem(KEY_CLINICIAN) || '';
  } catch {
    return '';
  }
}

export function saveClinician(name: string): void {
  try {
    localStorage.setItem(KEY_CLINICIAN, name);
  } catch {
    /* ignore */
  }
}

/**
 * Who is charting. Recorded against every round so an entry is attributable,
 * replacing the hardcoded "Current User" the flowsheet used to stamp.
 */
export function useClinician(): [string, (name: string) => void] {
  const [clinician, setClinicianState] = useState<string>(() => loadClinician());
  const setClinician = useCallback((name: string) => {
    setClinicianState(name);
    saveClinician(name);
  }, []);
  return [clinician, setClinician];
}

/** Patients, persisted. Returns a flag when a write fails so the UI can say so. */
export function usePersistentPatients(
  initial: Patient[],
): [Patient[], React.Dispatch<React.SetStateAction<Patient[]>>, boolean] {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatients(initial));
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!savePatients(patients));
  }, [patients]);

  return [patients, setPatients, saveFailed];
}

/** Wipe stored data. Used by the "reset to sample data" action. */
export function clearStoredPatients(): void {
  try {
    localStorage.removeItem(KEY_PATIENTS);
    localStorage.removeItem(KEY_SCHEMA);
  } catch {
    /* ignore */
  }
}
