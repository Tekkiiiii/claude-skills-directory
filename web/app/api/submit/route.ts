import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// POST /api/submit — user submission form handler
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!body.source_url?.startsWith('http')) {
    return NextResponse.json({ error: 'Valid source URL is required' }, { status: 400 });
  }
  if (body.description?.length < 10) {
    return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
  }

  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)}-${Date.now().toString(36)}`;
  const tags = body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  const { data, error } = await getSupabaseAdmin()
    .from('skills')
    .insert({
      name: body.name.trim(),
      slug,
      source_url: body.source_url,
      source_type: 'rss',
      description: body.description?.trim() || null,
      github_url: body.github_url || null,
      tags,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation — URL already submitted
      return NextResponse.json({ error: 'This skill has already been submitted' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skill: data, message: 'Skill submitted for review' }, { status: 201 });
}
