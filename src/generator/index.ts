import { supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { generateBatch } from './anthropic.js';
import type { RawSkillEntry } from '../lib/types.js';

/**
 * Fetch pending skills, generate content via Claude, and update Supabase.
 */
export async function runGenerator(): Promise<{ processed: number; generated: number; failed: number }> {
  logger.info('Starting content generator');

  // Fetch skills without generated content
  const { data: pending, error } = await supabaseAdmin
    .from('skills')
    .select('id, name, slug, description, source_url, source_type, github_url, icon_url, tags')
    .or('description.is.null,long_description.is.null')
    .eq('status', 'pending')
    .limit(50);

  if (error) {
    logger.error(`Failed to fetch pending skills: ${error.message}`);
    return { processed: 0, generated: 0, failed: 0 };
  }

  if (!pending || pending.length === 0) {
    logger.info('No pending skills to generate content for');
    return { processed: 0, generated: 0, failed: 0 };
  }

  logger.info(`Found ${pending.length} skills needing content generation`);

  // Convert to RawSkillEntry format
  const entries: RawSkillEntry[] = pending.map((s) => ({
    name: s.name,
    sourceUrl: s.source_url,
    sourceType: s.source_type as RawSkillEntry['sourceType'],
    description: s.description || undefined,
    githubUrl: s.github_url || null,
    iconUrl: s.icon_url || null,
    tags: s.tags || [],
  }));

  // Generate content in batch
  const results = await generateBatch(entries);

  let generated = 0;
  let failed = 0;

  // Update Supabase with generated content
  for (const skill of pending) {
    const content = results.get(skill.source_url);

    if (content) {
      // Look up category ID
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', content.suggestedCategorySlug)
        .single();

      const { error: updateError } = await supabaseAdmin
        .from('skills')
        .update({
          short_description: content.shortDescription,
          long_description: content.longDescription,
          tags: content.suggestedTags,
          category_id: category?.id || null,
        })
        .eq('id', skill.id);

      if (updateError) {
        logger.error(`Update failed for ${skill.name}: ${updateError.message}`);
        failed++;
      } else {
        generated++;
      }
    } else {
      failed++;
    }
  }

  logger.info(`Generator complete: ${generated} generated, ${failed} failed`);
  return { processed: pending.length, generated, failed };
}
