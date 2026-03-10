#!/usr/bin/env bash
# =============================================================================
# OUTE - Database Reset Script
# =============================================================================
# Drops and recreates the database, then runs migrations and seeds.
# Usage: ./database/reset.sh
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load .env.local if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DATABASE_URL="${DATABASE_URL:-postgresql://app-user:dev-password@localhost:5432/oute_db}"

# Parse DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

echo -e "${YELLOW}WARNING: This will DROP and RECREATE database '${DB_NAME}'${NC}"
echo -e "Host: ${DB_HOST}:${DB_PORT}"
echo ""
read -p "Are you sure? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo -e "\n${YELLOW}[1/4] Dropping database...${NC}"
PGPASSWORD="$DB_PASS" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$DB_NAME"
echo -e "${GREEN}  ✓ Dropped${NC}"

echo -e "${YELLOW}[2/4] Creating database...${NC}"
PGPASSWORD="$DB_PASS" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
echo -e "${GREEN}  ✓ Created${NC}"

echo -e "${YELLOW}[3/4] Running migrations...${NC}"
DATABASE_URL="$DATABASE_URL" node database/migrate.mjs

echo -e "${YELLOW}[4/4] Running seeds...${NC}"
DATABASE_URL="$DATABASE_URL" node database/seed.mjs

echo -e "\n${GREEN}✓ Database reset complete${NC}"
