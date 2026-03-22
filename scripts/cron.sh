#!/bin/bash
# Cron entry point — run the full pipeline
# Usage: ./scripts/cron.sh
set -e

cd "$(dirname "$0")/.."

echo "=== Cron run: $(date) ==="
npx ts-node-esm src/cron/run-pipeline.ts
echo "=== Cron run complete: $(date) ==="
