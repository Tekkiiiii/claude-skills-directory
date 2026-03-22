-- 0004_security_and_performance_fixes.sql
-- Addresses critical security and performance issues from DB audit

-- ============================================
-- CRITICAL 1: Fix vote trigger race condition
-- Switch from AFTER to BEFORE trigger with SELECT FOR UPDATE
-- ============================================

create or replace function update_skill_vote_counts()
returns trigger as $$
begin
  -- Acquire row-level lock on the skill to prevent concurrent vote count drift
  perform 1 from public.skills where id = coalesce(NEW.skill_id, OLD.skill_id) for update;

  if TG_OP = 'INSERT' then
    if NEW.vote = 1 then
      update public.skills set votes_up = votes_up + 1 where id = NEW.skill_id;
    else
      update public.skills set votes_down = votes_down + 1 where id = NEW.skill_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- Skip no-op: if vote value unchanged, do nothing
    if OLD.vote != NEW.vote then
      if OLD.vote = 1 then
        update public.skills set votes_up = votes_up - 1 where id = NEW.skill_id;
      else
        update public.skills set votes_down = votes_down - 1 where id = NEW.skill_id;
      end if;
      if NEW.vote = 1 then
        update public.skills set votes_up = votes_up + 1 where id = NEW.skill_id;
      else
        update public.skills set votes_down = votes_down + 1 where id = NEW.skill_id;
      end if;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote = 1 then
      update public.skills set votes_up = votes_up - 1 where id = OLD.skill_id;
    else
      update public.skills set votes_down = votes_down - 1 where id = OLD.skill_id;
    end if;
  end if;

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Drop and recreate trigger as BEFORE (was AFTER)
drop trigger if exists on_vote_change on public.votes;
create trigger on_vote_change
  before insert or update or delete on public.votes
  for each row execute function update_skill_vote_counts();

-- ============================================
-- CRITICAL 2: Fix search index for NULL columns
-- Original: name || ' ' || short_description || ... returns NULL if any operand is NULL
-- Fix: Use concat_ws which ignores NULL values
-- ============================================

drop index if exists skills_search_idx;
create index skills_search_idx
  on public.skills using gin(
    to_tsvector('english',
      coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(long_description, '')
    )
  );

-- ============================================
-- CRITICAL 3: Restrict skills insert policy
-- Old: with check (true) — anyone could insert with status='published'
-- Fix: Only allow status='pending' for anonymous inserts
-- ============================================

drop policy if exists "Anyone can insert skills" on public.skills;
create policy "Anyone can insert skills" on public.skills
  for insert with check (status = 'pending');

-- ============================================
-- CRITICAL 4: Fix votes update policy
-- Old: using (true) — anyone could update anyone else's vote
-- Fix: Drop update policy entirely — vote changes use delete + re-insert
-- (Vote toggle in API already handles this: remove + add)
-- ============================================

drop policy if exists "Own vote can be updated" on public.votes;

-- ============================================
-- MEDIUM 1: Add last_scraped_at index for stale skill queries
-- ============================================

create index if not exists skills_last_scraped_idx
  on public.skills (last_scraped_at)
  where status = 'published';

-- ============================================
-- MEDIUM 2: Add composite category+status index
-- ============================================

create index if not exists skills_category_status_idx
  on public.skills (category_id, status)
  where status = 'published';

-- ============================================
-- LOW 1: Add source_type check constraint
-- ============================================

alter table public.skills
  drop constraint if exists valid_source_type;
alter table public.skills
  add constraint valid_source_type
  check (source_type in (
    'reddit', 'hackernews', 'devto', 'github',
    'producthunt', 'rss', 'twitter', 'hashnode', 'manual'
  ));

-- ============================================
-- LOW 2: Add is_featured partial index
-- ============================================

create index if not exists skills_featured_idx
  on public.skills (is_featured)
  where is_featured = true;
