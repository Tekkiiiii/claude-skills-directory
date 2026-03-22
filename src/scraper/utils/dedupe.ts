import type { RawSkillEntry } from '../lib/types.js';

/**
 * Deduplicate entries by sourceUrl.
 * Later entries override earlier ones.
 */
export function dedupeByUrl(entries: RawSkillEntry[]): RawSkillEntry[] {
  const seen = new Map<string, RawSkillEntry>();
  for (const entry of entries) {
    seen.set(entry.sourceUrl, entry);
  }
  return Array.from(seen.values());
}
