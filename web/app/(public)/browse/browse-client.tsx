'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SkillCard } from '@/components/skills/skill-card';
import { SkillCardSkeleton } from '@/components/skills/skill-card-skeleton';
import { SkillSearch } from '@/components/skills/skill-search';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/ad-slot';
import { SearchX, SlidersHorizontal, Loader2 } from 'lucide-react';
import type { Skill, Category } from '@/lib/types';
import { SOURCE_LABELS } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'top', label: 'Top Voted' },
  { value: 'trending', label: 'Trending' },
];

const SOURCE_TYPES = ['reddit', 'hackernews', 'devto', 'github', 'producthunt', 'rss', 'twitter', 'hashnode'];
const PAGE_SIZE = 12;

function BrowsePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const category = searchParams.get('category') || '';
  const source = searchParams.get('source') || '';
  const sort = searchParams.get('sort') || 'newest';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const query = searchParams.get('q') || '';

  const fetchSkills = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (source) params.set('source', source);
    if (query) params.set('q', query);
    params.set('sort', sort);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(isLoadMore ? offset : 0));

    try {
      const res = await fetch(`/api/skills?${params.toString()}`);
      const data = await res.json();
      if (isLoadMore) {
        setSkills((prev) => [...prev, ...(data.skills || [])]);
      } else {
        setSkills(data.skills || []);
      }
      setTotal(data.total || 0);
    } catch {
      // keep existing skills on error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, source, query, sort, offset]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('offset');
    router.push(`/browse?${params.toString()}`);
  };

  const loadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', String(nextOffset));
    router.push(`/browse?${params.toString()}`);
  };

  const hasMore = skills.length < total;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Skills</h1>
        <p className="mt-2 text-muted-foreground">
          Discover skills filtered by category, source, and popularity.
          {total > 0 && <span className="ml-2">({total} skills)</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <SkillSearch placeholder="Search skills by name..." />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Sort:</span>
            <div className="flex gap-1 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sort === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParam('sort', opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button
              variant={!source ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setParam('source', '')}
            >
              All
            </Button>
            {SOURCE_TYPES.map((s) => (
              <Button
                key={s}
                variant={source === s ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setParam('source', s)}
              >
                {SOURCE_LABELS[s] || s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={!category ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setParam('category', '')}
        >
          All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.slug ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setParam('category', cat.slug)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Skill Grid */}
        <div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No skills found"
              description="Try adjusting your filters or search query to find what you're looking for."
              action={{ label: 'Clear Filters', onClick: () => router.push('/browse') }}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={loadMore} disabled={loadingMore} size="lg">
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${total - skills.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AdSlot slot="sidebar-top" className="w-full" />
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">About</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Skills are scraped from 8 different sources every 6 hours and curated by the community.
            </p>
          </div>
          <AdSlot slot="sidebar-bottom" className="w-full" />
        </div>
      </div>
    </div>
  );
}

export function BrowsePageClient() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Browse Skills</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <BrowsePageInner />
    </Suspense>
  );
}
