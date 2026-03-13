#!/bin/bash

# 🔍 Diagnose Production Issues
# Run this on the VM to troubleshoot routing problems

echo "🔍 OUTE Production Diagnostics"
echo "=============================="
echo ""

# Step 1: Check containers
echo "📦 Step 1: Checking Docker Containers"
echo "======================================"
docker compose ps
echo ""

# Step 2: Check specific services
echo "🏠 99_home status:"
docker compose ps 99_home 2>&1 || echo "❌ Service not found"
echo ""

echo "💬 03_interview status:"
docker compose ps 03_interview 2>&1 || echo "❌ Service not found"
echo ""

# Step 3: Test direct endpoints
echo "🧪 Step 2: Testing Direct Endpoints"
echo "====================================="

echo "Testing 99_home (port 3003)..."
if curl -sf http://localhost:3003/health > /dev/null 2>&1; then
  echo "✅ 99_home responds on 3003"
  curl -s http://localhost:3003/ | head -c 200
  echo ""
else
  echo "❌ 99_home NOT responding on 3003"
fi
echo ""

echo "Testing 03_interview (port 3002)..."
if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
  echo "✅ 03_interview responds on 3002"
else
  echo "❌ 03_interview NOT responding on 3002"
fi
echo ""

# Step 4: Check Caddy
echo "🔄 Step 3: Checking Caddy"
echo "=========================="
docker compose ps caddy
echo ""

echo "Caddy logs (last 20 lines):"
docker compose logs --tail=20 caddy
echo ""

# Step 5: Check Caddyfile
echo "📝 Step 4: Checking Caddyfile"
echo "============================="

if [ -f "Caddyfile" ]; then
  echo "✅ Caddyfile exists"
  echo ""
  echo "Root routing configuration:"
  grep -A 5 "@root" Caddyfile || echo "❌ No @root pattern found"
  echo ""
else
  echo "❌ Caddyfile not found!"
fi
echo ""

# Step 6: Test via Caddy
echo "🌐 Step 5: Testing via Caddy (Port 80)"
echo "======================================"

echo "Testing root (/)..."
RESPONSE=$(curl -s http://localhost:80/)
if echo "$RESPONSE" | grep -q "Software Estimator\|API\|health"; then
  echo "⚠️  Still getting API response at root"
  echo "Response preview:"
  echo "$RESPONSE" | head -c 300
  echo ""
else
  echo "✅ Root returns HTML"
fi
echo ""

# Step 7: Recommendations
echo "💡 Step 6: Recommendations"
echo "=========================="

if ! docker compose ps 99_home 2>&1 | grep -q "Up"; then
  echo "❌ 99_home is NOT running!"
  echo ""
  echo "FIX: Run this command:"
  echo "  docker compose up -d 99_home"
  echo ""
fi

if ! docker compose ps 03_interview 2>&1 | grep -q "Up"; then
  echo "❌ 03_interview is NOT running!"
  echo ""
  echo "FIX: Run this command:"
  echo "  docker compose up -d 03_interview"
  echo ""
fi

if ! grep -q "@root" Caddyfile 2>/dev/null; then
  echo "❌ Caddyfile is NOT configured!"
  echo ""
  echo "FIX: Run this command:"
  echo "  ./update-caddyfile.sh"
  echo ""
fi

echo ""
echo "📖 Need more help? Check the logs:"
echo "  docker compose logs 99_home"
echo "  docker compose logs 03_interview"
echo "  docker compose logs caddy"
echo ""

