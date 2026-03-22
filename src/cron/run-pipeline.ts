/**
 * Pipeline entry point — run via GitHub Actions cron or CLI.
 * Executes: scrape → generate → publish
 */
import 'dotenv/config';
import { runScrapers } from '../scraper/index.js';
import { runGenerator } from '../generator/index.js';
import { runPublisher } from '../publisher/index.js';
import { logger } from '../lib/logger.js';

async function main() {
  const start = Date.now();
  logger.info('=== Pipeline run started ===');

  try {
    // Step 1: Scrape all sources
    logger.info('Step 1/3: Scraping...');
    const scrapeResult = await runScrapers();
    logger.info(`Scrape: ${scrapeResult.inserted} inserted, ${scrapeResult.updated} updated, ${scrapeResult.skipped} skipped`);
    if (scrapeResult.errors.length > 0) {
      logger.warn(`Scrape errors: ${scrapeResult.errors.join('; ')}`);
    }

    // Step 2: Generate content for pending skills
    logger.info('Step 2/3: Generating content...');
    const genResult = await runGenerator();
    logger.info(`Generator: ${genResult.processed} processed, ${genResult.generated} generated, ${genResult.failed} failed`);

    // Step 3: Auto-publish eligible skills
    logger.info('Step 3/3: Publishing...');
    const pubResult = await runPublisher();
    logger.info(`Publisher: ${pubResult.autoPublished} auto-published, ${pubResult.readyForReview} ready for review`);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    logger.info(`=== Pipeline complete in ${elapsed}s ===`);
  } catch (e) {
    logger.error(`Pipeline failed: ${e}`);
    process.exit(1);
  }
}

main();
