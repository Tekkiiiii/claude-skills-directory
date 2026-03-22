import { supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { dedupeByUrl } from './utils/dedupe.js';
import { normalizeEntry, slugify } from './utils/normalizer.js';
import { filterByKeywords } from './utils/keyword-filter.js';
import type { RawSkillEntry } from '../lib/types.js';

// Import all scrapers
import { scrapeReddit } from './reddit.js';
import { scrapeHackerNews } from './hacker-news.js';
import { scrapeDevto } from './devto.js';
import { scrapeGitHub } from './github.js';
import { scrapeProductHunt } from './product-hunt.js';
import { scrapeRSS } from './rss.js';
import { scrapeTwitter } from './twitter.js';
import { scrapeHashnode } from './hashnode.js';

/**
 * Orchestrator: runs all scrapers in parallel, dedupes, filters,
 * and upserts results to Supabase.
 */
export async function runScrapers(): Promise<{ inserted: number; updated: number; skipped: number; errors: string[] }> {
  logger.info('Starting scraper pipeline');

  const allErrors: string[] = [];
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  // Run all scrapers in parallel
  const results = await Promise.allSettled([
    scrapeReddit(),
    scrapeHackerNews(),
    scrapeDevto(),
    scrapeGitHub(),
    scrapeProductHunt(),
    scrapeRSS(),
    scrapeTwitter(),
    scrapeHashnode(),
  ]);

  const allEntries: RawSkillEntry[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const scraperNames = ['Reddit', 'HackerNews', 'Dev.to', 'GitHub', 'ProductHunt', 'RSS', 'Twitter', 'Hashnode'];

    if (result.status === 'rejected') {
      allErrors.push(`${scraperNames[i]}: ${result.reason}`);
      continue;
    }

    const { entries, errors } = result.value;
    allErrors.push(...errors);
    allEntries.push(...entries);
    logger.info(`Scraper ${scraperNames[i]}: ${entries.length} entries, ${errors.length} errors`);
  }

  // Deduplicate by URL
  const deduped = dedupeByUrl(allEntries);
  logger.info(`After dedup: ${deduped.length} entries (from ${allEntries.length})`);

  // Filter by keywords
  const filtered = filterByKeywords(deduped);
  logger.info(`After keyword filter: ${filtered.length} entries`);

  // Upsert to Supabase
  for (const raw of filtered) {
    const entry = normalizeEntry(raw);

    try {
      // Check if URL already exists
      const { data: existing } = await supabaseAdmin
        .from('skills')
        .select('id')
        .eq('source_url', entry.sourceUrl)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('skills')
          .update({
            name: entry.name,
            description: entry.description || undefined,
            github_url: entry.githubUrl,
            icon_url: entry.iconUrl,
            tags: entry.tags,
            metadata: entry.metadata,
            last_scraped_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          allErrors.push(`Update ${entry.sourceUrl}: ${error.message}`);
          totalSkipped++;
        } else {
          totalUpdated++;
        }
      } else {
        // Insert new
        const slug = `${slugify(entry.name)}-${Date.now().toString(36)}`;

        const { error } = await supabaseAdmin.from('skills').insert({
          name: entry.name,
          slug,
          source_url: entry.sourceUrl,
          source_type: entry.sourceType,
          short_description: entry.description || null,
          github_url: entry.githubUrl,
          icon_url: entry.iconUrl,
          tags: entry.tags,
          metadata: entry.metadata,
          status: 'pending',
          last_scraped_at: new Date().toISOString(),
        });

        if (error) {
          allErrors.push(`Insert ${entry.sourceUrl}: ${error.message}`);
          totalSkipped++;
        } else {
          totalInserted++;
        }
      }
    } catch (e) {
      allErrors.push(`Error processing ${entry.sourceUrl}: ${e}`);
      totalSkipped++;
    }
  }

  logger.info(`Scraper pipeline complete: ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped`);

  return {
    inserted: totalInserted,
    updated: totalUpdated,
    skipped: totalSkipped,
    errors: allErrors.slice(0, 50), // Limit errors to prevent huge logs
  };
}
