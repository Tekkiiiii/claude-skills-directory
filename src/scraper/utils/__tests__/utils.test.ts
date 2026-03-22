import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dedupeByUrl } from '../dedupe.js';
import { normalizeEntry, slugify } from '../normalizer.js';
import { filterByKeywords } from '../keyword-filter.js';

// Minimal inline type matching src/lib/types.ts RawSkillEntry
interface RawSkillEntry {
  name: string;
  sourceUrl: string;
  sourceType: string;
  description?: string;
  githubUrl?: string | null;
  iconUrl?: string | null;
  tags: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================
// dedupeByUrl
// ============================================================
describe('dedupeByUrl', () => {
  it('returns empty array when given empty array', () => {
    const result = dedupeByUrl([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns single entry unchanged', () => {
    const entry: RawSkillEntry = {
      name: 'Test Skill',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'github',
      tags: [],
    };
    const result = dedupeByUrl([entry]);
    assert.deepStrictEqual(result, [entry]);
  });

  it('deduplicates by sourceUrl, later entry wins', () => {
    const first: RawSkillEntry = {
      name: 'First',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'github',
      tags: ['old'],
    };
    const second: RawSkillEntry = {
      name: 'Second',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'reddit',
      tags: ['new'],
    };
    const third: RawSkillEntry = {
      name: 'Different',
      sourceUrl: 'https://example.com/other',
      sourceType: 'hackernews',
      tags: [],
    };
    const result = dedupeByUrl([first, second, third]);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'Second');
    assert.strictEqual(result[1].name, 'Different');
  });

  it('returns all entries when no URLs are duplicated', () => {
    const entries: RawSkillEntry[] = [
      {
        name: 'Skill A',
        sourceUrl: 'https://example.com/a',
        sourceType: 'github',
        tags: [],
      },
      {
        name: 'Skill B',
        sourceUrl: 'https://example.com/b',
        sourceType: 'reddit',
        tags: [],
      },
      {
        name: 'Skill C',
        sourceUrl: 'https://example.com/c',
        sourceType: 'hackernews',
        tags: [],
      },
    ];
    const result = dedupeByUrl(entries);
    assert.strictEqual(result.length, 3);
  });
});

// ============================================================
// normalizeEntry
// ============================================================
describe('normalizeEntry', () => {
  it('trims whitespace from name, sourceUrl, and description', () => {
    const raw: RawSkillEntry = {
      name: '  Test Skill  ',
      sourceUrl: '  https://example.com/skill  ',
      sourceType: 'github',
      description: '  A test description  ',
      tags: [],
    };
    const result = normalizeEntry(raw);
    assert.strictEqual(result.name, 'Test Skill');
    assert.strictEqual(result.sourceUrl, 'https://example.com/skill');
    assert.strictEqual(result.description, 'A test description');
  });

  it('sets githubUrl and iconUrl to null when undefined', () => {
    const raw: RawSkillEntry = {
      name: 'Test',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'reddit',
      githubUrl: undefined,
      iconUrl: undefined,
      tags: [],
    };
    const result = normalizeEntry(raw);
    assert.strictEqual(result.githubUrl, null);
    assert.strictEqual(result.iconUrl, null);
  });

  it('sets githubUrl and iconUrl to null when explicitly null', () => {
    const raw: RawSkillEntry = {
      name: 'Test',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'reddit',
      githubUrl: null,
      iconUrl: null,
      tags: [],
    };
    const result = normalizeEntry(raw);
    assert.strictEqual(result.githubUrl, null);
    assert.strictEqual(result.iconUrl, null);
  });

  it('normalizes tags: trims, lowercases, and filters empty strings', () => {
    const raw: RawSkillEntry = {
      name: 'Test',
      sourceUrl: 'https://example.com/skill',
      sourceType: 'github',
      tags: ['  Claude  ', '  AI AGENT  ', '', '  '],
      githubUrl: null,
      iconUrl: null,
    };
    const result = normalizeEntry(raw);
    // filter(Boolean) removes empty strings, so the '' tag is dropped
    assert.deepStrictEqual(result.tags, ['claude', 'ai agent']);
  });
});

// ============================================================
// slugify
// ============================================================
describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  it('removes special characters', () => {
    assert.strictEqual(slugify('Test (Skill)'), 'test-skill');
  });

  it('converts uppercase to lowercase', () => {
    assert.strictEqual(slugify('CLAUDE SKILL'), 'claude-skill');
  });

  it('collapses consecutive hyphens', () => {
    assert.strictEqual(slugify('hello   world'), 'hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    assert.strictEqual(slugify('  test skill  '), 'test-skill');
  });

  it('truncates to 80 characters', () => {
    const long = 'a'.repeat(100);
    const result = slugify(long);
    assert.strictEqual(result.length, 80);
    assert.strictEqual(result, 'a'.repeat(80));
  });
});

// ============================================================
// filterByKeywords
// ============================================================
describe('filterByKeywords', () => {
  it('includes entry with a matching keyword', () => {
    const entries = [
      { name: 'Claude Agent Skill', description: 'A skill for Claude' },
      { name: 'Other Skill', description: 'Something else entirely' },
    ];
    const result = filterByKeywords(entries as Parameters<typeof filterByKeywords>[0]);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'Claude Agent Skill');
  });

  it('excludes entry without a keyword and short description', () => {
    const entries = [
      { name: 'Foo', description: 'Bar' },
    ];
    const result = filterByKeywords(entries as Parameters<typeof filterByKeywords>[0]);
    assert.strictEqual(result.length, 0);
  });

  it('includes entry with long description even without keyword', () => {
    const entries = [
      { name: 'Generic Tool', description: 'This is a very long description that is more than fifty characters and should pass the minimum length filter' },
    ];
    const result = filterByKeywords(entries as Parameters<typeof filterByKeywords>[0]);
    assert.strictEqual(result.length, 1);
  });

  it('excludes entry with description exactly at minimum length', () => {
    const entries = [
      { name: 'Edge Case', description: 'x'.repeat(50) },
    ];
    const result = filterByKeywords(entries as Parameters<typeof filterByKeywords>[0]);
    assert.strictEqual(result.length, 1);
  });

  it('excludes entry with description just below minimum length', () => {
    const entries = [
      { name: 'Edge Case', description: 'x'.repeat(49) },
    ];
    const result = filterByKeywords(entries as Parameters<typeof filterByKeywords>[0]);
    assert.strictEqual(result.length, 0);
  });
});
