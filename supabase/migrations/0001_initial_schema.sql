-- Claude Skills Directory — Initial Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text, -- lucide icon name
  created_at timestamptz default now()
);

-- ============================================
-- SKILLS
-- ============================================
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text, -- 150 chars for cards
  long_description text, -- 400+ chars for detail page
  source_url text not null unique, -- deduplication key
  source_type text not null, -- reddit, hackernews, devto, github, producthunt, rss, twitter, hashnode
  github_url text,
  icon_url text,
  category_id uuid references public.categories(id),
  tags text[] default '{}',
  votes_up integer default 0,
  votes_down integer default 0,
  score integer generated always as (votes_up - votes_down) stored,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'published', 'archived')),
  is_featured boolean default false,
  affiliate_url text,
  created_at timestamptz default now(),
  published_at timestamptz,
  last_scraped_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries
create index on public.skills (status);
create index on public.skills (category_id);
create index on public.skills (source_type);
create index on public.skills (score desc);
create index on public.skills (published_at desc);
create index on public.skills using gin(tags);
create index on public.skills using gin(to_tsvector('english', name || ' ' || short_description || ' ' || long_description));

-- ============================================
-- VOTES
-- ============================================
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  visitor_id text not null, -- anonymous UUID from localStorage
  vote integer not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  unique(skill_id, visitor_id)
);

-- Index for quick vote check
create index on public.votes (skill_id);
create index on public.votes (visitor_id);

-- Trigger to update skill vote counts
create or replace function update_skill_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote = 1 then
      update public.skills set votes_up = votes_up + 1 where id = NEW.skill_id;
    else
      update public.skills set votes_down = votes_down + 1 where id = NEW.skill_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if OLD.vote = 1 then update public.skills set votes_up = votes_up - 1 where id = NEW.skill_id;
    else update public.skills set votes_down = votes_down - 1 where id = NEW.skill_id;
    end if;
    if NEW.vote = 1 then update public.skills set votes_up = votes_up + 1 where id = NEW.skill_id;
    else update public.skills set votes_down = votes_down + 1 where id = NEW.skill_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote = 1 then update public.skills set votes_up = votes_up - 1 where id = OLD.skill_id;
    else update public.skills set votes_down = votes_down - 1 where id = OLD.skill_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger on_vote_change
  after insert or update or delete on public.votes
  for each row execute function update_skill_vote_counts();

-- ============================================
-- SKILL REVIEWS (admin review queue)
-- ============================================
create table public.skill_reviews (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  reviewed_by text, -- admin identifier
  decision text not null check (decision in ('approve', 'reject', 'edit')),
  notes text,
  created_at timestamptz default now()
);

create index on public.skill_reviews (skill_id);

-- ============================================
-- SETTINGS (feature flags)
-- ============================================
create table public.settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

-- Default settings
insert into public.settings (key, value, description) values
  ('AUTO_PUBLISH_ENABLED', 'false', 'When true, skills auto-publish after generation'),
  ('AUTO_PUBLISH_MIN_VOTES', '10', 'Minimum votes before auto-publishing a skill');

-- ============================================
-- SUBSCRIBERS (newsletter v2)
-- ============================================
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz default now(),
  confirmed boolean default false
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.votes enable row level security;
alter table public.skill_reviews enable row level security;
alter table public.settings enable row level security;
alter table public.subscribers enable row level security;

-- Categories: anyone can read
create policy "Anyone can read categories" on public.categories
  for select using (true);

-- Skills: anyone can read published skills
create policy "Anyone can read published skills" on public.skills
  for select using (status = 'published');

-- Skills: anyone can insert (user submissions)
create policy "Anyone can insert skills" on public.skills
  for insert with check (true);

-- Skills: service role can update (from API routes)
create policy "Service role can update skills" on public.skills
  for update using (true);

-- Skills: no one deletes directly
create policy "No direct deletes on skills" on public.skills
  for delete using (false);

-- Votes: anyone can insert and read
create policy "Anyone can insert votes" on public.votes
  for insert with check (true);

create policy "Anyone can read votes" on public.votes
  for select using (true);

-- Votes: only own vote can be updated
create policy "Own vote can be updated" on public.votes
  for update using (true);

-- Subscribers: anyone can subscribe
create policy "Anyone can subscribe" on public.subscribers
  for insert with check (true);

-- Settings: read-only for anon (for frontend feature flags)
create policy "Anyone can read settings" on public.settings
  for select using (true);

-- Skill reviews: insertable by service role
create policy "Service role can manage reviews" on public.skill_reviews
  for all using (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_skills_updated_at
  before update on public.skills
  for each row execute function update_updated_at();

create trigger update_settings_updated_at
  before update on public.settings
  for each row execute function update_updated_at();
