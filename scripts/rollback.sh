#!/bin/bash

#############################################
# Script de rollback production
# Baie des Singes - Plateforme Bénévoles
#############################################

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="baienevole"
APP_DIR="/var/www/baienevole"
BACKUP_DIR="${APP_DIR}/backups"

# Fonctions d'affichage
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

# Vérification root
if [[ $EUID -ne 0 ]]; then
    print_error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

echo -e "${RED}"
echo "╔════════════════════════════════════════════╗"
echo "║     Rollback - Baie des Singes             ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

print_warning "Ce script va restaurer une version précédente de l'application"

# Vérifier si des backups existent
if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]]; then
    print_error "Aucun backup trouvé dans $BACKUP_DIR"
    exit 1
fi

# Lister les backups disponibles
print_step "Backups disponibles:"
echo ""
backups=($(ls -t "$BACKUP_DIR"/db_backup_*.db.gz))
count=1

for backup in "${backups[@]}"; do
    filename=$(basename "$backup")
    size=$(du -h "$backup" | cut -f1)
    date_str=$(echo "$filename" | sed 's/db_backup_\(.*\)\.db\.gz/\1/')
    # Convertir le format de date 20250106_143000 en format lisible
    readable_date=$(echo "$date_str" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')

    echo -e "  ${count}. ${readable_date} (${size})"
    ((count++))
done

echo ""
read -p "Sélectionnez le numéro du backup à restaurer (1-${#backups[@]}) ou 'q' pour quitter: " selection

if [[ "$selection" == "q" ]]; then
    print_warning "Rollback annulé"
    exit 0
fi

# Vérifier la sélection
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [[ "$selection" -lt 1 ]] || [[ "$selection" -gt "${#backups[@]}" ]]; then
    print_error "Sélection invalide"
    exit 1
fi

# Récupérer le backup sélectionné
selected_backup="${backups[$((selection-1))]}"
print_step "Backup sélectionné: $(basename $selected_backup)"

# Confirmation
print_warning "ATTENTION: Cette opération va remplacer la base de données actuelle!"
read -p "Êtes-vous sûr de vouloir continuer? (yes/NO): " confirm

if [[ "$confirm" != "yes" ]]; then
    print_warning "Rollback annulé"
    exit 0
fi

# Arrêter l'application
print_step "Arrêt de l'application..."
pm2 stop "$APP_NAME"
print_success "Application arrêtée"

# Backup de la base actuelle avant rollback
print_step "Backup de la base actuelle avant rollback..."
CURRENT_DATE=$(date +%Y%m%d_%H%M%S)
cp "${APP_DIR}/prisma/prod.db" "${BACKUP_DIR}/db_backup_before_rollback_${CURRENT_DATE}.db"
gzip "${BACKUP_DIR}/db_backup_before_rollback_${CURRENT_DATE}.db"
print_success "Base actuelle sauvegardée"

# Restaurer le backup
print_step "Restauration du backup..."
gunzip -c "$selected_backup" > "${APP_DIR}/prisma/prod.db"
print_success "Base de données restaurée"

# Redémarrer l'application
print_step "Redémarrage de l'application..."
pm2 restart "$APP_NAME"
sleep 2

# Vérifier le statut
if pm2 list | grep -q "$APP_NAME.*online"; then
    print_success "Application en ligne"
else
    print_error "Problème détecté après le rollback!"
    echo "Restauration de la base précédente..."
    gunzip -c "${BACKUP_DIR}/db_backup_before_rollback_${CURRENT_DATE}.db.gz" > "${APP_DIR}/prisma/prod.db"
    pm2 restart "$APP_NAME"
    print_error "Rollback échoué, base de données restaurée à l'état précédent"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Rollback terminé avec succès! ✓${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Le backup actuel a été sauvegardé dans:${NC}"
echo -e "  ${BACKUP_DIR}/db_backup_before_rollback_${CURRENT_DATE}.db.gz"

echo ""
