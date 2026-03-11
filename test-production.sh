#!/bin/bash

# 🧪 Test Production Deployment
# Run this after setup-production.sh and update-caddyfile.sh

echo "🧪 Testing OUTE Production Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local url=$2

  if curl -sf "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $name"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌${NC} $name"
    FAILED=$((FAILED + 1))
  fi
}

test_http_code() {
  local name=$1
  local url=$2
  local expected_code=$3

  local response=$(curl -s -w "%{http_code}" -o /dev/null "$url")

  if [ "$response" = "$expected_code" ]; then
    echo -e "${GREEN}✅${NC} $name (HTTP $response)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌${NC} $name (HTTP $response, expected $expected_code)"
    FAILED=$((FAILED + 1))
  fi
}

echo "📍 Direct Service Tests (localhost)"
echo "===================================="
test_endpoint "99_home health" "http://localhost:3003/health"
test_endpoint "03_interview health" "http://localhost:3002/health"
test_endpoint "01_auth-profile health" "http://localhost:3021/health"
test_endpoint "00_dashboard health" "http://localhost:3020/health"
test_endpoint "02_projects health" "http://localhost:3022/health"
echo ""

echo "🔄 Reverse Proxy Tests (via Caddy)"
echo "====================================="
test_endpoint "Caddy health" "http://localhost:80/health"
test_http_code "Root path (/)" "http://localhost:80/" "200"
test_http_code "Chat path (/chat)" "http://localhost:80/chat" "200"
test_http_code "Auth API (/api/auth)" "http://localhost:80/api/auth" "200"
echo ""

echo "🌐 Public Domain Tests (34.132.93.171)"
echo "======================================"
test_http_code "Landing page (root)" "http://34.132.93.171/" "200"
test_http_code "Chat interface" "http://34.132.93.171/chat" "200"
test_http_code "Auth API" "http://34.132.93.171/api/auth" "200"
echo ""

echo "🐳 Docker Container Status"
echo "=========================="
echo ""
docker compose ps | grep -E "(oute-home|oute-interview|oute-caddy|oute-auth|oute-dashboard|oute-projects)" || echo "No containers found"
echo ""

echo "📊 Summary"
echo "=========="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! Production is ready.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed. Check logs with:${NC}"
  echo "  docker compose logs 99_home"
  echo "  docker compose logs 03_interview"
  echo "  docker compose logs caddy"
  exit 1
fi

