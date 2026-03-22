import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink, Github, Tag, ChevronRight } from 'lucide-react';
import { SkillVote } from '@/components/skills/skill-vote';
import { SkillCard } from '@/components/skills/skill-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/ad-slot';
import { SOURCE_LABELS, SITE_URL } from '@/lib/constants';
import type { Skill } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSkill(slug: string): Promise<Skill | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/skills?slug=${encodeURIComponent(slug)}&limit=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.skills?.[0] || null;
  } catch {
    return null;
  }
}

async function getRelatedSkills(categorySlug: string, excludeId: string): Promise<Skill[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/api/skills?category=${encodeURIComponent(categorySlug)}&limit=5`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.skills || []).filter((s: Skill) => s.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkill(slug);

  if (!skill) {
    return { title: 'Skill Not Found' };
  }

  const title = `${skill.name} — Claude Skills Directory`;
  const description = skill.short_description || `Discover the ${skill.name} skill for Claude Opus.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/skill/${skill.slug}`,
      images: skill.icon_url ? [{ url: skill.icon_url }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: skill.icon_url ? [skill.icon_url] : [],
    },
  };
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = await getSkill(slug);

  if (!skill) {
    notFound();
  }

  const relatedSkills = skill.category
    ? await getRelatedSkills(skill.category.slug, skill.id)
    : [];

  const score = skill.votes_up - skill.votes_down;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.short_description || skill.long_description || '',
    url: skill.source_url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Claude Opus',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: score > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: Math.min(5, 3 + score / 10),
          ratingCount: skill.votes_up + skill.votes_down,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/browse" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Browse
          </Link>
          <ChevronRight className="h-4 w-4" />
          {skill.category && (
            <>
              <Link href={`/browse?category=${skill.category.slug}`} className="hover:text-foreground">
                {skill.category.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground">{skill.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{skill.name}</h1>
                  {skill.short_description && (
                    <p className="mt-2 text-lg text-muted-foreground">{skill.short_description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SkillVote
                  skillId={skill.id}
                  initialVotesUp={skill.votes_up}
                  initialVotesDown={skill.votes_down}
                />
                <Badge variant="outline">{SOURCE_LABELS[skill.source_type] || skill.source_type}</Badge>
                {skill.category && (
                  <Link href={`/browse?category=${skill.category.slug}`}>
                    <Badge variant="secondary">{skill.category.name}</Badge>
                  </Link>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={skill.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Source
                </a>
              </Button>
              {skill.github_url && (
                <Button variant="outline" asChild>
                  <a href={skill.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>

            {/* Long Description */}
            {skill.long_description && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold">About this Skill</h2>
                <div className="mt-4 whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {skill.long_description}
                </div>
              </div>
            )}

            {/* Tags */}
            {skill.tags && skill.tags.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Ad */}
            <AdSlot slot="in-article" className="w-full" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdSlot slot="sidebar-top" className="w-full" />

            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Quick Info</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd>{SOURCE_LABELS[skill.source_type] || skill.source_type}</dd>
                </div>
                {skill.category && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{skill.category.name}</dd>
                  </div>
                )}
                {skill.published_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Added</dt>
                    <dd>{new Date(skill.published_at).toLocaleDateString()}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Upvotes</dt>
                  <dd className="text-green-600 font-medium">{skill.votes_up}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Downvotes</dt>
                  <dd className="text-red-500 font-medium">{skill.votes_down}</dd>
                </div>
              </dl>
            </div>

            <AdSlot slot="sidebar-bottom" className="w-full" />
          </div>
        </div>

        {/* Related Skills */}
        {relatedSkills.length > 0 && (
          <section className="mt-12 border-t pt-12">
            <h2 className="mb-6 text-xl font-bold">Related Skills</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedSkills.map((s) => (
                <SkillCard key={s.id} skill={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
