import type { BaseScraper, ScraperResult } from '../lib/types.js';

/**
 * Base class for all scrapers.
 * Each scraper implements the BaseScraper interface and returns RawSkillEntry[].
 */
export abstract class BaseScraper implements BaseScraper {
  abstract readonly name: string;
  abstract readonly sourceType: BaseScraper['sourceType'];

  abstract scrape(): Promise<ScraperResult>;
}
