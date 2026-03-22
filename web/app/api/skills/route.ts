import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// GET /api/skills — list published skills
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const source = searchParams.get('source');
  const sort = searchParams.get('sort') || 'newest';
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const query = searchParams.get('q');
  const slug = searchParams.get('slug');

  // If fetching by slug, return single skill directly
  if (slug) {
    const { data, error } = await supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, icon)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ skills: [data], total: data ? 1 : 0 });
  }

  let queryBuilder = supabase
    .from('skills')
    .select(
      `
      *,
      category:categories(id, name, slug, icon)
    `
    )
    .eq('status', 'published');

  if (category) {
    queryBuilder = queryBuilder.eq('category.slug', category);
  }
  if (source) {
    queryBuilder = queryBuilder.eq('source_type', source);
  }
  if (query) {
    queryBuilder = queryBuilder.textSearch('name', query, { type: 'websearch' });
  }

  // Sort
  if (sort === 'newest') {
    queryBuilder = queryBuilder.order('published_at', { ascending: false });
  } else if (sort === 'top') {
    queryBuilder = queryBuilder.order('votes_up', { ascending: false });
  } else if (sort === 'trending') {
    // Trending = high votes in last 7 days (simple approximation)
    queryBuilder = queryBuilder.order('votes_up', { ascending: false });
  }

  queryBuilder = queryBuilder.range(offset, offset + limit - 1);

  const { data, error, count } = await queryBuilder;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skills: data || [], total: count || 0 });
}

// POST /api/skills — create skill (user submission)
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Basic validation
  if (!body.name || !body.source_url || !body.description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)}-${Date.now().toString(36)}`;

  const { data, error } = await getSupabaseAdmin().from('skills').insert({
    name: body.name,
    slug,
    source_url: body.source_url,
    source_type: 'rss', // user submissions default to rss
    description: body.description,
    github_url: body.github_url || null,
    tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()) : [],
    status: 'pending',
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skill: data }, { status: 201 });
}
