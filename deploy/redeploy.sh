#!/bin/bash
# ============================================================
# REDEPLOY — atualiza a aplicação sem reinstalar tudo
# Rodar como root: bash redeploy.sh
# ============================================================
set -e
APP_DIR="/srv/doafacil"

echo "📦 Atualizando código..."
cd "$APP_DIR" && git pull

echo "🔨 Rebuild backend..."
cd "$APP_DIR/backend"
npm install --production=false
npx prisma db push --accept-data-loss
npm run build 2>/dev/null || npx tsc --skipLibCheck

echo "🔨 Rebuild frontend..."
cd "$APP_DIR"
npm install
npm run build

echo "♻️  Reiniciando processos..."
pm2 restart doafacil-backend
pm2 restart doafacil-frontend

echo "✅ Redeploy concluído!"
pm2 list
