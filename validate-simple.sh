#!/bin/bash

# 🧪 Simple Validation Script for Production Integration
echo "🧪 VALIDATING PRODUCTION INTEGRATION SETUP"
echo "==========================================="
echo ""

PASSED=0
FAILED=0

check_file() {
  if test -f "$1"; then
    echo "✅ $1"
    PASSED=$((PASSED + 1))
  else
    echo "❌ $1 MISSING"
    FAILED=$((FAILED + 1))
  fi
}

check_pattern() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo "✅ $1 contains: $2"
    PASSED=$((PASSED + 1))
  else
    echo "❌ $1 missing: $2"
    FAILED=$((FAILED + 1))
  fi
}

echo "📁 FILES CREATED"
echo "================"
check_file "packages/99_home/src/lib/auth.ts"
check_file "packages/99_home/.env.production"
check_file "packages/03_interview/.env.production"
check_file "packages/01_auth-profile/.env.production"
echo ""

echo "🔧 CORS CONFIGURATION"
echo "===================="
check_pattern "packages/01_auth-profile/src/hooks.server.ts" "Access-Control-Allow-Origin"
check_pattern "packages/01_auth-profile/src/hooks.server.ts" "34.132.93.171"
echo ""

echo "🔐 AUTHENTICATION"
echo "================"
check_pattern "packages/99_home/src/lib/auth.ts" "export async function login"
check_pattern "packages/99_home/src/lib/auth.ts" "VITE_AUTH_SERVICE_URL"
check_pattern "packages/99_home/src/routes/login/+page.svelte" "await login"
echo ""

echo "🧭 NAVIGATION"
echo "============="
check_pattern "packages/99_home/src/routes/+page.svelte" "function handleCTA"
check_pattern "packages/99_home/src/routes/+page.svelte" "getToken"
check_pattern "packages/99_home/src/routes/+page.svelte" "goto"
echo ""

echo "⚙️  ENVIRONMENT VARIABLES"
echo "======================="
check_pattern "packages/99_home/.env.production" "VITE_AUTH_SERVICE_URL"
check_pattern "packages/03_interview/.env.production" "VITE_AUTH_SERVICE_URL"
check_pattern "packages/01_auth-profile/.env.production" "DATABASE_URL"
check_pattern "packages/01_auth-profile/.env.production" "JWT_SECRET"
echo ""

echo "📊 RESULTS"
echo "=========="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "🎉 ALL CHECKS PASSED! Ready for testing."
  exit 0
else
  echo "⚠️  $FAILED checks failed. Review above."
  exit 1
fi
