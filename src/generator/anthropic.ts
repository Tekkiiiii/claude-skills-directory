import Anthropic from '@anthropic-ai/sdk';
import { SKILL_SUMMARY_PROMPT, SKILL_DETAIL_PROMPT } from './prompts/skill-summary.js';
import type { RawSkillEntry, GeneratedContent } from '../lib/types.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CATEGORIES = [
  'coding',
  'writing',
  'research',
  'data-analysis',
  'marketing',
  'productivity',
  'creative',
  'devops',
  'customer-support',
  'other',
];

/**
 * Generate content for a single skill using Claude.
 */
export async function generateSkillContent(entry: RawSkillEntry): Promise<GeneratedContent | null> {
  const longDescriptionPrompt = SKILL_DETAIL_PROMPT
    .replace('{name}', entry.name)
    .replace('{description}', entry.description || 'No description provided')
    .replace('{githubUrl}', entry.githubUrl || 'Not available')
    .replace('{tags}', entry.tags.join(', ') || 'None')
    .replace('{sourceType}', entry.sourceType);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: longDescriptionPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const rawContent = response.content[0];
    if (rawContent.type !== 'text') return null;

    const parsed = JSON.parse(rawContent.text);

    // Validate and sanitize
    const categorySlug = parsed.suggestedCategorySlug || 'other';
    const validCategory = CATEGORIES.includes(categorySlug) ? categorySlug : 'other';

    return {
      shortDescription: String(parsed.shortDescription || parsed.longDescription || '').slice(0, 200),
      longDescription: String(parsed.longDescription || parsed.shortDescription || '').slice(0, 600),
      suggestedTags: (parsed.suggestedTags || entry.tags || []).slice(0, 5),
      suggestedCategorySlug: validCategory,
    };
  } catch (e) {
    console.error(`Generation failed for ${entry.name}: ${e}`);
    return null;
  }
}

/**
 * Generate content in batch (more cost efficient).
 */
export async function generateBatch(entries: RawSkillEntry[]): Promise<Map<string, GeneratedContent>> {
  const results = new Map<string, GeneratedContent>();

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    console.log(`Processing batch ${batchNum}/${Math.ceil(entries.length / batchSize)}`);

    await Promise.all(
      batch.map(async (entry) => {
        const content = await generateSkillContent(entry);
        if (content) {
          results.set(entry.sourceUrl, content);
        }
      })
    );
  }

  return results;
}
