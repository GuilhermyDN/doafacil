#!/bin/bash
# ============================================================
# SCRIPT DE SETUP — DoaFácil / Humanity Bearers
# Rodar como root: bash setup-server.sh
# ============================================================
set -e

echo "🚀 Iniciando setup do servidor..."

# ── 1. Pacotes base ───────────────────────────────────────
apt-get update -qq
apt-get install -y curl git nginx postgresql postgresql-contrib openssl ufw 2>/dev/null

# ── 2. Node.js 20 via NodeSource ──────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. PM2 global ────────────────────────────────────────
npm install -g pm2

# ── 4. PostgreSQL — criar banco e usuário ─────────────────
PG_USER="doafacil"
PG_PASS="$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 24)"
PG_DB="doafacil"

sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';" 2>/dev/null || echo "Usuário já existe"
sudo -u postgres psql -c "CREATE DATABASE $PG_DB OWNER $PG_USER;" 2>/dev/null || echo "Banco já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DB TO $PG_USER;" 2>/dev/null

DATABASE_URL="postgresql://$PG_USER:$PG_PASS@localhost:5432/$PG_DB"
echo "✅ PostgreSQL: $DATABASE_URL"

# ── 5. Clonar repositório ─────────────────────────────────
APP_DIR="/srv/doafacil"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" && git pull
else
  git clone https://github.com/GuilhermyDN/doafacil.git "$APP_DIR"
fi
cd "$APP_DIR"

# ── 6. .env do backend ────────────────────────────────────
JWT_SECRET="$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)"

cat > "$APP_DIR/backend/.env" <<EOF
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
PORT=3003
NODE_ENV="production"
NEXT_PUBLIC_URL="http://187.127.8.253"
# ⚠️  Substitua pelos tokens reais do Mercado Pago:
MP_ACCESS_TOKEN=APP_USR-769372989360967-032602-ff62ca18b314746cb90c7b81bc74e8fd-3294588124
MP_CLIENT_ID=769372989360967
MP_CLIENT_SECRET=jyCoVLRpzEAwE8ifTSa8cVMkyPohfiU6
MP_PUBLIC_KEY=APP_USR-0fb43f65-7e10-43ae-ab90-ef5720ebbeb0
MP_REDIRECT_URI=http://187.127.8.253/api/mp/callback
NEXT_PUBLIC_API_URL=http://187.127.8.253/api
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-0fb43f65-7e10-43ae-ab90-ef5720ebbeb0
ADMIN_PASSWORD=humanity2026
EOF

# ── 7. .env.local do frontend ─────────────────────────────
cat > "$APP_DIR/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://187.127.8.253/api
NEXT_PUBLIC_URL=http://187.127.8.253
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-0fb43f65-7e10-43ae-ab90-ef5720ebbeb0
EOF

# ── 8. Instalar dependências e buildar ────────────────────
cd "$APP_DIR/backend"
npm install --production=false
npx prisma db push --accept-data-loss
npm run build 2>/dev/null || npx tsc --skipLibCheck

cd "$APP_DIR"
npm install
npm run build

# ── 9. PM2 — iniciar backend e frontend ──────────────────
cd "$APP_DIR/backend"
pm2 delete doafacil-backend 2>/dev/null || true
pm2 start dist/index.js --name doafacil-backend --env production

cd "$APP_DIR"
pm2 delete doafacil-frontend 2>/dev/null || true
pm2 start npm --name doafacil-frontend -- start -- -p 3000

pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

# ── 10. Nginx ─────────────────────────────────────────────
cat > /etc/nginx/sites-available/doafacil <<'NGINX'
server {
    listen 80;
    server_name 187.127.8.253 _;

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3003/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/doafacil /etc/nginx/sites-enabled/doafacil
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ── 11. Firewall básico ───────────────────────────────────
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "============================================"
echo "✅ Setup concluído!"
echo "   Frontend: http://187.127.8.253"
echo "   API:      http://187.127.8.253/api/health"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   JWT_SECRET: $JWT_SECRET"
echo ""
echo "⚠️  SALVE as credenciais acima!"
echo "============================================"
