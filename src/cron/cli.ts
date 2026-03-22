#!/usr/bin/env node
/**
 * CLI for manual pipeline runs.
 * Usage: npx ts-node src/cron/cli.ts [scrape|generate|publish|pipeline]
 */
import 'dotenv/config';
import { runScrapers } from '../scraper/index.js';
import { runGenerator } from '../generator/index.js';
import { runPublisher } from '../publisher/index.js';

const command = process.argv[2] || 'pipeline';

async function main() {
  switch (command) {
    case 'scrape':
      console.log('Running scrapers...');
      console.log(await runScrapers());
      break;
    case 'generate':
      console.log('Running generator...');
      console.log(await runGenerator());
      break;
    case 'publish':
      console.log('Running publisher...');
      console.log(await runPublisher());
      break;
    case 'pipeline':
      console.log('Running full pipeline...');
      const pipeline = await import('./run-pipeline.js');
      await pipeline.main();
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Usage: cli.ts [scrape|generate|publish|pipeline]');
  }
}

main().catch(console.error);
