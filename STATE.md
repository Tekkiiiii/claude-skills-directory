# STATE.md — Cross-Session Memory

## Last Updated
2026-03-22

## Decisions (locked in)

- **Brand name**: TBD — see Open Questions
- **Domain**: TBD — see Open Questions
- **Hosting**: Vercel (confirmed)
- **Frontend**: Next.js 15, TypeScript, Tailwind 4, shadcn/ui
- **Backend**: Supabase (PostgreSQL + RLS)
- **Scrapers**: 8 sources (Reddit, HN, Dev.to, GitHub, PH, RSS, Twitter, HN)
- **Generator**: Claude Sonnet 4 via Anthropic API
- **Scheduler**: GitHub Actions cron every 6 hours
- **Auth**: Anonymous voting via localStorage UUID (no login required)
- **Monetization**: Ad slot placeholders (swap with GDN later)

## Open Questions (blocked)

1. **Brand name + tagline** — "Claude Skills Directory" is placeholder. Needs a real name.
2. **Domain name** — Needs a target domain to configure Vercel + sitemap
3. **Email notifications** — Do we notify submitters when their skill is approved?

## Session Log

### 2026-03-21 Session 1
- Fixed Reddit scraper (snoowrap → praw + Array.fromAsync)
- Added slug filter to GET /api/skills route
- Fixed anonymous vote ID generation (localStorage UUID)
- Fixed review client sending 'rejected' status (→ 'archived')
- Created .env and .env.local from example
- Build passes: 19 routes, 0 errors

### 2026-03-20 Session 1
- Initial scaffold: frontend + scrapers + migrations + CI

## Blockers

- Supabase project not created yet (user action required)
- Real credentials not filled in yet
- Domain not decided

## Next Actions

1. Answer open questions (brand, domain)
2. Create Supabase project + run 4 migrations (in order)
3. Fill in .env credentials
4. Deploy to Vercel
5. Wire GitHub Actions secrets
6. First pipeline run + verify

## Phase 1 Progress (2026-03-21)

Completed without credentials:
- vercel.json + .vercelignore created
- DB audit: 4 critical + 2 medium + 5 low issues found
- 0004 migration created with all fixes
- Unit tests added: 19 tests (4 suites) for scraper utils
- scripts/setup.sh created
- README updated with secrets table
- Build still passes (verified after all changes)

### Phase 1.2 additions (2026-03-21 later):
- Newsletter signup: POST /api/newsletter + newsletter-form.tsx component
- Newsletter section added to homepage between Recent Skills and How It Works
- Newsletter form stories file created
- Newsletter added to sitemap
- Seed script: 30 realistic skills across 10 categories (src/scripts/seed.ts)
- Seed categories script (src/scripts/seed-categories.ts)
- Seed scripts added to src/package.json
- E2E Playwright tests scaffolded (tests/e2e/, tests/playwright.config.ts)
- Build verified passing with all additions
