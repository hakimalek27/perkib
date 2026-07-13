#!/usr/bin/env bash
# Deploy PERKIB ke pelayan Linux (Next.js standalone).
# Guna: DEPLOY_HOST=ubuntu@1.2.3.4 ./deploy/deploy.sh
#
# ⚠️ Deploy ke pelayan/domain KHUSUS PERKIB. JANGAN co-locate di pelayan
#    produksi kariah/mamkl.my tanpa runbook.
#
# Prasyarat (sekali sahaja) di pelayan:
#   - Node 20+, nginx, systemd
#   - /etc/perkib/.env  (dari production.env.example; chmod 600) — TERMASUK DATA_ENCRYPTION_KEY
#   - /etc/perkib/staf-lain.enc.json  (pindah scp: private-data/staf-lain.enc.json)
#   - /srv/perkib/staf-foto/  (foto staf, jika guna direktori staf)
#   - deploy/perkib.service → /etc/systemd/system/  (systemctl enable perkib)
#   - deploy/nginx-perkib.conf → /etc/nginx/sites-available/ + certbot

set -euo pipefail

: "${DEPLOY_HOST:?Tetapkan DEPLOY_HOST=ubuntu@IP}"
REMOTE_DIR="${REMOTE_DIR:-/srv/perkib}"
RELEASE="$REMOTE_DIR/releases/$(date +%Y%m%d-%H%M%S 2>/dev/null || echo manual)"

echo "▶ Build..."
npm ci
npm run build

echo "▶ Himpun bundle standalone..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "▶ Rsync ke $DEPLOY_HOST:$RELEASE ..."
ssh "$DEPLOY_HOST" "mkdir -p '$RELEASE'"
rsync -az --delete .next/standalone/ "$DEPLOY_HOST:$RELEASE/"

echo "▶ Tukar symlink 'current' + restart..."
ssh "$DEPLOY_HOST" "ln -sfn '$RELEASE' '$REMOTE_DIR/current' && sudo systemctl restart perkib && sleep 2 && systemctl is-active perkib"

echo "✅ Deploy selesai → $RELEASE (current)."
echo "   Semak: curl -I https://perkib.my"
