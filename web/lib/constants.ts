export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Claude Skills Directory';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_DESCRIPTION =
  'Discover, share, and vote on the best Claude Opus skills, prompts, and agents. A community-curated directory for AI practitioners.';

export const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  devto: 'Dev.to',
  github: 'GitHub',
  producthunt: 'Product Hunt',
  rss: 'Blog',
  twitter: 'Twitter',
  hashnode: 'Hashnode',
};

export const DEFAULT_CATEGORIES = [
  { slug: 'coding', name: 'Coding', icon: 'code' },
  { slug: 'writing', name: 'Writing', icon: 'pencil' },
  { slug: 'research', name: 'Research', icon: 'search' },
  { slug: 'data-analysis', name: 'Data Analysis', icon: 'bar-chart-2' },
  { slug: 'marketing', name: 'Marketing', icon: 'megaphone' },
  { slug: 'productivity', name: 'Productivity', icon: 'zap' },
  { slug: 'creative', name: 'Creative', icon: 'palette' },
  { slug: 'devops', name: 'DevOps', icon: 'server' },
  { slug: 'customer-support', name: 'Customer Support', icon: 'headphones' },
  { slug: 'other', name: 'Other', icon: 'folder' },
];
