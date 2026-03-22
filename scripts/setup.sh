#!/bin/bash
# setup.sh — One-time setup for local development
# Run this once after cloning the repo

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Claude Skills Directory — Local Setup ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Install from https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "ERROR: npm is not installed."
  exit 1
fi
echo "✓ npm $(npm -v)"

# 1. Install root dependencies
echo ""
echo "Installing root dependencies..."
cd "$PROJECT_ROOT"
npm install

# 2. Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/web"
npm install

# 3. Install src dependencies
echo ""
echo "Installing src (scraper pipeline) dependencies..."
cd "$PROJECT_ROOT/src"
npm install

# 4. Copy env files
echo ""
echo "Checking environment files..."
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  echo "✓ Created .env from .env.example"
  echo "  → Fill in your credentials in .env"
else
  echo "✓ .env already exists"
fi

if [ ! -f "$PROJECT_ROOT/web/.env.local" ]; then
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/web/.env.local"
  echo "✓ Created web/.env.local from .env.example"
  echo "  → Fill in your credentials in web/.env.local"
else
  echo "✓ web/.env.local already exists"
fi

# 5. Supabase setup instructions
echo ""
echo "=== Supabase Setup ==="
echo "1. Create a project at https://supabase.com"
echo "2. Get your Project URL and keys from:"
echo "   Settings → API"
echo "3. Run migrations in the Supabase SQL Editor, in order:"
echo "   a. supabase/migrations/0001_initial_schema.sql"
echo "   b. supabase/migrations/0002_seed_categories.sql"
echo "   c. supabase/migrations/0003_fix_scraper_columns.sql"
echo "   d. supabase/migrations/0004_security_and_performance_fixes.sql"
echo "4. Copy the values into .env and web/.env.local"
echo ""

# 6. Quick verification
echo "=== Quick Verification ==="
cd "$PROJECT_ROOT/web"
echo "Running frontend typecheck..."
if npm run typecheck > /dev/null 2>&1; then
  echo "✓ TypeScript check passed"
else
  echo "⚠ TypeScript check failed — see errors above"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start the frontend dev server:"
echo "  cd $PROJECT_ROOT/web && npm run dev"
echo ""
echo "To run the scraper pipeline locally:"
echo "  cd $PROJECT_ROOT/src && npm run pipeline"
echo ""
echo "To run unit tests:"
echo "  cd $PROJECT_ROOT/src && npx tsx --test scraper/utils/__tests__/utils.test.ts"
