import type { RawSkillEntry } from '../lib/types.js';

/**
 * Hashnode scraper using their public GraphQL API.
 */
const HASHNODE_GRAPHQL = 'https://api.hashnode.com/';

const SEARCH_QUERY = `
  query SearchPosts($query: String!, $page: Int!) {
    searchPosts(query: $query, page: $page, pageSize: 20) {
      results {
        post {
          title
          url
          brief
          tags {
            name
          }
          popularity
          dateAdded
          author {
            name
            profilePicture
          }
        }
      }
    }
  }
`;

export async function scrapeHashnode(): Promise<{ entries: RawSkillEntry[]; errors: string[] }> {
  const entries: RawSkillEntry[] = [];
  const errors: string[] = [];

  const queries = ['claude', 'AI agent', 'productivity', 'prompt engineering'];

  for (const query of queries) {
    try {
      const response = await fetch(HASHNODE_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { query, page: 0 },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json() as {
        data?: {
          searchPosts?: {
            results: Array<{
              post: {
                title: string;
                url: string;
                brief: string | null;
                tags: Array<{ name: string }>;
                popularity: number;
                dateAdded: string;
                author: { name: string; profilePicture: string | null };
              };
            }>;
          };
        };
        errors?: Array<{ message: string }>;
      };

      if (json.errors) {
        errors.push(`Hashnode query "${query}": ${json.errors[0]?.message}`);
        continue;
      }

      const results = json.data?.searchPosts?.results || [];

      for (const result of results) {
        const post = result.post;
        const text = `${post.title} ${post.brief || ''}`.toLowerCase();

        if (!text.includes('claude') && !text.includes('ai agent') && !text.includes('skill')) {
          continue;
        }

        entries.push({
          name: post.title.trim().slice(0, 100),
          sourceUrl: post.url,
          sourceType: 'hashnode',
          description: post.brief || undefined,
          githubUrl: null,
          iconUrl: post.author.profilePicture || null,
          tags: post.tags?.map((t) => t.name) || [],
          metadata: {
            popularity: post.popularity,
            publishedAt: post.dateAdded,
            author: post.author.name,
          },
        });
      }
    } catch (e) {
      errors.push(`Hashnode query "${query}": ${e}`);
    }
  }

  return { entries, errors };
}
