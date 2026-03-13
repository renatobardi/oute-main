#!/bin/bash

# 🧪 Validation Script for Production Integration
# Run this to validate all changes before deploying

set -e

echo "🧪 INICIANDO VALIDAÇÃO DA INTEGRAÇÃO EM PRODUÇÃO"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Function to check result
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASSOU${NC}: $1"
    ((PASSED++))
  else
    echo -e "${RED}❌ FALHOU${NC}: $1"
    ((FAILED++))
  fi
}

echo "📁 1. VERIFICANDO ARQUIVOS CRIADOS"
echo "===================================="

# Check auth.ts exists
test -f packages/99_home/src/lib/auth.ts
check_result "packages/99_home/src/lib/auth.ts existe"

# Check .env.production files
test -f packages/99_home/.env.production
check_result "packages/99_home/.env.production existe"

test -f packages/03_interview/.env.production
check_result "packages/03_interview/.env.production existe"

test -f packages/01_auth-profile/.env.production
check_result "packages/01_auth-profile/.env.production existe"

echo ""
echo "📝 2. VERIFICANDO CONTEÚDO DOS ARQUIVOS"
echo "========================================="

# Check auth.ts has login function
grep -q "export async function login" packages/99_home/src/lib/auth.ts
check_result "auth.ts contém função login()"

# Check CORS in hooks.server.ts
grep -q "Access-Control-Allow-Origin" packages/01_auth-profile/src/hooks.server.ts
check_result "hooks.server.ts contém CORS middleware"

# Check login page imports auth
grep -q "import { login } from '\$lib/auth'" packages/99_home/src/routes/login/+page.svelte
check_result "login/+page.svelte importa função login"

# Check home page has handleCTA
grep -q "function handleCTA" packages/99_home/src/routes/+page.svelte
check_result "+page.svelte contém função handleCTA()"

# Check CTAButton component
grep -q "on:click" packages/99_home/src/lib/components/CTAButton.svelte
check_result "CTAButton.svelte suporta on:click handler"

echo ""
echo "🔍 3. VERIFICANDO VARIÁVEIS DE AMBIENTE"
echo "======================================="

# Check VITE_AUTH_SERVICE_URL in 99_home
grep -q "VITE_AUTH_SERVICE_URL" packages/99_home/.env.production
check_result "99_home/.env.production tem VITE_AUTH_SERVICE_URL"

# Check VITE_AUTH_SERVICE_URL in 03_interview
grep -q "VITE_AUTH_SERVICE_URL" packages/03_interview/.env.production
check_result "03_interview/.env.production tem VITE_AUTH_SERVICE_URL"

# Check DATABASE_URL in auth
grep -q "DATABASE_URL" packages/01_auth-profile/.env.production
check_result "01_auth-profile/.env.production tem DATABASE_URL"

# Check JWT_SECRET in auth
grep -q "JWT_SECRET" packages/01_auth-profile/.env.production
check_result "01_auth-profile/.env.production tem JWT_SECRET"

echo ""
echo "✔️ 4. VERIFICANDO TYPESCRIPT (se disponível)"
echo "==========================================="

if command -v npm &> /dev/null; then
  # Check 99_home types
  cd packages/99_home
  npm run check > /dev/null 2>&1
  check_result "99_home: TypeScript types válido"
  cd - > /dev/null

  # Check auth-profile types
  cd packages/01_auth-profile
  npm run check > /dev/null 2>&1
  check_result "01_auth-profile: TypeScript types válido"
  cd - > /dev/null

  # Check interview types
  cd packages/03_interview
  npm run check > /dev/null 2>&1
  check_result "03_interview: TypeScript types válido"
  cd - > /dev/null
else
  echo -e "${YELLOW}⚠️  npm não encontrado, pulando verificação de types${NC}"
fi

echo ""
echo "🚀 5. VERIFICANDO GIT STATUS"
echo "============================"

# Check if we're on the right branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "feat/production-integration" ]; then
  echo -e "${GREEN}✅ PASSOU${NC}: Você está no branch feat/production-integration"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Você está no branch $CURRENT_BRANCH (esperado: feat/production-integration)${NC}"
fi

# Check if changes are committed
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
  echo -e "${GREEN}✅ PASSOU${NC}: Todas as mudanças foram commitadas"
  ((PASSED++))
else
  echo -e "${RED}❌ FALHOU${NC}: Existem $UNCOMMITTED mudanças não commitadas"
  ((FAILED++))
fi

echo ""
echo "=================================================="
echo "📊 RESULTADO FINAL"
echo "=================================================="
echo -e "${GREEN}✅ PASSOU: $PASSED${NC}"
echo -e "${RED}❌ FALHOU: $FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}🎉 VALIDAÇÃO COMPLETA! Pronto para deploy.${NC}"
  exit 0
else
  echo -e "${RED}❌ Existem problemas a corrigir antes de fazer deploy.${NC}"
  echo ""
  echo "📖 Para mais detalhes, consulte: VALIDATION_GUIDE.md"
  exit 1
fi
