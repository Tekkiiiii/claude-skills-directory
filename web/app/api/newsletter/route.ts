import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const SubscribeSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// POST /api/newsletter — subscribe to newsletter
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Check if already subscribed
  const { data: existing } = await getSupabaseAdmin()
    .from('subscribers')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json(
      { message: "You're already subscribed. Thanks for your interest!" },
      { status: 409 }
    );
  }

  const { error } = await getSupabaseAdmin()
    .from('subscribers')
    .insert({
      email,
      confirmed: false,
    });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { message: "You're already subscribed. Thanks for your interest!" },
        { status: 409 }
      );
    }
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Successfully subscribed! Check back for updates.' }, { status: 201 });
}
