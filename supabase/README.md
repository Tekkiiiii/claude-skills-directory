# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization and give the project a name (e.g., `claude-skills-directory`)
4. Set a strong database password (save this!)
5. Choose a region close to your users
6. Click **Create new project** and wait for it to spin up (~2 minutes)

## 2. Get Your Project Credentials

Once the project is ready, go to **Settings > API** in the Supabase dashboard and copy:

- **Project URL** — e.g., `https://xxxxx.supabase.co`
- **anon/public** key — for the frontend (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **service_role** key — for server-side/admin operations (`SUPABASE_SERVICE_ROLE_KEY`)

**Important:** The `service_role` key bypasses Row Level Security. Never expose it to the browser.

## 3. Run the Migrations

### Option A: SQL Editor (easiest)

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy-paste the contents of `supabase/migrations/0001_initial_schema.sql` and run it
4. Then copy-paste `supabase/migrations/0002_seed_categories.sql` and run it
5. Then copy-paste `supabase/migrations/0003_fix_scraper_columns.sql` and run it

### Option B: Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link your local project
cd supabase
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

## 4. Row Level Security (RLS) — Explained Simply

RLS is Supabase's way of controlling who can read/write data. Each table has **policies**:

| Table | Who Can Read | Who Can Write |
|-------|-------------|---------------|
| `categories` | Everyone | Service role only |
| `skills` | Everyone (published only) | Anyone insert; service role update/delete |
| `votes` | Everyone | Anyone insert/update their own |
| `subscribers` | Everyone | Anyone insert |
| `settings` | Everyone (read-only) | Service role only |
| `skill_reviews` | Everyone | Service role only |

The key insight: **anonymous users can insert skills and vote, but only the service role (backend) can actually publish or review them.**

## 5. Environment Variables

Add these to your `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: public site URL for sitemap
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

For GitHub Actions, add these as **Repository Secrets**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

And as **Repository Variables**:
- `AUTO_PUBLISH_ENABLED` (set to `true` or `false`)

## 6. Verify Setup

After running migrations, check the **Table Editor** in Supabase — you should see all 6 tables (`categories`, `skills`, `votes`, `skill_reviews`, `settings`, `subscribers`) with the seeded categories in `categories`.
