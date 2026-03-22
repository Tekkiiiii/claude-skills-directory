import { Fetcher, withRetry } from './utils/fetcher.js';
import type { RawSkillEntry } from '../lib/types.js';

/**
 * Hacker News scraper using Algolia API.
 * Searches for "claude", "AI agent", "skill", etc.
 */
export async function scrapeHackerNews(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  const fetcher = new Fetcher('https://hn.algolia.com', 10);

  const queries = ['claude', 'claude code', 'AI agent', 'claude opus', 'prompt engineering'];

  for (const query of queries) {
    try {
      const data = await withRetry(async () => {
        return fetcher.get<{
          hits: Array<{
            objectID: string;
            title: string;
            url: string;
            story_text: string | null;
            points: number;
            num_comments: number;
            author: string;
            created_at: string;
            tags: string[];
          }>;
        }>(`/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30`);
      });

      for (const hit of data.hits) {
        if (!hit.url) continue;

        const text = `${hit.title || ''} ${hit.story_text || ''}`.toLowerCase();
        if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill')) {
          continue;
        }

        // Extract GitHub URL
        const githubMatch = hit.story_text?.match(/(https?:\/\/github\.com\/[^\s]+)/i);

        entries.push({
          name: hit.title?.trim().slice(0, 100) || 'Untitled',
          sourceUrl: hit.url,
          sourceType: 'hackernews',
          description: hit.story_text?.slice(0, 500) || undefined,
          githubUrl: githubMatch?.[1] || null,
          iconUrl: null,
          tags: hit.tags?.filter((t: string) => t !== 'story') || [],
          metadata: {
            points: hit.points,
            numComments: hit.num_comments,
            author: hit.author,
            createdAt: hit.created_at,
            algoliaId: hit.objectID,
          },
        });
      }
    } catch (e) {
      errors.push(`HN query "${query}": ${e}`);
    }
  }

  return { entries, errors };
}
