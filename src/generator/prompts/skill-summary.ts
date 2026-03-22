/**
 * Prompt template for generating a short skill summary (150 chars for cards).
 */
export const SKILL_SUMMARY_PROMPT = `You are an expert at writing concise, engaging descriptions for AI tools and skills.

Given a raw skill entry, generate a SHORT DESCRIPTION (max 150 characters) suitable for a skill directory card.

The description should:
- Be clear and specific about what the skill does
- Include a subtle CTA if space allows (e.g., "for developers", "for writers")
- NOT be generic (avoid "powerful", "amazing", "best")
- Be in the same language as the original text

Return JSON:
{
  "shortDescription": "your 150-char max description here"
}

Raw entry:
- Name: {name}
- Description: {description}
- Tags: {tags}
- Source: {sourceType}`;

/**
 * Prompt template for generating a full skill detail page (400 chars).
 */
export const SKILL_DETAIL_PROMPT = `You are an expert at writing detailed, SEO-optimized descriptions for AI tools and skills.

Given a raw skill entry, generate a FULL DESCRIPTION (300-500 characters) suitable for a skill detail page.

The description should:
- Explain what the skill does and who it's for
- Highlight key features and use cases
- Include a "Best for" section at the end
- Be written in English, engaging and informative
- NOT be generic or overly promotional
- Include practical examples of use

Return JSON:
{
  "longDescription": "your 300-500 char description here",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedCategorySlug": "coding|writing|research|data-analysis|marketing|productivity|creative|devops|customer-support|other"
}

Raw entry:
- Name: {name}
- Description: {description}
- GitHub: {githubUrl}
- Tags: {tags}
- Source: {sourceType}`;
