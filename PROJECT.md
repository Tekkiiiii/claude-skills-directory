---
name: claude-skills-directory
status: active
phase: bootstrap
version: 0.1.0
last_session: 2026-03-22

tech_stack:
  frontend: [Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui]
  backend: [Supabase, PostgreSQL, Node.js scrapers, Claude API]
  scraping: [PRAW, Axios, Cheerio, rss-parser]
  automation: [GitHub Actions, Claude API batch]
  hosting: [Vercel]

build: passes (20 routes, 0 errors)
last_session: 2026-03-22

blockers:
  - Supabase project not yet created (DB required for full functionality)
  - .env files need real credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL)
  - GitHub Actions secrets not configured

focus:
  - Set up Supabase project and run migrations
  - Fill in real Supabase + API credentials in Vercel env vars
  - Wire up GitHub Actions with secrets
  - Test full pipeline end-to-end
---

## What This Project Is

A community-curated directory website for Claude Opus skills, prompts, and agents. Skills are scraped from Reddit, Hacker News, Dev.to, GitHub, Product Hunt, RSS feeds, Twitter, and Hashnode every 6 hours, descriptions are auto-generated via Claude API, and the community votes on quality. Revenue from GDN ads with hooks for affiliate links, featured listings, and marketplace.

## Current Status

Frontend deployed to Vercel — https://claude-skills-directory-weld.vercel.app. All 20 routes build successfully. DB not connected yet (no Supabase project), so API routes return errors. Scraper GitHub Actions pipeline scaffolded but needs secrets.

## Deployment

- **Frontend:** Deployed to Vercel (from `web/` workspace)
- **Vercel project:** `tekkiiiiis-projects/claude-skills-directory`
- **Env vars needed in Vercel:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
- **Monorepo note:** Next.js lives in `web/` workspace — deploy from `web/` directory. See `~/.claude/projects/-Users-Tekki--claude/memory/Vercel-Deploy-Lessons.md` for deploy troubleshooting.

## Key Architecture

- `web/` — Next.js 15 frontend (App Router, shadcn/ui, Tailwind 4)
- `src/scraper/` — 8 scrapers: Reddit, Hacker News, Dev.to, GitHub, Product Hunt, RSS, Twitter, Hashnode
- `src/generator/` — Claude API batch content generation
- `supabase/migrations/` — DB schema and seed data

## Open Questions

- [ ] What is the exact brand name and tagline?
- [ ] Should we support GitHub OAuth for submitters?
- [ ] Do we need an email notification on skill publish?
- [ ] What is the target domain name?
