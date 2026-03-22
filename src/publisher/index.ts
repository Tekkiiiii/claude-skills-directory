import { supabaseAdmin } from '../lib/supabase.js';
import { getPipelineConfig } from '../lib/config.js';
import { logger } from '../lib/logger.js';

/**
 * Check auto-publish settings and publish eligible skills.
 * Skills with score >= AUTO_PUBLISH_MIN_VOTES are auto-published if AUTO_PUBLISH_ENABLED=true.
 */
export async function runPublisher(): Promise<{ autoPublished: number; readyForReview: number }> {
  const config = await getPipelineConfig();

  if (!config.autoPublishEnabled) {
    logger.info('Auto-publish is disabled — skills will remain in pending/review queue');
    return { autoPublished: 0, readyForReview: 0 };
  }

  // Find skills that have enough votes to auto-publish
  const { data: eligible, error } = await supabaseAdmin
    .from('skills')
    .select('id, name, votes_up, votes_down')
    .eq('status', 'pending')
    .gte('votes_up', config.autoPublishMinVotes);

  if (error) {
    logger.error(`Failed to fetch eligible skills: ${error.message}`);
    return { autoPublished: 0, readyForReview: 0 };
  }

  if (!eligible || eligible.length === 0) {
    return { autoPublished: 0, readyForReview: 0 };
  }

  // Auto-publish them
  const { error: updateError } = await supabaseAdmin
    .from('skills')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .in(
      'id',
      eligible.map((s) => s.id)
    );

  if (updateError) {
    logger.error(`Auto-publish failed: ${updateError.message}`);
    return { autoPublished: 0, readyForReview: eligible.length };
  }

  logger.info(`Auto-published ${eligible.length} skills (min votes: ${config.autoPublishMinVotes})`);
  return { autoPublished: eligible.length, readyForReview: 0 };
}
