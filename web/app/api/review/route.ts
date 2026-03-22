import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const ReviewActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['approve', 'reject']),
});

/**
 * PATCH /api/review — batch approve or reject skills
 *
 * Body: { ids: string[], action: 'approve' | 'reject' }
 *
 * - approve: set status to 'published', set published_at
 * - reject: set status to 'archived'
 */
export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ReviewActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, action } = parsed.data;

  if (ids.length === 0) {
    return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
  }

  if (ids.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 IDs per request' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const updateData =
    action === 'approve'
      ? { status: 'published', published_at: now }
      : { status: 'archived' };

  const { data, error } = await getSupabaseAdmin()
    .from('skills')
    .update(updateData)
    .in('id', ids)
    .select('id, name, status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Record review decisions
  const reviewRecords = ids.map((skillId) => ({
    skill_id: skillId,
    reviewed_by: 'admin', // TODO: hook up real auth when admin auth is implemented
    decision: action === 'approve' ? 'approve' : 'reject',
    notes: null,
  }));

  const { error: reviewError } = await getSupabaseAdmin()
    .from('skill_reviews')
    .insert(reviewRecords);

  if (reviewError) {
    // Log but don't fail the request — skills were already updated
    console.error('Failed to insert review records:', reviewError.message);
  }

  return NextResponse.json({
    success: true,
    action,
    updated: data?.length || 0,
    skills: data,
  });
}
