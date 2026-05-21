/**
 * Render history — stores past scene renders with screenshots in localStorage.
 *
 * Each entry captures the full SceneSchema + a PNG screenshot data URL,
 * so the user can navigate back to any previous render.
 */

import type { SceneSchema } from '../types/scene.ts';

const STORAGE_KEY = 'text-to-3d-history';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  schema: Partial<SceneSchema>;
  screenshotDataUrl: string;
  description: string;
}

/** Generate a unique entry id. */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/** Read all entries from localStorage, newest first. */
function readAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

/** Write entries to localStorage, handling quota errors. */
function writeAll(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    console.warn('History localStorage quota exceeded, clearing oldest entries');
    // Remove the oldest half and retry
    const trimmed = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Last resort: clear entirely
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Save a new render to history.
 * Automatically generates id and timestamp. Oldest entries are pruned when
 * the total exceeds MAX_ENTRIES.
 */
export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  if (typeof entry.screenshotDataUrl !== 'string' || !entry.screenshotDataUrl.startsWith('data:image/')) {
    console.warn('saveToHistory: invalid screenshotDataUrl, skipping');
    return;
  }

  const newEntry: HistoryEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };

  const all = readAll();
  all.unshift(newEntry);

  // Prune oldest entries beyond the limit
  if (all.length > MAX_ENTRIES) {
    all.length = MAX_ENTRIES;
  }

  writeAll(all);
}

/** Return all history entries, newest first. */
export function getHistory(): HistoryEntry[] {
  return readAll();
}

/** Delete a single entry by id. */
export function deleteFromHistory(id: string): void {
  const all = readAll().filter((e) => e.id !== id);
  writeAll(all);
}

/** Remove all history entries. */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
