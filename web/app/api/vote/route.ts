import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// POST /api/vote — submit anonymous vote
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.skill_id || !body.visitor_id || ![-1, 1].includes(body.vote)) {
    return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
  }

  // Check if visitor already voted
  const { data: existing } = await getSupabaseAdmin()
    .from('votes')
    .select('id, vote')
    .eq('skill_id', body.skill_id)
    .eq('visitor_id', body.visitor_id)
    .single();

  if (existing) {
    if (existing.vote === body.vote) {
      // Remove vote (toggle off)
      await getSupabaseAdmin().from('votes').delete().eq('id', existing.id);
      return NextResponse.json({ action: 'removed', vote: 0 });
    } else {
      // Change vote
      await getSupabaseAdmin()
        .from('votes')
        .update({ vote: body.vote })
        .eq('id', existing.id);
      return NextResponse.json({ action: 'changed', vote: body.vote });
    }
  }

  // New vote
  const { error } = await getSupabaseAdmin().from('votes').insert({
    skill_id: body.skill_id,
    visitor_id: body.visitor_id,
    vote: body.vote,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: 'added', vote: body.vote });
}
