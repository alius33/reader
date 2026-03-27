#!/usr/bin/env bash
# Automated setup for reader-app — idempotent, safe to run repeatedly.
# Usage: npm run setup  (or: bash scripts/setup.sh)

set -euo pipefail
cd "$(dirname "$0")/.."

# ── 1. Ensure .env exists ──────────────────────────────────────────
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "  → .env created. Edit it if you need custom values."
else
  echo ".env already exists — skipping."
fi

# Source .env so we can use POSTGRES_PORT / DATABASE_URL below
set -a
source .env
set +a

# ── 2. Start PostgreSQL ────────────────────────────────────────────
echo "Starting PostgreSQL via docker-compose..."
docker-compose up -d

# Wait for Postgres to accept connections (max 30 seconds)
echo "Waiting for PostgreSQL to be ready..."
PORT="${POSTGRES_PORT:-5434}"
for i in $(seq 1 30); do
  if docker-compose exec -T db pg_isready -U reader > /dev/null 2>&1; then
    echo "  → PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ✗ PostgreSQL did not start in 30 seconds." >&2
    exit 1
  fi
  sleep 1
done

# ── 3. Install dependencies (if needed) ────────────────────────────
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "node_modules exists — skipping npm install."
fi

# ── 4. Run Prisma migrations ──────────────────────────────────────
echo "Running database migrations..."
npx prisma migrate deploy

# ── 5. Seed database (only if empty) ──────────────────────────────
BOOK_COUNT=$(docker-compose exec -T db psql -U reader -d reader -tAc "SELECT COUNT(*) FROM \"Book\"" 2>/dev/null || echo "0")
BOOK_COUNT=$(echo "$BOOK_COUNT" | tr -d '[:space:]')

if [ "$BOOK_COUNT" = "0" ] || [ -z "$BOOK_COUNT" ]; then
  echo "Database is empty — seeding..."
  npm run db:seed
else
  echo "Database has $BOOK_COUNT books — skipping seed."
fi

# ── 6. Build ──────────────────────────────────────────────────────
echo "Building the app..."
npx next build

# Copy static assets into standalone output (standalone mode doesn't bundle them)
if [ -d .next/standalone ]; then
  echo "Copying static assets into standalone output..."
  cp -r .next/static .next/standalone/.next/static
fi

echo ""
echo "Setup complete!"
echo "  Dev mode:        npm run dev"
echo "  Production mode: DATABASE_URL=\$DATABASE_URL PORT=3000 node .next/standalone/server.js"
