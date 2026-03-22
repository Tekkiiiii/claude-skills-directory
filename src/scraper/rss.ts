import type { RawSkillEntry } from '../lib/types.js';

/**
 * RSS feed aggregator.
 * Parses multiple curated tech/AI feeds.
 */
const RSS_FEEDS = [
  { url: 'https://www.anthropic.com/news/rss', name: 'Anthropic Blog' },
  { url: 'https://simonwillison.net/atom/', name: 'Simon Willison' },
  { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' },
  { url: 'https://venturebeat.com/ai/feed/', name: 'VentureBeat AI' },
  { url: 'https://feeds.feedburner.com/oreilly/radar/', name: "O'Reilly Radar" },
  { url: 'https://towardsdatascience.com/feed', name: 'Towards Data Science' },
  { url: 'https://magazine.sebastianraschka.com/feed', name: 'Sebastian Raschka' },
  { url: 'https://blogs.nvidia.com/feed/', name: 'NVIDIA Blog' },
  { url: 'https://blog.google/technology/ai/rss/', name: 'Google AI Blog' },
  { url: 'https://learn.deeplearning.ai/blog/rss', name: 'DeepLearning.AI' },
];

interface FeedItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
}

export async function scrapeRSS(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  try {
    const { default: Parser } = await import('rss-parser');

    const parser = new Parser({
      timeout: 15_000,
      headers: {
        'User-Agent': 'claude-skills-directory/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items: FeedItem[] = parsed.items || [];

        for (const item of items.slice(0, 10)) {
          const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`.toLowerCase();

          if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill') && !text.includes('prompt')) {
            continue;
          }

          if (!item.link) continue;

          // Extract GitHub URL
          const githubMatch = (item.content || item.contentSnippet || '').match(/(https?:\/\/github\.com\/[^\s<>"]+)/i);

          entries.push({
            name: item.title?.trim().slice(0, 100) || 'Untitled',
            sourceUrl: item.link,
            sourceType: 'rss',
            description: item.contentSnippet?.slice(0, 500) || undefined,
            githubUrl: githubMatch?.[1] || null,
            iconUrl: null,
            tags: [feed.name],
            metadata: {
              feedName: feed.name,
              feedUrl: feed.url,
              publishedAt: item.isoDate,
            },
          });
        }
      } catch (e) {
        errors.push(`RSS ${feed.name}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`RSS aggregator init: ${e}`);
  }

  return { entries, errors };
}
