#!/bin/bash

#############################################
# Script de déploiement production
# Baie des Singes - Plateforme Bénévoles
#############################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="baienevole"
APP_DIR="/var/www/baienevole"
REPO_URL="git@github.com:sebdam1010-del/baienevole.git"
NODE_VERSION="18"
NGINX_CONF="/etc/nginx/sites-available/baienevole"

# Fonction d'affichage
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Vérification que le script est exécuté en root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
}

# Vérification des prérequis
check_prerequisites() {
    print_step "Vérification des prérequis..."

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        echo "Installation de Node.js ${NODE_VERSION}..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi

    local NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [[ $NODE_MAJOR -lt $NODE_VERSION ]]; then
        print_warning "Node.js version ${NODE_MAJOR} détectée. Version ${NODE_VERSION}+ recommandée."
    else
        print_success "Node.js $(node -v) installé"
    fi

    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    print_success "npm $(npm -v) installé"

    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 n'est pas installé. Installation..."
        npm install -g pm2
    fi
    print_success "PM2 installé"

    # Vérifier Nginx
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx n'est pas installé. Installation..."
        apt-get update
        apt-get install -y nginx
    fi
    print_success "Nginx installé"

    # Vérifier Git
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        apt-get install -y git
    fi
    print_success "Git installé"
}

# Demander les informations de configuration
configure_env() {
    print_step "Configuration de l'environnement..."

    if [[ -f "${APP_DIR}/.env" ]]; then
        print_warning "Fichier .env existant trouvé"
        read -p "Voulez-vous le remplacer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_success "Fichier .env conservé"
            return
        fi
    fi

    echo -e "\n${YELLOW}Configuration de l'application:${NC}"

    # JWT Secret
    read -p "JWT_SECRET (laisser vide pour générer automatiquement): " JWT_SECRET
    if [[ -z "$JWT_SECRET" ]]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_success "JWT_SECRET généré automatiquement"
    fi

    # Port
    read -p "Port de l'application (défaut: 3000): " APP_PORT
    APP_PORT=${APP_PORT:-3000}

    # Domaine
    read -p "Nom de domaine (ex: baienevole.com): " DOMAIN

    # Configuration SMTP
    echo -e "\n${YELLOW}Configuration SMTP pour les emails:${NC}"
    read -p "SMTP Host (ex: smtp.gmail.com): " SMTP_HOST
    read -p "SMTP Port (défaut: 587): " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-587}
    read -p "SMTP User: " SMTP_USER
    read -sp "SMTP Password: " SMTP_PASS
    echo
    read -p "Email expéditeur (ex: noreply@${DOMAIN}): " SMTP_FROM

    # URL Frontend
    FRONTEND_URL="https://${DOMAIN}"
    if [[ -z "$DOMAIN" ]]; then
        FRONTEND_URL="http://localhost:${APP_PORT}"
    fi

    # Créer le fichier .env
    cat > "${APP_DIR}/.env" <<EOF
# Environnement
NODE_ENV=production
PORT=${APP_PORT}

# Base de données
DATABASE_URL="file:./prisma/prod.db"

# JWT
JWT_SECRET=${JWT_SECRET}

# SMTP Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM="${SMTP_FROM}"

# Frontend URL
FRONTEND_URL=${FRONTEND_URL}
EOF

    chmod 600 "${APP_DIR}/.env"
    print_success "Fichier .env créé"
}

# Clone ou mise à jour du repository
setup_repository() {
    print_step "Configuration du repository..."

    if [[ -d "$APP_DIR" ]]; then
        print_warning "Répertoire $APP_DIR existe déjà"
        read -p "Voulez-vous faire une mise à jour (pull)? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            print_warning "Déploiement annulé"
            exit 0
        fi

        cd "$APP_DIR"
        git fetch origin
        git pull origin main
        print_success "Repository mis à jour"
    else
        print_step "Clonage du repository..."
        mkdir -p "$APP_DIR"
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
        print_success "Repository cloné"
    fi
}

# Installation des dépendances
install_dependencies() {
    print_step "Installation des dépendances..."

    cd "$APP_DIR"

    # Backend
    print_step "Installation des dépendances backend..."
    npm install --production
    print_success "Dépendances backend installées"

    # Frontend
    print_step "Installation des dépendances frontend..."
    cd client
    npm install
    print_success "Dépendances frontend installées"

    cd "$APP_DIR"
}

# Configuration de la base de données
setup_database() {
    print_step "Configuration de la base de données..."

    cd "$APP_DIR"

    # Générer le client Prisma
    npx prisma generate
    print_success "Client Prisma généré"

    # Créer/migrer la base de données
    if [[ ! -f "prisma/prod.db" ]]; then
        print_step "Création de la base de données..."
        npx prisma db push
        print_success "Base de données créée"

        # Demander si on veut des données de démo
        read -p "Voulez-vous ajouter des données de démonstration? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm run db:seed
            print_success "Données de démo ajoutées"
        fi
    else
        print_warning "Base de données existante détectée"
        read -p "Voulez-vous appliquer les migrations? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            npx prisma db push
            print_success "Migrations appliquées"
        fi
    fi
}

# Build du frontend
build_frontend() {
    print_step "Build du frontend..."

    cd "$APP_DIR/client"
    npm run build
    print_success "Frontend buildé"

    cd "$APP_DIR"
}

# Configuration PM2
setup_pm2() {
    print_step "Configuration de PM2..."

    cd "$APP_DIR"

    # Arrêter l'application si elle tourne
    if pm2 list | grep -q "$APP_NAME"; then
        print_step "Arrêt de l'application existante..."
        pm2 delete "$APP_NAME" || true
    fi

    # Démarrer l'application
    pm2 start ecosystem.config.js --env production

    # Sauvegarder la configuration PM2
    pm2 save

    # Configurer le démarrage automatique
    pm2 startup systemd -u root --hp /root

    print_success "Application démarrée avec PM2"
}

# Configuration Nginx
setup_nginx() {
    print_step "Configuration de Nginx..."

    if [[ -z "$DOMAIN" ]]; then
        print_warning "Pas de domaine configuré, Nginx non configuré"
        print_warning "L'application est accessible sur http://localhost:${APP_PORT}"
        return
    fi

    # Créer la configuration Nginx
    cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirection vers HTTPS (si certificat SSL configuré)
    # return 301 https://\$server_name\$request_uri;

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}
EOF

    # Activer le site
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

    # Tester la configuration
    if nginx -t; then
        systemctl reload nginx
        print_success "Nginx configuré et rechargé"
    else
        print_error "Erreur dans la configuration Nginx"
        return 1
    fi

    # Proposer l'installation de SSL
    print_step "Configuration SSL avec Let's Encrypt"
    read -p "Voulez-vous installer un certificat SSL (Let's Encrypt)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! command -v certbot &> /dev/null; then
            apt-get install -y certbot python3-certbot-nginx
        fi

        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
        print_success "Certificat SSL installé"
    fi
}

# Configuration du cron pour les backups
setup_backup_cron() {
    print_step "Configuration des backups automatiques..."

    # Créer le dossier de backups
    mkdir -p "${APP_DIR}/backups"

    # Vérifier si le cron existe déjà
    if crontab -l 2>/dev/null | grep -q "${APP_DIR}/scripts/backup.sh"; then
        print_warning "Cron de backup déjà configuré"
        return
    fi

    read -p "Voulez-vous configurer les backups automatiques quotidiens? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        # Rendre le script de backup exécutable
        chmod +x "${APP_DIR}/scripts/backup.sh"

        # Ajouter au crontab (tous les jours à 2h00)
        (crontab -l 2>/dev/null; echo "0 2 * * * ${APP_DIR}/scripts/backup.sh >> ${APP_DIR}/logs/backup.log 2>&1") | crontab -

        print_success "Backup automatique configuré (tous les jours à 2h00)"
    fi
}

# Configuration du cron pour les rappels email
setup_reminders_cron() {
    print_step "Configuration des rappels email automatiques..."

    # Vérifier si le cron existe déjà
    if crontab -l 2>/dev/null | grep -q "reminders:send"; then
        print_warning "Cron de rappels déjà configuré"
        return
    fi

    read -p "Voulez-vous configurer les rappels email automatiques? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        # Ajouter au crontab (tous les jours à 10h00)
        (crontab -l 2>/dev/null; echo "0 10 * * * cd ${APP_DIR} && npm run reminders:send >> ${APP_DIR}/logs/reminders.log 2>&1") | crontab -

        print_success "Rappels email configurés (tous les jours à 10h00)"
    fi
}

# Afficher les informations finales
show_summary() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Déploiement terminé avec succès! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"

    echo -e "${BLUE}Informations de l'application:${NC}"
    echo -e "  📁 Répertoire: ${APP_DIR}"
    echo -e "  🚀 Port: ${APP_PORT}"

    if [[ -n "$DOMAIN" ]]; then
        echo -e "  🌐 URL: https://${DOMAIN}"
    else
        echo -e "  🌐 URL: http://localhost:${APP_PORT}"
    fi

    echo -e "\n${BLUE}Commandes utiles:${NC}"
    echo -e "  pm2 status              # Voir l'état de l'application"
    echo -e "  pm2 logs ${APP_NAME}       # Voir les logs"
    echo -e "  pm2 restart ${APP_NAME}    # Redémarrer l'application"
    echo -e "  pm2 stop ${APP_NAME}       # Arrêter l'application"
    echo -e "  pm2 monit               # Monitoring en temps réel"

    echo -e "\n${BLUE}Documentation:${NC}"
    echo -e "  📚 API Docs: http://localhost:${APP_PORT}/api-docs"
    echo -e "  📖 Guide de déploiement: ${APP_DIR}/DEPLOYMENT.md"
    echo -e "  🤝 Guide de contribution: ${APP_DIR}/CONTRIBUTING.md"

    echo -e "\n${BLUE}Logs:${NC}"
    echo -e "  Backend: ${APP_DIR}/logs/out.log"
    echo -e "  Erreurs: ${APP_DIR}/logs/err.log"
    echo -e "  Nginx: /var/log/nginx/${APP_NAME}_*.log"

    if crontab -l 2>/dev/null | grep -q "backup.sh"; then
        echo -e "\n${BLUE}Backups:${NC}"
        echo -e "  📦 Dossier: ${APP_DIR}/backups"
        echo -e "  ⏰ Fréquence: Quotidien à 2h00"
        echo -e "  🔄 Rétention: 30 jours"
    fi

    if crontab -l 2>/dev/null | grep -q "reminders:send"; then
        echo -e "\n${BLUE}Rappels email:${NC}"
        echo -e "  ✉️  Fréquence: Quotidien à 10h00"
        echo -e "  📝 Logs: ${APP_DIR}/logs/reminders.log"
    fi

    echo ""
}

# Point d'entrée principal
main() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   Déploiement Production - Baie des Singes ║"
    echo "║        Plateforme de Gestion Bénévoles     ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # Vérifications
    check_root
    check_prerequisites

    # Déploiement
    setup_repository
    configure_env
    install_dependencies
    setup_database
    build_frontend
    setup_pm2
    setup_nginx
    setup_backup_cron
    setup_reminders_cron

    # Résumé
    show_summary
}

# Exécution
main "$@"
