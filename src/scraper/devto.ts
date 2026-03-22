import { Fetcher, withRetry } from './utils/fetcher.js';
import type { RawSkillEntry } from '../lib/types.js';

/**
 * Dev.to scraper using the public API.
 * Searches articles tagged with "claude", "ai", "productivity", etc.
 */
export async function scrapeDevto(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  const fetcher = new Fetcher('https://dev.to/api', 30);

  const tags = ['claude', 'ai', 'productivity', 'programming', 'aicoding', 'chatgpt'];

  for (const tag of tags) {
    try {
      const data = await withRetry(async () => {
        return fetcher.get<Array<{
          id: number;
          title: string;
          url: string;
          description: string | null;
          tag_list: string[];
          public_reactions_count: number;
          comments_count: number;
          positive_reactions_count: number;
          published_at: string;
          user: { name: string; username: string; profile_image_90: string };
        }>>(`/articles?tag=${tag}&top=7&per_page=20`);
      });

      for (const article of data) {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill') && !text.includes('prompt')) {
          continue;
        }

        entries.push({
          name: article.title.trim().slice(0, 100),
          sourceUrl: article.url,
          sourceType: 'devto',
          description: article.description || undefined,
          githubUrl: null,
          iconUrl: article.user.profile_image_90 || null,
          tags: article.tag_list || [],
          metadata: {
            reactions: article.positive_reactions_count,
            comments: article.comments_count,
            publishedAt: article.published_at,
            author: article.user.username,
          },
        });
      }
    } catch (e) {
      errors.push(`Dev.to tag "${tag}": ${e}`);
    }
  }

  return { entries, errors };
}
