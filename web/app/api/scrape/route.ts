import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

/**
 * POST /api/scrape — manually trigger the scrape pipeline
 *
 * This is called by GitHub Actions workflow_dispatch or a manual webhook.
 *
 * Body (optional): { action: 'scrape' | 'generate' | 'publish' | 'pipeline' }
 * Defaults to 'pipeline' (full scrape -> generate -> publish).
 *
 * In production, this should be replaced with a background job queue
 * (e.g., Inngest, Trigger.dev, or QStash) instead of a subprocess.
 */
export async function POST(request: NextRequest) {
  // Verify a secret token (recommended for production)
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.SCRAPE_API_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let action = 'pipeline';
  try {
    const body = await request.json();
    if (body.action && ['scrape', 'generate', 'publish', 'pipeline'].includes(body.action)) {
      action = body.action;
    }
  } catch {
    // No body — default to pipeline
  }

  // Build the CLI command from the root of the project
  // The src/ workspace has the scraper pipeline
  const cliCommand = action === 'pipeline' ? 'pipeline' : action;

  return new Promise<NextResponse>((resolve) => {
    const child = spawn('npx', ['ts-node-esm', 'src/cron/cli.ts', cliCommand], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(
          NextResponse.json({
            action,
            success: true,
            output: stdout.slice(-2000), // last 2KB of output
          })
        );
      } else {
        resolve(
          NextResponse.json(
            {
              action,
              success: false,
              exitCode: code,
              error: stderr.slice(-1000) || stdout.slice(-1000),
            },
            { status: 500 }
          )
        );
      }
    });

    child.on('error', (err) => {
      resolve(
        NextResponse.json(
          {
            action,
            success: false,
            error: `Failed to start pipeline: ${err.message}. Note: The scrape API requires the src/ workspace to be installed. Run 'npm install' at the project root.`,
          },
          { status: 500 }
        )
      );
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      child.kill();
      resolve(
        NextResponse.json(
          { action, success: false, error: 'Pipeline timed out after 5 minutes' },
          { status: 504 }
        )
      );
    }, 5 * 60 * 1000);
  });
}
