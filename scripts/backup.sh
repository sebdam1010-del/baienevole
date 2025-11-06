#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="./prisma/prod.db"
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Aller dans le dossier du projet
cd "$PROJECT_DIR" || exit 1

echo -e "${GREEN}🔄 Démarrage du backup...${NC}"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Vérifier que la base de données existe
if [ ! -f "$DB_FILE" ]; then
    echo -e "${RED}❌ Erreur: Base de données non trouvée: $DB_FILE${NC}"
    exit 1
fi

# Sauvegarder la base de données
echo -e "${YELLOW}📦 Copie de la base de données...${NC}"
cp "$DB_FILE" "$BACKUP_DIR/db_backup_$DATE.db"

# Vérifier que la copie a réussi
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la copie de la base de données${NC}"
    exit 1
fi

# Compresser le backup
echo -e "${YELLOW}🗜️  Compression du backup...${NC}"
gzip "$BACKUP_DIR/db_backup_$DATE.db"

# Vérifier que la compression a réussi
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compression${NC}"
    exit 1
fi

# Taille du backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/db_backup_$DATE.db.gz" | cut -f1)
echo -e "${GREEN}✅ Backup créé: db_backup_$DATE.db.gz ($BACKUP_SIZE)${NC}"

# Garder seulement les 30 derniers backups
echo -e "${YELLOW}🧹 Nettoyage des anciens backups...${NC}"
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.db.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 30 ]; then
    DELETED=$(ls -t "$BACKUP_DIR"/db_backup_*.db.gz | tail -n +31 | xargs rm -v | wc -l)
    echo -e "${GREEN}✅ $DELETED ancien(s) backup(s) supprimé(s)${NC}"
else
    echo -e "${GREEN}✅ $BACKUP_COUNT backup(s) présent(s) (< 30, pas de nettoyage)${NC}"
fi

# Afficher la liste des backups
echo -e "\n${GREEN}📋 Liste des backups disponibles:${NC}"
ls -lh "$BACKUP_DIR"/db_backup_*.db.gz | tail -n 5

echo -e "\n${GREEN}✅ Backup terminé avec succès!${NC}"
