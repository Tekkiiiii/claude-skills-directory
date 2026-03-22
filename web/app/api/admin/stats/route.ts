import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/**
 * GET /api/admin/stats — counts for admin dashboard
 *
 * Returns: { total, pending, published, archived }
 */
export async function GET() {
  const admin = getSupabaseAdmin();
  const [total, pending, published, archived] = await Promise.all([
    admin.from('skills').select('id', { count: 'exact', head: true }),
    admin.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
  ]);

  const errors = [total.error, pending.error, published.error, archived.error].filter(Boolean);
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }

  return NextResponse.json({
    total: total.count ?? 0,
    pending: pending.count ?? 0,
    published: published.count ?? 0,
    archived: archived.count ?? 0,
  });
}
