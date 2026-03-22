# Supabase Migration Audit Report

Audited migrations:
- `0001_initial_schema.sql`
- `0002_seed_categories.sql`
- `0003_fix_scraper_columns.sql`

---

## Critical Issues

### 1. Vote Trigger Race Condition (0001, lines 72-99)

The `update_skill_vote_counts()` trigger runs `AFTER` each DML event. This creates a race condition window where concurrent votes on the same skill can cause the vote counts to drift from the actual sum of `votes.vote`.

**Problem**: When two votes arrive simultaneously, both triggers may read the same `votes_up` value, increment it by 1 each, and write back the same value -- losing one increment.

**Fix**: Add `FOR EACH STATEMENT` `INITDEFERRED` advisory lock, or better: drop the trigger and use a **materialized view or an `AFTER ... FOR EACH STATEMENT`** approach, or use a `BEFORE` trigger with a `SELECT FOR UPDATE` advisory lock on the skill row. The simplest correct fix is switching to `BEFORE` triggers with `SELECT FOR UPDATE` on the skill row:

```sql
create or replace function update_skill_vote_counts()
returns trigger as $$
begin
  perform 1 from public.skills where id = coalesce(NEW.skill_id, OLD.skill_id) for update;
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

drop trigger on_vote_change on public.votes;
create trigger on_vote_change
  before insert or update or delete on public.votes
  for each row execute function update_skill_vote_counts();
```

Note: `FOR UPDATE` only locks within the same transaction, so truly concurrent inserts from separate connections still race. For production at scale, consider computing vote counts from the `votes` table on read (e.g., a view or a denormalized counter updated via `FOR UPDATE` in a serializable transaction).

### 2. Search Index Uses Concatenated NULLable Columns (0001, line 53)

```sql
create index on public.skills using gin(to_tsvector('english', name || ' ' || short_description || ' ' || long_description));
```

The `||` concatenation operator returns `NULL` if any operand is `NULL`. Since `short_description` and `long_description` are nullable, the entire tsvector will be `NULL` for any row where either of those columns is `NULL`, causing those rows to be **completely missing from search results**.

**Fix**: Use `coalesce()` or `concat_ws()`:

```sql
create index on public.skills using gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(long_description, '')));
```

Or use `concat_ws(' ', ...)` which skips `NULL` values automatically.

### 3. RLS Policy "Anyone can insert skills" Has No Validation (0001, lines 160-162)

```sql
create policy "Anyone can insert skills" on public.skills
  for insert with check (true);
```

Every anonymous visitor can insert arbitrary skills with any `status` value. There is no check that `status = 'pending'` or that required fields are set. A malicious user could directly insert a row with `status = 'published'`, bypassing the review queue entirely.

**Fix**: Add a check in the `with check` clause:

```sql
create policy "Anyone can insert skills" on public.skills
  for insert with check (status = 'pending');
```

Alternatively, add a default value and rely on the column default (which already exists), but still restrict `status` to `'pending'`:

```sql
create policy "Anyone can insert skills" on public.skills
  for insert with check (status = 'pending' and source_url is not null and source_type is not null);
```

### 4. Vote Update Policy Has No Visitor ID Validation (0001, lines 179-181)

```sql
create policy "Own vote can be updated" on public.votes
  for update using (true);
```

The `using (true)` clause allows **any visitor** to update **any other visitor's vote**. The `visitor_id` is just a text string (localStorage UUID) with no server-side validation, so spoofing is trivial. Combined with no `using` clause on the update policy, this is effectively open-update on the votes table.

**Fix**: Either drop the update policy entirely (preventing vote changes, users must delete and re-insert), or implement proper ownership:

```sql
create policy "Own vote can be updated" on public.votes
  for update using (auth.uid()::text = visitor_id);  -- requires auth.jwt() integration
```

If not using Supabase Auth for votes, consider dropping update support and only allowing delete + insert.

---

## Medium Issues

### 5. Missing `last_scraped_at` Index (0001, line 42)

The `last_scraped_at` column has no index. The scraper agent likely queries for stale skills (e.g., "skills not scraped in the last 24 hours"). Without an index, this becomes a full table scan.

**Fix**: Add:

```sql
create index on public.skills (last_scraped_at asc) where status = 'published';
```

### 6. Missing `category_id` + `status` Composite Index (0001)

Filtering by category with a status check (e.g., "published skills in category X") is a common query pattern. Separate single-column indexes on `category_id` and `status` cannot satisfy this efficiently with a bitmap index scan; a composite index helps.

**Fix**: Add:

```sql
create index on public.skills (category_id, status) where status = 'published';
```

### 7. `votes` Table Has No Unique Constraint on `skill_id + visitor_id` Enforced at DB Level (0001, line 64)

The unique constraint is defined:

```sql
unique(skill_id, visitor_id)
```

This is correct. However, the error message raised on conflict is not user-friendly, and the application likely catches this via Supabase client and treats it as "already voted." This is noted here as a reminder that the unique constraint is the correct approach -- just ensure the client code handles the `23505` integrity violation gracefully.

### 8. Vote Trigger UPDATE Branch Does Not Skip No-Op (0001, lines 81-87)

When a user changes their vote from `-1` to `-1` or `1` to `1` (no effective change), the trigger still decrements and increments the same counter, resulting in a no-op that generates unnecessary write load. Not a correctness bug, but inefficient under heavy use.

**Fix**: Add a guard:

```sql
elsif TG_OP = 'UPDATE' then
  if OLD.vote != NEW.vote then
    if OLD.vote = 1 then update public.skills set votes_up = votes_up - 1 where id = NEW.skill_id;
    else update public.skills set votes_down = votes_down - 1 where id = NEW.skill_id;
    end if;
    if NEW.vote = 1 then update public.skills set votes_up = votes_up + 1 where id = NEW.skill_id;
    else update public.skills set votes_down = votes_down + 1 where id = NEW.skill_id;
    end if;
  end if;
```

---

## Low Issues

### 9. `source_type` Column Has No Enum or Check Constraint (0001, line 29)

The column comment lists valid values (`reddit, hackernews, devto, github, producthunt, rss, twitter, hashnode`) but there is no `CHECK` constraint enforcing them. Invalid source types can be inserted silently.

**Fix**: Add a check constraint or use a PostgreSQL enum:

```sql
alter table public.skills add constraint valid_source_type
  check (source_type in ('reddit', 'hackernews', 'devto', 'github', 'producthunt', 'rss', 'twitter', 'hashnode', 'manual'));
```

### 10. `votes` Unique Constraint Uses `skill_id + visitor_id` But `visitor_id` Is Not Indexed Independently (0001, lines 68-69)

The `visitor_id` index is useful for the "show my votes" query pattern, but since `visitor_id` has high cardinality per voter (one per skill voted), the index is not very selective. This is acceptable for now.

### 11. `is_featured` Has No Index (0001, line 38)

If the homepage or category pages filter by `is_featured = true`, a sequential scan will occur on large tables. Add:

```sql
create index on public.skills (is_featured) where is_featured = true;
```

### 12. `settings` Table RLS Allows Anyone to Read (0001, line 188)

Settings are readable by anyone. This is acceptable for feature flags, but if any future setting contains sensitive data (API keys, internal config), this becomes a security issue. Consider scoping reads to authenticated users or adding a `public` flag column.

### 13. `skill_reviews` Table RLS Allows All Operations (0001, lines 192-193)

```sql
create policy "Service role can manage reviews" on public.skill_reviews
  for all using (true);
```

`using (true)` means any authenticated or anonymous user can insert/update/delete reviews. Service role bypasses RLS anyway, but for regular authenticated users this is overly permissive. If staff accounts will use Supabase Auth, restrict to authenticated users.

### 14. `subscribers` Table Has No Index on `email` (0001)

The `email` column has a `UNIQUE` constraint which creates an index, so this is fine. No action needed.

### 15. `updated_at` Trigger Uses `now()` Instead of `clock_timestamp()` (0001, line 201)

`now()` is an alias for `statement_timestamp()`. In a long-running statement, all rows updated by that statement will have the same `updated_at` value. If you need microsecond precision per row, use `clock_timestamp()`. This is cosmetic for most use cases.

### 16. No `comment on` Statements (consistency)

None of the tables or columns have `COMMENT ON` metadata. Adding comments improves developer experience and documents intent for future maintainers.

---

## Items Reviewed and Found Correct

- **categories table** (0001, lines 10-17): Schema is clean. `slug` is correctly `UNIQUE NOT NULL`. No issues.
- **skills table** (0001, lines 22-44): Column types are appropriate. `gen_random_uuid()` is correct for UUID v4. Generated column `score` is well-designed. `on delete cascade` on foreign keys is appropriate.
- **votes table** (0001, lines 58-65): Unique constraint on `(skill_id, visitor_id)` is correct and prevents double-voting. `vote` check constraint `-1, 1` is correct.
- **skill_reviews table** (0001, lines 104-113): Simple and correct.
- **settings table** (0001, lines 118-128): Primary key on `key` text column is appropriate. Default seed values are sensible.
- **subscribers table** (0001, lines 133-138): Clean schema with `UNIQUE` email.
- **0002_seed_categories.sql**: Seed data is well-formed, slugs are URL-safe, icon names are valid Lucide identifiers. No issues.
- **0003_fix_scraper_columns.sql**: `IF NOT EXISTS` on `ALTER TABLE ADD COLUMN` is correct and prevents failure on re-run. No conflicts with 0001 -- `description` and `metadata` are new additions. No issues.

---

## Summary of Fixes Needed (Priority Order)

| Priority | Issue | Location | Fix Required |
|----------|-------|----------|--------------|
| Critical | Vote trigger race condition | 0001:72-99 | Switch to `BEFORE` trigger + `SELECT FOR UPDATE` |
| Critical | Search index breaks on NULL columns | 0001:53 | Use `coalesce()` in tsvector expression |
| Critical | Open insert policy on skills | 0001:160-162 | Add `with check (status = 'pending')` |
| Critical | Open update policy on votes | 0001:179-181 | Restrict to visitor ownership or drop update |
| Medium | Missing `last_scraped_at` index | 0001 | Add partial index for stale-skill queries |
| Medium | Missing composite index | 0001 | Add `(category_id, status)` index |
| Low | Vote UPDATE skips no-op guard | 0001:81-87 | Add `OLD.vote != NEW.vote` guard |
| Low | `source_type` lacks enum/check | 0001:29 | Add check constraint for known values |
| Low | `is_featured` lacks index | 0001 | Add partial index |
