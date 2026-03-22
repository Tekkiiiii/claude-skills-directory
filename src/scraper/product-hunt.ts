import { Fetcher, withRetry } from './utils/fetcher.js';
import type { RawSkillEntry } from '../lib/types.js';

/**
 * Product Hunt scraper using their public API.
 */
export async function scrapeProductHunt(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (process.env.PRODUCT_HUNT_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.PRODUCT_HUNT_API_TOKEN}`;
  }

  const fetcher = new Fetcher('https://api.producthunt.com/v2', 30);

  const topics = ['artificial-intelligence', 'developer-tools', 'productivity', 'saas'];

  for (const topic of topics) {
    try {
      const data = await withRetry(async () => {
        return fetcher.get<{
          data: {
            posts: Array<{
              id: string;
              name: string;
              tagline: string;
              description: string | null;
              url: string;
              website: string;
              votesCount: number;
              commentsCount: number;
              topics: Array<{ name: string }>;
              maker: { name: string; url: string };
              thumbnail: { url: string } | null;
            }>;
          };
        }>(`/api/topic/${topic}/posts?order=votes`, { headers });
      });

      for (const post of data.data.posts) {
        const text = `${post.name} ${post.tagline} ${post.description || ''}`.toLowerCase();
        if (!text.includes('claude') && !text.includes('ai') && !text.includes('agent')) {
          continue;
        }

        // Extract GitHub URL from description
        const githubMatch = (post.description || '').match(/(https?:\/\/github\.com\/[^\s]+)/i);

        entries.push({
          name: post.name.trim().slice(0, 100),
          sourceUrl: post.website || post.url,
          sourceType: 'producthunt',
          description: post.tagline || post.description || undefined,
          githubUrl: githubMatch?.[1] || null,
          iconUrl: post.thumbnail?.url || null,
          tags: post.topics?.map((t) => t.name) || [],
          metadata: {
            votes: post.votesCount,
            comments: post.commentsCount,
            maker: post.maker.name,
          },
        });
      }
    } catch (e) {
      errors.push(`Product Hunt topic "${topic}": ${e}`);
    }
  }

  return { entries, errors };
}
