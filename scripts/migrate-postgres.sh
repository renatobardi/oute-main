#!/usr/bin/env bash
# migrate-postgres.sh
#
# Migra o banco oute_main do postgres compartilhado (oute-postgres)
# para o novo container dedicado (oute-main-postgres).
#
# Pré-condições:
#   - oute-postgres está rodando (stack oute-mind)
#   - oute-main-postgres está rodando (stack oute-main)
#
# Uso: sudo bash migrate-postgres.sh
#      sudo bash migrate-postgres.sh --dry-run   (só valida, não migra)
#
set -euo pipefail

SRC_CONTAINER="oute-postgres"
SRC_DB="oute_main"
SRC_USER="app-user"
SRC_PASS="dev-password"   # senha do postgres dev/compartilhado

DST_CONTAINER="oute-main-postgres"
DST_DB="oute_main"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN — nenhuma alteração será feita ==="
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

check_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
    echo "ERRO: container '${name}' não está rodando."
    echo "  Verifique: docker ps | grep ${name}"
    exit 1
  fi
  echo "OK: ${name} está rodando."
}

wait_healthy() {
  local name="$1"
  local max=30
  echo "Aguardando ${name} ficar healthy..."
  for i in $(seq 1 $max); do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "unknown")
    if [[ "$status" == "healthy" ]]; then
      echo "  ${name} healthy após ${i}s."
      return 0
    fi
    echo "  [${i}/${max}] status: ${status}..."
    sleep 2
  done
  echo "AVISO: ${name} não ficou healthy em $((max*2))s. Continuando mesmo assim."
}

# ── Validações ────────────────────────────────────────────────────────────────

echo ""
echo "=== Verificando containers ==="
check_container "$SRC_CONTAINER"
check_container "$DST_CONTAINER"
wait_healthy "$DST_CONTAINER"

echo ""
echo "=== Verificando banco de origem ==="
SRC_TABLES=$(docker exec -e PGPASSWORD="$SRC_PASS" "$SRC_CONTAINER" \
  psql -U "$SRC_USER" -d "$SRC_DB" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

echo "  Tabelas em ${SRC_CONTAINER}/${SRC_DB}: ${SRC_TABLES}"

echo ""
echo "=== Verificando banco de destino ==="
# Pega user/pass do oute-main-postgres via env do container
DST_USER=$(docker exec "$DST_CONTAINER" bash -c 'echo $POSTGRES_USER' 2>/dev/null || echo "app-user")
DST_PASS=$(docker exec "$DST_CONTAINER" bash -c 'echo $POSTGRES_PASSWORD' 2>/dev/null || echo "")

if [[ -z "$DST_PASS" ]]; then
  echo "ERRO: não foi possível ler POSTGRES_PASSWORD do container ${DST_CONTAINER}."
  echo "  Defina a variável manualmente: export DST_PASS='<senha>'"
  exit 1
fi

DST_TABLES=$(docker exec -e PGPASSWORD="$DST_PASS" "$DST_CONTAINER" \
  psql -U "$DST_USER" -d "$DST_DB" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

echo "  Tabelas em ${DST_CONTAINER}/${DST_DB}: ${DST_TABLES}"

if [[ "$DST_TABLES" -gt 0 ]]; then
  echo ""
  echo "AVISO: o banco de destino já tem ${DST_TABLES} tabela(s)."
  echo "  A migração vai sobrescrever os dados existentes."
  read -rp "  Continuar? [s/N] " confirm
  if [[ "${confirm,,}" != "s" ]]; then
    echo "Abortado."
    exit 0
  fi
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo "=== DRY RUN concluído — nenhuma migração executada ==="
  exit 0
fi

# ── Migração ──────────────────────────────────────────────────────────────────

DUMP_FILE="/tmp/oute_main_migration_$(date +%Y%m%d_%H%M%S).dump"

echo ""
echo "=== Exportando ${SRC_DB} de ${SRC_CONTAINER} ==="
docker exec -e PGPASSWORD="$SRC_PASS" "$SRC_CONTAINER" \
  pg_dump -U "$SRC_USER" -d "$SRC_DB" -Fc -v \
  | docker exec -i "$DST_CONTAINER" sh -c "cat > /tmp/migration.dump"

echo "Dump transferido para ${DST_CONTAINER}:/tmp/migration.dump"

echo ""
echo "=== Restaurando em ${DST_CONTAINER}/${DST_DB} ==="
# Limpa schema público antes de restaurar
docker exec -e PGPASSWORD="$DST_PASS" "$DST_CONTAINER" \
  psql -U "$DST_USER" -d "$DST_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>&1

docker exec -e PGPASSWORD="$DST_PASS" "$DST_CONTAINER" \
  pg_restore -U "$DST_USER" -d "$DST_DB" --no-owner --role="$DST_USER" -v /tmp/migration.dump 2>&1 | tail -20

# Limpa dump temporário
docker exec "$DST_CONTAINER" rm -f /tmp/migration.dump

# ── Verificação final ─────────────────────────────────────────────────────────

echo ""
echo "=== Verificação pós-migração ==="
FINAL_TABLES=$(docker exec -e PGPASSWORD="$DST_PASS" "$DST_CONTAINER" \
  psql -U "$DST_USER" -d "$DST_DB" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")

echo "  Tabelas após migração: ${FINAL_TABLES} (eram ${SRC_TABLES} na origem)"

echo ""
echo "=== Tabelas migradas ==="
docker exec -e PGPASSWORD="$DST_PASS" "$DST_CONTAINER" \
  psql -U "$DST_USER" -d "$DST_DB" -c \
  "SELECT tablename, pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

echo ""
echo "=== Migração concluída com sucesso! ==="
echo "  Origem : ${SRC_CONTAINER}/${SRC_DB} (${SRC_TABLES} tabelas)"
echo "  Destino: ${DST_CONTAINER}/${DST_DB} (${FINAL_TABLES} tabelas)"
echo ""
echo "Próximo passo: validar a aplicação e, se tudo OK, pode remover oute_main do oute-postgres:"
echo "  docker exec -e PGPASSWORD='${SRC_PASS}' ${SRC_CONTAINER} psql -U ${SRC_USER} -c 'DROP DATABASE oute_main;'"
