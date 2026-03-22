import type { RawSkillEntry } from '../lib/types.js';

/**
 * Twitter/X scraper via Nitter instances.
 * No authentication required — works on public tweets via RSS/Nitter.
 */

// Try multiple Nitter instances (they go down frequently)
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://xcancel.com',
];

const SEARCH_TERMS = ['claude code skill', 'claude opus agent', 'AI agent template claude'];

/**
 * Get RSS feed URL for a Nitter search.
 */
function getNitterRSS(instance: string, query: string): string {
  return `${instance}/search?f=tweets&q=${encodeURIComponent(query)}&rss=1`;
}

export async function scrapeTwitter(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  try {
    const { default: Parser } = await import('rss-parser');
    const parser = new Parser({ timeout: 10_000 });

    for (const instance of NITTER_INSTANCES) {
      let instanceWorked = false;

      for (const query of SEARCH_TERMS) {
        try {
          const rssUrl = getNitterRSS(instance, query);
          const parsed = await parser.parseURL(rssUrl);
          instanceWorked = true;

          for (const item of parsed.items?.slice(0, 15) || []) {
            if (!item.link) continue;

            const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
            if (!text.includes('claude') && !text.includes('skill') && !text.includes('agent')) {
              continue;
            }

            // Extract links from content
            const linkMatch = item.content?.match(/(https?:\/\/[^\s<>]+)/gi) || [];
            const githubMatch = linkMatch.find((l: string) => l.includes('github.com'));

            entries.push({
              name: item.title?.trim().replace(/^.*?:/, '').trim().slice(0, 100) || 'Tweet',
              sourceUrl: item.link,
              sourceType: 'twitter',
              description: item.contentSnippet?.replace(/<[^>]+>/g, '').slice(0, 500) || undefined,
              githubUrl: githubMatch || null,
              iconUrl: null,
              tags: ['twitter', 'claude'],
              metadata: {
                author: item.author,
                publishedAt: item.isoDate,
                via: instance,
              },
            });
          }

          // Found a working instance, skip others
          break;
        } catch (e) {
          // Try next search term or instance
        }
      }

      if (instanceWorked) break;
    }
  } catch (e) {
    errors.push(`Twitter/Nitter: ${e}`);
  }

  return { entries, errors };
}
