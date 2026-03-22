# Claude Skills Directory — CLAUDE.md

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind 4, shadcn/ui) + Supabase (PostgreSQL) + Node.js scrapers + Vercel.

## Read First
Read `PROJECT.md` for tech stack, blockers, and current focus.

## What This Project Is
Community-curated directory for Claude Opus skills. Scraped from Reddit/HN/Dev.to/GH/PH/RSS/Twitter/Hashnode every 6h. Claude API generates descriptions. Community votes. Revenue via GDN ads.

## Key Architecture
- `web/` — Next.js 15 frontend (App Router, Tailwind 4, shadcn/ui, Indigo primary)
- `src/scraper/` — 8 scrapers: Reddit (PRAW), HN, Dev.to, GitHub, Product Hunt, RSS, Twitter, Hashnode
- `src/generator/` — Claude API batch content generation (Sonnet 4, batch of 10)
- `supabase/migrations/` — DB schema + seed data

## Key Tables
`skills` (name, slug, short/long_description, source_url, source_type, category_id, tags, votes_up/down, status), `votes` (anonymous by visitor_id UUID), `categories`, `skill_reviews`, `settings` (feature flags).

## Pipeline
```
Sources → Scraper → Dedupe (URL) → Supabase (status: pending)
Pending → Claude API → Descriptions generated
Publish check (AUTO_PUBLISH_ENABLED flag) → published or review queue
```

## Automation
GitHub Actions cron every 6h (`0 */6 * * *`). Entry: `src/cron/run-pipeline.ts`.

## Skills (short refs)
- **project-status:** Read PROJECT.md first. Update `last_session` + `focus` at session end.
- **obsidian-vault:** Forward architectural decisions immediately. Never store credentials.
- **frontend (Next.js):** Mobile-first. Tailwind 4. Skeleton loaders over spinners. Empty states required.
- **supabase-sql:** UUID keys, `created_at`/`updated_at`, snake_case plural tables, RLS on every table, `limit` on all lists, JOINs not loops.
- **self-healing:** 3 fix attempts before escalation.
- **security:** Env vars for all secrets. Rate limiting on public endpoints. No hardcoded credentials.

## Build
- Frontend: `cd web && npm run build` — 20 routes, 0 errors
- Tests: `npm test` (19/19 passing)
- Deployed: https://claude-skills-directory-weld.vercel.app
- Env vars needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
