#!/usr/bin/env bash
# ============================================================
#  Production deployment script - Baie des Singes / Bénévoles
#  - Robust error handling
#  - PM2 detection & startup fixed
#  - Non-root app user (least privilege)
#  - npm ci fallback when no lockfile
#  - NGINX configuration removed
# ============================================================

set -Eeuo pipefail
trap 'echo -e "\033[0;31m✗ Error on line $LINENO. Aborting.\033[0m" >&2' ERR

# -------- Colors --------
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'

# -------- Defaults --------
APP_NAME="${APP_NAME:-baienevole}"
DEFAULT_APP_DIR="${DEFAULT_APP_DIR:-/var/www/baienevole}"
REPO_URL_DEFAULT="https://github.com/sebdam1010-del/baienevole.git"
REPO_URL="${REPO_URL:-$REPO_URL_DEFAULT}"
NODE_VERSION_MAJOR="${NODE_VERSION:-18}"

DOMAIN=""      # défini à la config
APP_DIR=""     # défini à la config
USE_SSH=false

# Run user (non-root) pour l'app/PM2 ; utilise le sudo caller s'il existe
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-$(id -un)}}"
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"

print_step()    { echo -e "\n${BLUE}==>${NC} $*"; }
print_success() { echo -e "${GREEN}✓${NC} $*"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $*"; }
print_error()   { echo -e "${RED}✗${NC} $*"; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    print_error "Ce script doit être exécuté en tant que root (sudo)."
    exit 1
  fi
}

# ---------- PM2 resolution (KEY FIX) ----------
# Trouve un binaire pm2 utilisable et exporte PM2
resolve_pm2() {
  local bin=""
  bin="$(command -v pm2 || true)"

  # Essaye le npm -g bin du contexte courant (root)
  if [[ -z "${bin}" ]]; then
    local npm_g_bin
    npm_g_bin="$(npm -g bin 2>/dev/null || true)"
    if [[ -n "${npm_g_bin}" && -x "${npm_g_bin}/pm2" ]]; then
      export PATH="${npm_g_bin}:$PATH"
      bin="${npm_g_bin}/pm2"
    fi
  fi

  # Essaye le npm -g bin de l'utilisateur applicatif
  if [[ -z "${bin}" && -n "${DEPLOY_USER}" ]]; then
    local user_npm_bin
    user_npm_bin="$(sudo -H -u "$DEPLOY_USER" bash -lc 'npm -g bin 2>/dev/null || true')"
    if [[ -n "${user_npm_bin}" && -x "${user_npm_bin}/pm2" ]]; then
      bin="${user_npm_bin}/pm2"
    fi
  fi

  # Emplacements usuels
  for p in "/usr/local/bin/pm2" "/usr/bin/pm2" "${DEPLOY_HOME}/.npm-global/bin/pm2"; do
    [[ -z "${bin}" && -x "$p" ]] && bin="$p"
  done

  # Installe globalement si toujours introuvable
  if [[ -z "${bin}" ]]; then
    print_warning "PM2 introuvable. Installation globale via npm..."
    npm install -g pm2
    hash -r
    bin="$(command -v pm2 || true)"
    if [[ -z "${bin}" ]]; then
      local npm_g_bin2
      npm_g_bin2="$(npm -g bin 2>/dev/null || true)"
      if [[ -n "${npm_g_bin2}" && -x "${npm_g_bin2}/pm2" ]]; then
        export PATH="${npm_g_bin2}:$PATH"
        bin="${npm_g_bin2}/pm2"
      fi
    fi
  fi

  if [[ -z "${bin}" ]]; then
    print_error "Impossible de localiser ou d'installer pm2. Vérifie npm et le réseau."
    exit 1
  fi

  export PM2="${bin}"
  print_success "PM2 détecté: ${PM2}"
}

check_prerequisites() {
  print_step "Vérification des prérequis..."

  # Node.js
  if ! command -v node >/dev/null 2>&1; then
    print_warning "Node.js non installé. Installation Node ${NODE_VERSION_MAJOR}..."
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION_MAJOR}.x" | bash -
    apt-get install -y nodejs
  fi
  local detected_major
  detected_major="$(node -v | cut -d'.' -f1 | sed 's/v//')"
  if (( detected_major < NODE_VERSION_MAJOR )); then
    print_warning "Node v${detected_major} détecté. Recommandé: v${NODE_VERSION_MAJOR}+."
  else
    print_success "Node $(node -v) OK"
  fi

  # npm
  if ! command -v npm >/dev/null 2>&1; then
    print_error "npm non trouvé après installation de Node."
    exit 1
  fi
  print_success "npm $(npm -v) OK"

  # pm2
  resolve_pm2

  # git
  if ! command -v git >/dev/null 2>&1; then
    print_warning "Git non installé. Installation..."
    apt-get install -y git
  fi
  print_success "Git OK"
}

configure_installation() {
  print_step "Configuration de l'installation..."

  echo -e "\n${YELLOW}Dossier d'installation:${NC}"
  read -r -p "Où installer l'application? (défaut: ${DEFAULT_APP_DIR}): " APP_DIR_INPUT || true
  APP_DIR="${APP_DIR_INPUT:-$DEFAULT_APP_DIR}"

  local PARENT_DIR
  PARENT_DIR="$(dirname "$APP_DIR")"
  if [[ ! -d "$PARENT_DIR" ]]; then
    print_warning "Le dossier parent ${PARENT_DIR} n'existe pas."
    read -r -p "Le créer ? (Y/n): " -n 1 REPLY || true; echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      mkdir -p "$PARENT_DIR"
      chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$PARENT_DIR"
      print_success "Dossier parent créé"
    else
      print_error "Installation annulée"
      exit 1
    fi
  fi
  print_success "Dossier d'installation: ${APP_DIR}"

  echo -e "\n${YELLOW}Méthode Git:${NC}
  1) HTTPS (simple)
  2) SSH (clé requise)"
  read -r -p "Votre choix (1/2, défaut: 1): " GIT_METHOD || true
  GIT_METHOD="${GIT_METHOD:-1}"

  if [[ "$GIT_METHOD" == "2" ]]; then
    USE_SSH=true
    REPO_URL="git@github.com:sebdam1010-del/baienevole.git"
    print_success "Utilisation SSH pour Git"
  else
    REPO_URL="$REPO_URL_DEFAULT"
    print_success "Utilisation HTTPS pour Git"
  fi
}

setup_repository() {
  print_step "Configuration du repository..."

  if [[ -d "$APP_DIR/.git" ]]; then
    print_step "Pull des mises à jour..."
    git -C "$APP_DIR" fetch origin
    git -C "$APP_DIR" pull --rebase --autostash origin main
    print_success "Repository mis à jour"
  else
    print_step "Clonage du repository..."
    sudo -H -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"
    print_success "Repository cloné"
  fi

  chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"
}

configure_env() {
  print_step "Configuration de l'environnement..."
  if [[ -f "${APP_DIR}/.env" ]]; then
    print_warning ".env existe déjà"
    read -r -p "Le remplacer ? (y/N): " -n 1 REPLY || true; echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_success ".env conservé"
      return
    fi
  fi

  read -r -p "JWT_SECRET (vide = auto): " JWT_SECRET || true
  if [[ -z "${JWT_SECRET:-}" ]]; then
    JWT_SECRET="$(openssl rand -base64 32)"
    print_success "JWT_SECRET généré"
  fi

  echo -e "\n${YELLOW}Configuration réseau:${NC}"
  echo "Le frontend React sera servi par le backend Express sur le même port."
  echo "Pas besoin de configurer deux ports séparés."
  echo ""
  read -r -p "Port de l'application (défaut 3000): " APP_PORT || true
  APP_PORT="${APP_PORT:-3000}"
  read -r -p "Nom de domaine (ex: baienevole.com, vide pour local): " DOMAIN || true

  read -r -p "SMTP Host: " SMTP_HOST || true
  read -r -p "SMTP Port (défaut 587): " SMTP_PORT || true
  SMTP_PORT="${SMTP_PORT:-587}"
  read -r -p "SMTP User: " SMTP_USER || true
  read -r -p "SMTP Password: " -s SMTP_PASS || true; echo
  read -r -p "Email expéditeur (ex: noreply@${DOMAIN}): " SMTP_FROM || true

  local FRONTEND_URL="http://localhost:${APP_PORT}"
  [[ -n "${DOMAIN:-}" ]] && FRONTEND_URL="https://${DOMAIN}"

  install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /dev/null "${APP_DIR}/.env"
  cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
DATABASE_URL="file:./prisma/prod.db"
JWT_SECRET=${JWT_SECRET}
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM="${SMTP_FROM}"
FRONTEND_URL=${FRONTEND_URL}
EOF

  print_success ".env écrit"
}

install_dependencies() {
  print_step "Installation des dépendances..."

  # Backend deps
  print_step "Backend deps..."
  sudo -H -u "$DEPLOY_USER" bash -lc '
    set -e
    cd "'"$APP_DIR"'"
    if [[ -f package-lock.json || -f npm-shrinkwrap.json ]]; then
      npm ci --omit=dev
    else
      npm install --production
    fi
  '
  print_success "Dépendances backend OK"

  # Frontend deps
  if [[ -d "$APP_DIR/client" ]]; then
    print_step "Frontend deps..."
    sudo -H -u "$DEPLOY_USER" bash -lc '
      set -e
      cd "'"$APP_DIR"'/client"
      if [[ -f package-lock.json || -f npm-shrinkwrap.json ]]; then
        npm ci
      else
        npm install
      fi
    '
    print_success "Dépendances frontend OK"
  fi
}

setup_database() {
  print_step "Configuration base de données (Prisma)..."
  sudo -H -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && npx prisma generate"
  if [[ ! -f "$APP_DIR/prisma/prod.db" ]]; then
    print_step "Création DB..."
    sudo -H -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && npx prisma db push"
    print_success "DB créée"
  else
    print_step "Migrations..."
    sudo -H -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && npx prisma db push"
    print_success "Migrations appliquées"
  fi
}

build_frontend() {
  if [[ -d "$APP_DIR/client" ]]; then
    print_step "Build frontend..."
    sudo -H -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR/client' && npm run build"
    print_success "Frontend buildé"
  fi
}

setup_pm2() {
  print_step "Configuration PM2..."

  # Logs
  mkdir -p "${APP_DIR}/logs"
  chown -R "$DEPLOY_USER":"$DEPLOY_USER" "${APP_DIR}/logs"

  # ecosystem.config.js par défaut si absent
  if [[ ! -f "${APP_DIR}/ecosystem.config.js" ]]; then
    cat > "${APP_DIR}/ecosystem.config.js" <<'EOF'
module.exports = {
  apps: [
    {
      name: "baienevole",
      script: "server.js",
      cwd: __dirname,
      env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      time: true,
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
EOF
    chown "$DEPLOY_USER":"$DEPLOY_USER" "${APP_DIR}/ecosystem.config.js"
    print_success "ecosystem.config.js créé"
  fi

  # Stop existant si besoin
  sudo -H -u "$DEPLOY_USER" bash -lc "'$PM2' list | grep -q '${APP_NAME}' && '$PM2' delete '${APP_NAME}' || true"

  # Start & save sous l'utilisateur applicatif
  sudo -H -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && '$PM2' start ecosystem.config.js --only '${APP_NAME}' --env production"
  sudo -H -u "$DEPLOY_USER" bash -lc "'$PM2' save"

  # Startup au boot (DOIT être lancé en root, avec PATH de node/pm2)
  print_step "Activation du démarrage auto PM2..."
  local NODE_BIN; NODE_BIN="$(dirname "$(command -v node)")"
  local PM2_BIN_DIR; PM2_BIN_DIR="$(dirname "$PM2")"
  env PATH="$PATH:$NODE_BIN:$PM2_BIN_DIR" "$PM2" startup systemd -u "$DEPLOY_USER" --hp "$DEPLOY_HOME" || {
    print_warning "pm2 startup a retourné un code ≠ 0. Si besoin, copie/colle la commande affichée par PM2, puis exécute 'pm2 save' en tant que ${DEPLOY_USER}."
  }

  print_success "Application démarrée via PM2 (user: ${DEPLOY_USER})"
}

setup_backup_cron() {
  print_step "Configuration backups..."
  mkdir -p "${APP_DIR}/backups" "${APP_DIR}/scripts" "${APP_DIR}/logs"
  chown -R "$DEPLOY_USER":"$DEPLOY_USER" "${APP_DIR}/backups" "${APP_DIR}/scripts" "${APP_DIR}/logs"

  if ! crontab -l -u "$DEPLOY_USER" 2>/dev/null | grep -q "${APP_DIR}/scripts/backup.sh"; then
    if [[ -f "${APP_DIR}/scripts/backup.sh" ]]; then
      chmod +x "${APP_DIR}/scripts/backup.sh"
      (crontab -l -u "$DEPLOY_USER" 2>/dev/null; echo "0 2 * * * ${APP_DIR}/scripts/backup.sh >> ${APP_DIR}/logs/backup.log 2>&1") | crontab -u "$DEPLOY_USER" -
      print_success "Backup quotidien (2h00) configuré pour ${DEPLOY_USER}"
    else
      print_warning "scripts/backup.sh introuvable, cron non ajouté."
    fi
  else
    print_warning "Cron de backup déjà présent"
  fi
}

setup_reminders_cron() {
  print_step "Configuration rappels email..."
  if ! crontab -l -u "$DEPLOY_USER" 2>/dev/null | grep -q "reminders:send"; then
    (crontab -l -u "$DEPLOY_USER" 2>/dev/null; echo "0 10 * * * cd ${APP_DIR} && npm run reminders:send >> ${APP_DIR}/logs/reminders.log 2>&1") | crontab -u "$DEPLOY_USER" -
    print_success "Rappels quotidiens (10h00) configurés"
  else
    print_warning "Cron de rappels déjà présent"
  fi
}

show_summary() {
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}  Déploiement terminé avec succès! 🎉${NC}"
  echo -e "${GREEN}========================================${NC}\n"

  echo -e "${BLUE}Infos:${NC}"
  echo -e "  📁 Répertoire:     ${APP_DIR}"
  echo -e "  👤 User PM2:       ${DEPLOY_USER}"
  echo -e "  🚀 Port:           ${APP_PORT}"
  echo -e "  📦 Architecture:   Frontend + Backend sur le même port"
  if [[ -n "${DOMAIN:-}" ]]; then
    echo -e "  🌐 URL:            https://${DOMAIN}"
    echo -e "  📝 Note:           Configurez votre reverse proxy (nginx/caddy) vers le port ${APP_PORT}"
  else
    echo -e "  🌐 URL:            http://localhost:${APP_PORT}"
  fi

  echo -e "\n${BLUE}Détails:${NC}"
  echo -e "  • Le backend Express sert également le frontend React buildé"
  echo -e "  • Routes API:      http://localhost:${APP_PORT}/api/*"
  echo -e "  • Frontend React:  http://localhost:${APP_PORT}/*"
  echo -e "  • API Docs:        http://localhost:${APP_PORT}/api-docs"

  echo -e "\n${BLUE}Commandes utiles:${NC}"
  echo -e "  sudo -H -u ${DEPLOY_USER} ${PM2} status"
  echo -e "  sudo -H -u ${DEPLOY_USER} ${PM2} logs ${APP_NAME}"
  echo -e "  sudo -H -u ${DEPLOY_USER} ${PM2} restart ${APP_NAME}"
  echo -e "  sudo -H -u ${DEPLOY_USER} ${PM2} reload ${APP_NAME}  # Zero downtime restart"
}

main() {
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════╗"
  echo "║   Déploiement Production - Baie des Singes ║"
  echo "║        Plateforme de Gestion Bénévoles     ║"
  echo "╚════════════════════════════════════════════╝"
  echo -e "${NC}\n"

  require_root
  check_prerequisites
  configure_installation
  setup_repository
  configure_env
  install_dependencies
  setup_database
  build_frontend
  setup_pm2
  setup_backup_cron
  setup_reminders_cron
  show_summary
}

main "$@"
