# Seed Scripts

These scripts populate the database with sample data for development and testing. Run them in order.

## Prerequisites

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running

### 1. Seed categories

Categories must be seeded first because skills reference them by slug. Run:

```bash
npm run seed:categories
```

This inserts 10 categories (coding, writing, research, data-analysis, marketing, productivity, creative, devops, customer-support, other) using `ON CONFLICT (slug) DO NOTHING` so it is safe to re-run.

### 2. Seed skills

After categories exist, seed the sample skills:

```bash
npm run seed
```

This inserts 30 realistic skills across all categories. Each insert uses `ON CONFLICT (source_url) DO NOTHING`, making the script idempotent. Skills with `source_type = github` include realistic GitHub repository URLs.

## Resetting

To clear all data and reseed:

```sql
DELETE FROM skills;
DELETE FROM categories;
```

Then re-run the seed scripts in order.

## Adding new skills

Edit `src/scripts/seed.ts` and add entries to the `skills` array. Each entry requires:

- `name` — display name
- `slug` — URL-safe identifier (unique)
- `short_description` — max 150 characters
- `long_description` — 100-400 characters
- `source_url` — unique URL used for idempotent upserts
- `source_type` — one of: `reddit`, `hackernews`, `devto`, `github`, `producthunt`, `rss`, `twitter`, `hashnode`
- `github_url` — required when `source_type` is `github`
- `tags` — array of string tags
- `votes_up` / `votes_down` — integer vote counts
- `published_at` / `last_scraped_at` — ISO 8601 datetime strings
- `is_featured` — set to `true` for exactly 3 skills
