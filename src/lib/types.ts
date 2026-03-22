import { z } from 'zod';

// ============================================
// SHARED TYPES
// ============================================

export const SourceType = z.enum([
  'reddit',
  'hackernews',
  'devto',
  'github',
  'producthunt',
  'rss',
  'twitter',
  'hashnode',
]);
export type SourceType = z.infer<typeof SourceType>;

export const SkillStatus = z.enum(['pending', 'reviewing', 'published', 'archived']);
export type SkillStatus = z.infer<typeof SkillStatus>;

export const ReviewDecision = z.enum(['approve', 'reject', 'edit']);
export type ReviewDecision = z.infer<typeof ReviewDecision>;

// ============================================
// RAW ENTRY (from scraper)
// ============================================

export const RawSkillEntrySchema = z.object({
  name: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: SourceType,
  description: z.string().optional(),
  githubUrl: z.string().url().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
});
export type RawSkillEntry = z.infer<typeof RawSkillEntrySchema>;

// ============================================
// GENERATED CONTENT (from Claude API)
// ============================================

export const GeneratedContentSchema = z.object({
  shortDescription: z.string().max(200),
  longDescription: z.string().min(100).max(600),
  suggestedTags: z.array(z.string()).max(5),
  suggestedCategorySlug: z.string().optional(),
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

// ============================================
// SKILL (database row)
// ============================================

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  longDescription: z.string().nullable(),
  sourceUrl: z.string(),
  sourceType: SourceType,
  githubUrl: z.string().nullable(),
  iconUrl: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  tags: z.array(z.string()),
  votesUp: z.number().int().default(0),
  votesDown: z.number().int().default(0),
  score: z.number().int().default(0),
  status: SkillStatus,
  isFeatured: z.boolean().default(false),
  affiliateUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  lastScrapedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Skill = z.infer<typeof SkillSchema>;

// ============================================
// CATEGORY
// ============================================

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type Category = z.infer<typeof CategorySchema>;

// ============================================
// VOTE
// ============================================

export const VoteSchema = z.object({
  id: z.string().uuid(),
  skillId: z.string().uuid(),
  visitorId: z.string(),
  vote: z.union([z.literal(1), z.literal(-1)]),
  createdAt: z.string().datetime(),
});
export type Vote = z.infer<typeof VoteSchema>;

// ============================================
// SCRAPER INTERFACE
// ============================================

export interface ScraperResult {
  entries: RawSkillEntry[];
  source: SourceType;
  errors: string[];
}

export interface BaseScraper {
  readonly name: string;
  readonly sourceType: SourceType;
  scrape(): Promise<ScraperResult>;
}

// ============================================
// PIPELINE
// ============================================

export interface PipelineConfig {
  autoPublishEnabled: boolean;
  autoPublishMinVotes: number;
  batchSize: number;
  maxRetries: number;
}
