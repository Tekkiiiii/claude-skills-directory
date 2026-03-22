-- Fix: scraper code writes to 'description' but the DB column is 'short_description'
-- Also add metadata column for raw scraper metadata storage

alter table public.skills add column if not exists description text;
alter table public.skills add column if not exists metadata jsonb;
