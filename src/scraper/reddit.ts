import type { RawSkillEntry } from '../lib/types.js';

/**
 * Reddit scraper using PRAW.
 * Scrapes r/ClaudeAI, r/LocalLLaMA, r/ChatGPT for skill-related posts.
 */
export async function scrapeReddit(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  // PRAW requires credentials — skip if not configured
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || !process.env.REDDIT_REFRESH_TOKEN) {
    errors.push('Reddit: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_REFRESH_TOKEN are required. Skipping.');
    return { entries, errors };
  }

  try {
    // Dynamic import to avoid errors when praw is not installed
    const { default: Praw } = await import('praw');
    const reddit = new Praw({
      userAgent: process.env.REDDIT_USER_AGENT || 'claude-skills-directory/1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      refreshToken: process.env.REDDIT_REFRESH_TOKEN,
    });

    const subreddits = ['ClaudeAI', 'LocalLLaMA', 'ChatGPT', 'MachineLearning'];

    for (const sub of subreddits) {
      try {
        // PRAW v7: getHot returns an async Listing — collect via Array.fromAsync
        const subreddit = reddit.subreddit(sub);
        const posts = await Array.fromAsync(subreddit.getHot({ limit: 50 }));

        for (const post of posts) {
          // Look for posts mentioning skills, prompts, or tools
          const title = post.title || '';
          const body = post.selftext || '';
          const text = `${title} ${body}`.toLowerCase();

          // Skip non-English and non-skill posts
          if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill')) {
            continue;
          }

          // Extract GitHub URL from post
          const githubMatch = body.match(/(https?:\/\/github\.com\/[^\s]+)/i);
          const postUrl = `https://reddit.com${post.permalink}`;

          entries.push({
            name: title.trim().slice(0, 100),
            sourceUrl: postUrl,
            sourceType: 'reddit',
            description: body.slice(0, 500) || undefined,
            githubUrl: githubMatch?.[1] || null,
            iconUrl: null,
            tags: post.link_flair_richtext?.map((f: { text: string }) => f.text).filter(Boolean) || [],
            metadata: {
              subreddit: sub,
              score: post.score,
              numComments: post.num_comments,
              author: post.author?.name,
              createdUtc: post.created_utc,
            },
          });
        }
      } catch (e) {
        errors.push(`Reddit ${sub}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Reddit init: ${e}`);
  }

  return { entries, errors };
}
