import { supabaseAdmin } from './supabase.js';
import type { PipelineConfig } from './types.js';

let cachedConfig: PipelineConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 60 * 1000; // 1 minute

export async function getPipelineConfig(): Promise<PipelineConfig> {
  const now = Date.now();
  if (cachedConfig && now - configCacheTime < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', ['AUTO_PUBLISH_ENABLED', 'AUTO_PUBLISH_MIN_VOTES']);

  if (error || !data) {
    // Return defaults
    return {
      autoPublishEnabled: false,
      autoPublishMinVotes: 10,
      batchSize: 10,
      maxRetries: 3,
    };
  }

  const settings = Object.fromEntries(data.map((s) => [s.key, s.value]));

  cachedConfig = {
    autoPublishEnabled: settings['AUTO_PUBLISH_ENABLED'] === 'true',
    autoPublishMinVotes: parseInt(settings['AUTO_PUBLISH_MIN_VOTES'] ?? '10', 10),
    batchSize: 10,
    maxRetries: 3,
  };

  configCacheTime = now;
  return cachedConfig;
}
