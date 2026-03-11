#!/bin/bash

# 🚀 Complete Production Setup Script for 99_home and 03_interview
# Run this on the VM at ~/oute-mind after pulling latest oute-main

set -e

echo "🚀 OUTE Production Setup for 99_home and 03_interview"
echo "====================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Verify we're in the right directory
echo -e "${BLUE}Step 1: Verifying environment...${NC}"
if [ ! -f "docker-compose.yml" ]; then
  echo -e "${YELLOW}❌ docker-compose.yml not found in current directory${NC}"
  echo "Make sure you're in ~/oute-mind"
  exit 1
fi

if [ ! -d "../oute-main" ]; then
  echo -e "${YELLOW}❌ ../oute-main directory not found${NC}"
  echo "Make sure oute-main is cloned next to oute-mind"
  exit 1
fi

echo -e "${GREEN}✅ In correct directory: $(pwd)${NC}"
echo -e "${GREEN}✅ oute-main found at: ../oute-main${NC}"
echo ""

# Step 2: Backup current files
echo -e "${BLUE}Step 2: Backing up current configuration...${NC}"
cp docker-compose.yml docker-compose.yml.backup.$(date +%s)
echo -e "${GREEN}✅ Backed up docker-compose.yml${NC}"

if [ -f "Caddyfile" ]; then
  cp Caddyfile Caddyfile.backup.$(date +%s)
  echo -e "${GREEN}✅ Backed up Caddyfile${NC}"
fi
echo ""

# Step 3: Add 99_home and 03_interview to docker-compose.yml
echo -e "${BLUE}Step 3: Adding 99_home and 03_interview services...${NC}"

# Check if services already exist
if grep -q "99_home:" docker-compose.yml; then
  echo -e "${YELLOW}⚠️  99_home already in docker-compose.yml, skipping${NC}"
else
  # Find the line before "volumes:" and insert new services
  sed -i.bak '/^volumes:/i\
  99_home:\
    build:\
      context: ../oute-main\
      dockerfile: packages/99_home/Dockerfile\
    container_name: oute-home\
    ports:\
      - '"'"'3003:3003'"'"'\
    environment:\
      - NODE_ENV=production\
      - VITE_AUTH_SERVICE_URL=http://34.132.93.171\
      - VITE_API_TIMEOUT=30000\
    networks:\
      - oute-network\
    restart: unless-stopped\
\
  03_interview:\
    build:\
      context: ../oute-main\
      dockerfile: packages/03_interview/Dockerfile\
    container_name: oute-interview\
    ports:\
      - '"'"'3002:3002'"'"'\
    environment:\
      - NODE_ENV=production\
      - VITE_AUTH_SERVICE_URL=http://34.132.93.171\
      - VITE_API_TIMEOUT=30000\
    networks:\
      - oute-network\
    restart: unless-stopped\
' docker-compose.yml

  echo -e "${GREEN}✅ Added 99_home and 03_interview to docker-compose.yml${NC}"
fi
echo ""

# Step 4: Check if Caddyfile needs update
echo -e "${BLUE}Step 4: Checking Caddyfile configuration...${NC}"

if grep -q "@root path /" Caddyfile 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Root routing already configured, skipping Caddyfile update${NC}"
else
  echo -e "${YELLOW}ℹ️  Caddyfile needs manual update - see instructions below${NC}"
fi
echo ""

# Step 5: Build services
echo -e "${BLUE}Step 5: Building Docker images...${NC}"
echo "This may take 3-5 minutes..."
echo ""

docker compose build 99_home 03_interview

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 6: Start services
echo -e "${BLUE}Step 6: Starting services...${NC}"
docker compose up -d 99_home 03_interview

echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 7: Reload Caddy
echo -e "${BLUE}Step 7: Reloading Caddy reverse proxy...${NC}"
docker compose up -d caddy

echo -e "${GREEN}✅ Caddy reloaded${NC}"
echo ""

# Step 8: Verify deployment
echo -e "${BLUE}Step 8: Verifying deployment...${NC}"
echo ""

echo "Waiting for services to be healthy (30 seconds)..."
sleep 30

echo "Service status:"
docker compose ps | grep -E "(oute-home|oute-interview|oute-caddy|oute-auth|oute-dashboard|oute-projects)" || true

echo ""
echo "Health checks:"

# Test 99_home
if curl -sf http://localhost:3003/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 99_home (port 3003) is healthy${NC}"
else
  echo -e "${YELLOW}⚠️  99_home (port 3003) not responding${NC}"
fi

# Test 03_interview
if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 03_interview (port 3002) is healthy${NC}"
else
  echo -e "${YELLOW}⚠️  03_interview (port 3002) not responding${NC}"
fi

# Test via Caddy
if curl -sf http://localhost:80 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Caddy reverse proxy is healthy (port 80)${NC}"
else
  echo -e "${YELLOW}⚠️  Caddy reverse proxy not responding${NC}"
fi

echo ""
echo "====================================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "====================================================="
echo ""
echo "📍 Services are now running:"
echo "  🏠 Landing Page (99_home):  http://localhost:3003"
echo "  💬 Chat (03_interview):     http://localhost:3002"
echo "  🔐 Auth API:                http://localhost:3021"
echo "  📊 Dashboard:               http://localhost:3020"
echo "  📁 Projects:                http://localhost:3022"
echo ""
echo "🌐 Via Caddy (public):"
echo "  🏠 Landing Page:  http://34.132.93.171/"
echo "  💬 Chat:          http://34.132.93.171/chat"
echo "  🔐 Auth:          http://34.132.93.171/api/auth"
echo ""
echo "⚠️  IMPORTANT: You still need to update the Caddyfile!"
echo "====================================================="
echo ""
echo "Read the instructions below to complete Caddyfile setup..."
echo ""

