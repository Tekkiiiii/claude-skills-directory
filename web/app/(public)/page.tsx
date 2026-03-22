import Link from 'next/link';
import { ArrowRight, Search, TrendingUp, Clock, Sparkles, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { SkillCard } from '@/components/skills/skill-card';
import { AdSlot } from '@/components/ads/ad-slot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';
import {
  Code, Pencil, Search as SearchIcon, BarChart2, Megaphone, Zap,
  Palette, Server, Headphones, FolderOpen
} from 'lucide-react';
import type { Skill } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Claude Skills Directory — Discover AI Skills & Agents',
  description:
    'The community-curated directory for Claude Opus skills, prompts, and agents. Discover, share, and vote on the best AI tools for developers and practitioners.',
};

const CATEGORIES = [
  { slug: 'coding', name: 'Coding', icon: Code, description: 'Programming & development skills' },
  { slug: 'writing', name: 'Writing', icon: Pencil, description: 'Content creation & copywriting' },
  { slug: 'research', name: 'Research', icon: SearchIcon, description: 'Analysis & investigation' },
  { slug: 'data-analysis', name: 'Data Analysis', icon: BarChart2, description: 'Data processing & insights' },
  { slug: 'marketing', name: 'Marketing', icon: Megaphone, description: 'Growth & promotion' },
  { slug: 'productivity', name: 'Productivity', icon: Zap, description: 'Efficiency & automation' },
  { slug: 'creative', name: 'Creative', icon: Palette, description: 'Design & creative work' },
  { slug: 'devops', name: 'DevOps', icon: Server, description: 'Infrastructure & deployment' },
  { slug: 'customer-support', name: 'Customer Support', icon: Headphones, description: 'Support & service' },
  { slug: 'other', name: 'Other', icon: FolderOpen, description: 'Miscellaneous skills' },
];

async function getFeaturedSkills(): Promise<Skill[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, icon)')
      .eq('status', 'published')
      .order('votes_up', { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

async function getRecentSkills(): Promise<Skill[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, icon)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredSkills, recentSkills] = await Promise.all([
    getFeaturedSkills(),
    getRecentSkills(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Discover the Best{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Claude Opus Skills
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A community-curated directory of skills, prompts, and agents for Claude Opus.
            Submit, discover, and vote on the tools that power your AI workflow.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
            >
              Browse Skills <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              Submit a Skill
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Pipeline Status */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="mt-1 text-sm text-muted-foreground">Auto-updated every 6 hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">8</div>
            <div className="mt-1 text-sm text-muted-foreground">Sources scraped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="mt-1 text-sm text-muted-foreground">Free to browse</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">Community</div>
            <div className="mt-1 text-sm text-muted-foreground">Curated & voted</div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Top Voted</h2>
            </div>
            <Link href="/browse?sort=top" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* Ad Slot */}
      <section className="container mx-auto px-4">
        <AdSlot slot="leaderboard" className="w-full hidden md:flex" />
        <AdSlot slot="mobile-banner" className="w-full md:hidden flex" />
      </section>

      {/* Categories */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Browse by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.slug} href={`/browse?category=${cat.slug}`}>
                  <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{cat.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Skills */}
      {recentSkills.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Recently Added</h2>
            </div>
            <Link href="/browse?sort=newest" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">Stay Updated</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Get notified when new skills are added. No spam, unsubscribe anytime.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-sm">
              <NewsletterForm />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Scraped Automatically</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Skills are discovered from Reddit, Hacker News, Dev.to, GitHub, and more — every 6 hours.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Community Voted</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every skill can be upvoted or downvoted. The best ones rise to the top.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Always Fresh</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                New skills are added automatically. The directory is always up to date.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
