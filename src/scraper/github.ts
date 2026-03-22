import { Fetcher, withRetry } from './utils/fetcher.js';
import type { RawSkillEntry } from '../lib/types.js';

/**
 * GitHub scraper using GitHub API + Trending.
 * Searches for repos related to Claude, AI agents, skills, prompts.
 */
export async function scrapeGitHub(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'claude-skills-directory',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const fetcher = new Fetcher('https://api.github.com', process.env.GITHUB_TOKEN ? 30 : 10);

  // Search for relevant repos
  const queries = [
    'claude agent skill',
    'claude code prompt',
    'claude AI workflow',
    'AI agent template claude',
  ];

  for (const query of queries) {
    try {
      const data = await withRetry(async () => {
        return fetcher.get<{
          items: Array<{
            id: number;
            full_name: string;
            name: string;
            description: string | null;
            html_url: string;
            stargazers_count: number;
            language: string;
            topics: string[];
            updated_at: string;
            owner: { avatar_url: string };
          }>;
        }>(`/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=20`, {
          headers,
        });
      });

      for (const repo of data.items) {
        const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
        if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill')) {
          continue;
        }

        entries.push({
          name: repo.full_name,
          sourceUrl: repo.html_url,
          sourceType: 'github',
          description: repo.description || undefined,
          githubUrl: repo.html_url,
          iconUrl: repo.owner.avatar_url,
          tags: repo.topics || (repo.language ? [repo.language] : []),
          metadata: {
            stars: repo.stargazers_count,
            language: repo.language,
            updatedAt: repo.updated_at,
          },
        });
      }
    } catch (e) {
      errors.push(`GitHub search "${query}": ${e}`);
    }
  }

  // Also scrape GitHub Trending (AI category)
  try {
    const trendingFetcher = new Fetcher('https://github.com', 10);
    const html = await withRetry(async () => trendingFetcher.get<string>('/trending?dir=desc&tab=ai'));

    // Parse trending HTML with a simple regex approach
    const articleMatches = html.matchAll(
      /<article[^>]*>[\s\S]*?href="(\/[^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi
    );

    for (const match of articleMatches) {
      const path = match[1];
      const name = match[2].replace(/<[^>]+>/g, '').trim();
      const desc = match[3].replace(/<[^>]+>/g, '').trim();

      if (name && desc) {
        entries.push({
          name: name.slice(0, 100),
          sourceUrl: `https://github.com${path}`,
          sourceType: 'github',
          description: desc,
          githubUrl: `https://github.com${path}`,
          iconUrl: null,
          tags: [],
          metadata: { source: 'trending' },
        });
      }
    }
  } catch (e) {
    errors.push(`GitHub Trending: ${e}`);
  }

  return { entries, errors };
}
