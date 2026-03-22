# Claude Skills Directory

A community-curated directory website for Claude Opus skills, prompts, and agents.

## Setup

1. Clone the repository
2. Run `./scripts/setup.sh` — installs all dependencies and creates env files
3. Set up Supabase:
   - Create a project at supabase.com
   - Run migrations in order in the Supabase SQL Editor:
     - `supabase/migrations/0001_initial_schema.sql`
     - `supabase/migrations/0002_seed_categories.sql`
     - `supabase/migrations/0003_fix_scraper_columns.sql`
     - `supabase/migrations/0004_security_and_performance_fixes.sql`
   - Copy Project URL and keys into `.env` and `web/.env.local`
4. `cd web && npm run dev`
5. Set up GitHub Actions secrets (see below)

## Project Structure

- `web/` — Next.js 15 frontend
- `src/` — Scraper pipeline, content generator
- `supabase/` — Database migrations

## GitHub Actions Secrets

Add these secrets to your GitHub repo (Settings → Secrets and variables → Actions):

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (not anon key!) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for content generation |
| `REDDIT_CLIENT_ID` | No | Reddit app client ID |
| `REDDIT_CLIENT_SECRET` | No | Reddit app client secret |
| `REDDIT_USER_AGENT` | No | Reddit user agent string |
| `REDDIT_REFRESH_TOKEN` | No | Reddit OAuth refresh token |
| `GITHUB_TOKEN` | No | GitHub personal access token (raises rate limit) |
| `PRODUCT_HUNT_API_TOKEN` | No | Product Hunt API token |

Also set this Repository Variable (not Secret):
- `AUTO_PUBLISH_ENABLED` — `false` (until you're ready to auto-publish)

## Scripts

```bash
./scripts/setup.sh   # One-time setup (install deps, create env files)
./scripts/cron.sh   # Run the full scrape → generate → publish pipeline
```
