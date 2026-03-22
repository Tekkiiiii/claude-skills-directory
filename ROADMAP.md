# ROADMAP.md — Project Phases and Milestones

## Phases

| Phase | Status | Notes |
|-------|--------|-------|
| 0. Bootstrap | **DONE** | Scaffold, scrapers, frontend, CI — all complete, build passes |
| 1. Launch Prep | **IN PROGRESS** | Supabase setup, credentials, deployment |
| 2. First Pipeline Run | **PENDING** | Verify scrapers, review queue, live site |
| 3. Content Seeding | **PENDING** | Manual approve loop until site has 20+ skills |
| 4. Monetization | **PENDING** | GDN ads, affiliate hooks |
| 5. Growth | **BACKLOG** | Newsletter, featured listings, marketplace |

## Phase 1: Launch Prep

**Goal**: Get the site live with real credentials.

### Milestones

- [x] Vercel deployment config (vercel.json, .vercelignore) — DONE
- [x] DB migration audit — 4 critical + 2 medium + 5 low issues found
- [x] 0004 migration created with all fixes applied
- [x] Unit tests for scraper utils — 19 tests, all passing
- [x] scripts/setup.sh created
- [x] README updated with secrets table
- [ ] Supabase project created + migrations run
- [ ] .env credentials filled in
- [ ] Vercel deployment configured
- [ ] GitHub Actions secrets wired
- [ ] Site accessible at target domain
- [ ] Manual scrape + first skill published

## Phase 2: First Pipeline Run

**Goal**: End-to-end verification that the pipeline works.

### Milestones

- [ ] Scrape completes without errors
- [ ] Pending skills appear in admin review queue
- [ ] Admin can approve a skill
- [ ] Approved skill visible on browse/home page
- [ ] Voting works (anonymous ID persisted)

## Phase 3: Content Seeding

**Goal**: Make the site look alive — 20+ published skills.

### Milestones

- [ ] Run pipeline 2-3x daily until 50+ skills in DB
- [ ] Bulk-approve high-quality entries
- [ ] Filter out low-quality / off-topic entries
- [ ] Site stats show real data (not zeros/placeholders)
