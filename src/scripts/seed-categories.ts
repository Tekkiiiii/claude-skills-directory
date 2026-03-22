import { supabaseAdmin } from '../lib/supabase.js';

const categories = [
  {
    slug: 'coding',
    name: 'Coding',
    description: 'AI skills for writing, reviewing, refactoring, and debugging code across all programming languages and frameworks.',
    icon: 'code',
  },
  {
    slug: 'writing',
    name: 'Writing',
    description: 'Skills for generating documentation, blog posts, technical articles, marketing copy, and creative content.',
    icon: 'pen',
  },
  {
    slug: 'research',
    name: 'Research',
    description: 'AI agents that search, summarize, and synthesize information from the web, papers, and structured data sources.',
    icon: 'search',
  },
  {
    slug: 'data-analysis',
    name: 'Data Analysis',
    description: 'Skills for exploring datasets, generating reports, building visualizations, and extracting insights from raw data.',
    icon: 'chart',
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    description: 'AI skills for social media, email campaigns, SEO optimization, and generating marketing content at scale.',
    icon: 'megaphone',
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Agents that automate scheduling, note-taking, email management, and daily workflow tasks.',
    icon: 'lightning',
  },
  {
    slug: 'creative',
    name: 'Creative',
    description: 'Skills for generating images, design mockups, video scripts, music ideas, and other creative outputs.',
    icon: 'palette',
  },
  {
    slug: 'devops',
    name: 'DevOps',
    description: 'Infrastructure automation, CI/CD pipelines, containerization, monitoring, and deployment skills.',
    icon: 'server',
  },
  {
    slug: 'customer-support',
    name: 'Customer Support',
    description: 'AI agents for handling support tickets, FAQs, live chat responses, and customer onboarding flows.',
    icon: 'headset',
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'Skills that do not fit neatly into the other categories, including experimental and niche tools.',
    icon: 'box',
  },
];

async function seedCategories() {
  console.log('Seeding categories...');

  const now = new Date().toISOString();
  const records = categories.map((c) => ({
    ...c,
    created_at: now,
  }));

  for (const record of records) {
    const { error } = await supabaseAdmin
      .from('categories')
      .upsert(record, { onConflict: 'slug', ignoreDuplicates: true });

    if (error) {
      console.error(`Error upserting category ${record.slug}:`, error.message);
    } else {
      console.log(`Upserted category: ${record.name}`);
    }
  }

  console.log('Done seeding categories.');
}

seedCategories().catch(console.error);
