#!/bin/bash

#############################################
# Script de mise à jour production
# Baie des Singes - Plateforme Bénévoles
#############################################

set -e

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="baienevole"
APP_DIR="/var/www/baienevole"

# Fonction d'affichage
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Vérification root
if [[ $EUID -ne 0 ]]; then
    print_error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║     Mise à jour - Baie des Singes          ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Backup automatique avant mise à jour
print_step "Backup de la base de données..."
cd "$APP_DIR"
if [[ -f "${APP_DIR}/scripts/backup.sh" ]]; then
    bash "${APP_DIR}/scripts/backup.sh"
    print_success "Backup créé"
else
    print_error "Script de backup non trouvé"
fi

# Pull des dernières modifications
print_step "Récupération des mises à jour..."
cd "$APP_DIR"
git fetch origin
git pull origin main
print_success "Code mis à jour"

# Installation des dépendances backend
print_step "Mise à jour des dépendances backend..."
npm install --production
print_success "Dépendances backend mises à jour"

# Installation des dépendances frontend
print_step "Mise à jour des dépendances frontend..."
cd client
npm install
print_success "Dépendances frontend mises à jour"

# Build du frontend
print_step "Build du frontend..."
npm run build
print_success "Frontend buildé"

cd "$APP_DIR"

# Génération du client Prisma
print_step "Génération du client Prisma..."
npx prisma generate
print_success "Client Prisma généré"

# Migrations de la base de données
print_step "Application des migrations..."
npx prisma db push
print_success "Migrations appliquées"

# Redémarrage de l'application
print_step "Redémarrage de l'application..."
pm2 restart "$APP_NAME"
print_success "Application redémarrée"

# Vérification du statut
sleep 2
if pm2 list | grep -q "$APP_NAME.*online"; then
    print_success "Application en ligne"
else
    print_error "Problème détecté!"
    echo "Vérifiez les logs avec: pm2 logs $APP_NAME"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Mise à jour terminée avec succès! 🎉${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Commandes utiles:${NC}"
echo -e "  pm2 logs ${APP_NAME}       # Voir les logs"
echo -e "  pm2 status              # Voir l'état"
echo -e "  pm2 monit               # Monitoring"

echo ""
