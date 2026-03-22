import type { RawSkillEntry } from '../lib/types.js';

/**
 * Normalize a raw entry to ensure required fields are present.
 */
export function normalizeEntry(raw: RawSkillEntry): RawSkillEntry {
  return {
    name: raw.name.trim(),
    sourceUrl: raw.sourceUrl.trim(),
    sourceType: raw.sourceType,
    description: raw.description?.trim() || undefined,
    githubUrl: raw.githubUrl?.trim() || null,
    iconUrl: raw.iconUrl?.trim() || null,
    tags: raw.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    metadata: raw.metadata,
  };
}

/**
 * Extract a slug from a name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
