#!/bin/bash
# ==============================================================================
# LincLab - Database Setup Script
# ==============================================================================
# Usage: ./scripts/setup-database.sh
#
# This script runs all Supabase migrations in order.
# Prerequisites:
#   - psql (PostgreSQL client) installed
#   - DATABASE_URL environment variable set
# ==============================================================================

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo ""
  echo "Set it to your Supabase PostgreSQL connection string:"
  echo "  export DATABASE_URL=\"postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres\""
  echo ""
  echo "You can find this in your Supabase dashboard under:"
  echo "  Settings > Database > Connection string > URI"
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "ERROR: Migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

echo "Running database migrations..."
echo "================================"

for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  filename=$(basename "$migration")
  echo "Running: $filename"
  psql "$DATABASE_URL" -f "$migration"
  echo "  Done."
done

echo "================================"
echo "All migrations completed successfully!"
