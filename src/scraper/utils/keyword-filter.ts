const KEYWORDS = [
  'claude',
  'claude code',
  'claude opus',
  'ai agent',
  'skill script',
  'prompt engineering',
  'agent template',
  'claude prompt',
  'ai workflow',
  'claude workflow',
  'agent skill',
  'prompt template',
  'claude template',
  'computer use agent',
  'claude computer',
];

const MIN_DESCRIPTION_LENGTH = 50;

/**
 * Filter entries by relevance keywords and minimum description length.
 */
export function filterByKeywords(entries: { description?: string; name: string }[]): typeof entries {
  return entries.filter((entry) => {
    const text = `${entry.name} ${entry.description || ''}`.toLowerCase();
    const hasKeyword = KEYWORDS.some((kw) => text.includes(kw));
    const hasDescription = (entry.description?.length ?? 0) >= MIN_DESCRIPTION_LENGTH;
    // Allow entries with strong keywords even without long description
    // Or entries with long description but no keyword (potential match)
    return hasKeyword || hasDescription;
  });
}
