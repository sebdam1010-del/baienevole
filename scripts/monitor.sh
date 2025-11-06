#!/bin/bash

#############################################
# Script de monitoring
# Baie des Singes - Plateforme Bénévoles
#############################################

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="baienevole"
APP_DIR="/var/www/baienevole"
APP_PORT=3000

# Fonction d'affichage
print_section() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ${1}${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
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

# Header
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║     Monitoring - Baie des Singes          ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. État de l'application PM2
print_section "État de l'application (PM2)"

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME.*online"; then
        print_success "Application en ligne"
        echo ""
        pm2 list | grep -E "id|$APP_NAME"
    else
        print_error "Application arrêtée ou en erreur"
        echo ""
        pm2 list | grep -E "id|$APP_NAME"
    fi
else
    print_error "PM2 non installé"
fi

# 2. Test de connexion HTTP
print_section "Test de connexion HTTP"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT} | grep -q "200\|302"; then
    print_success "Serveur répond (HTTP ${APP_PORT})"
else
    print_error "Serveur ne répond pas sur le port ${APP_PORT}"
fi

# Test de l'API
if curl -s http://localhost:${APP_PORT}/api/auth/me | grep -q "token\|error"; then
    print_success "API accessible"
else
    print_warning "API potentiellement inaccessible"
fi

# 3. État Nginx
print_section "État Nginx"

if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        print_success "Nginx actif"
    else
        print_error "Nginx inactif"
    fi

    # Vérifier la configuration
    if nginx -t 2>&1 | grep -q "successful"; then
        print_success "Configuration Nginx valide"
    else
        print_error "Configuration Nginx invalide"
    fi
else
    print_warning "Nginx non installé"
fi

# 4. Ressources système
print_section "Ressources Système"

# CPU
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo -e "CPU: ${cpu_usage}%"
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    print_warning "Utilisation CPU élevée"
fi

# RAM
mem_total=$(free -h | awk '/^Mem:/ {print $2}')
mem_used=$(free -h | awk '/^Mem:/ {print $3}')
mem_percent=$(free | awk '/^Mem:/ {printf "%.1f", $3/$2 * 100}')
echo -e "RAM: ${mem_used} / ${mem_total} (${mem_percent}%)"
if (( $(echo "$mem_percent > 80" | bc -l) )); then
    print_warning "Utilisation RAM élevée"
fi

# Disque
disk_usage=$(df -h "${APP_DIR}" | awk 'NR==2 {print $5}' | sed 's/%//')
disk_avail=$(df -h "${APP_DIR}" | awk 'NR==2 {print $4}')
echo -e "Disque: ${disk_usage}% utilisé (${disk_avail} disponible)"
if [[ $disk_usage -gt 80 ]]; then
    print_warning "Espace disque faible"
fi

# 5. Base de données
print_section "Base de données"

if [[ -f "${APP_DIR}/prisma/prod.db" ]]; then
    db_size=$(du -h "${APP_DIR}/prisma/prod.db" | cut -f1)
    print_success "Base de données trouvée (${db_size})"

    # Test de connexion SQLite
    if sqlite3 "${APP_DIR}/prisma/prod.db" "SELECT 1" &> /dev/null; then
        print_success "Base de données accessible"
    else
        print_error "Impossible de se connecter à la base de données"
    fi
else
    print_error "Base de données non trouvée"
fi

# 6. Backups
print_section "Backups"

if [[ -d "${APP_DIR}/backups" ]]; then
    backup_count=$(ls -1 "${APP_DIR}/backups"/db_backup_*.db.gz 2>/dev/null | wc -l)
    if [[ $backup_count -gt 0 ]]; then
        print_success "${backup_count} backup(s) disponible(s)"

        # Dernier backup
        last_backup=$(ls -t "${APP_DIR}/backups"/db_backup_*.db.gz 2>/dev/null | head -1)
        if [[ -n "$last_backup" ]]; then
            last_backup_name=$(basename "$last_backup")
            last_backup_size=$(du -h "$last_backup" | cut -f1)
            last_backup_date=$(stat -c %y "$last_backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
            echo "  Dernier: ${last_backup_name} (${last_backup_size}) - ${last_backup_date}"

            # Vérifier si le backup est récent (moins de 48h)
            last_backup_timestamp=$(stat -c %Y "$last_backup")
            current_timestamp=$(date +%s)
            diff_hours=$(( ($current_timestamp - $last_backup_timestamp) / 3600 ))

            if [[ $diff_hours -lt 48 ]]; then
                print_success "Dernier backup: il y a ${diff_hours}h"
            else
                print_warning "Dernier backup: il y a ${diff_hours}h (> 48h)"
            fi
        fi
    else
        print_warning "Aucun backup trouvé"
    fi
else
    print_error "Dossier backups non trouvé"
fi

# 7. Logs
print_section "Logs récents"

# Logs d'erreur
if [[ -f "${APP_DIR}/logs/err.log" ]]; then
    err_count=$(wc -l < "${APP_DIR}/logs/err.log")
    err_size=$(du -h "${APP_DIR}/logs/err.log" | cut -f1)

    echo -e "Fichier d'erreurs: ${err_size} (${err_count} lignes)"

    # Dernières erreurs
    if [[ $err_count -gt 0 ]]; then
        recent_errors=$(tail -n 5 "${APP_DIR}/logs/err.log" 2>/dev/null | grep -i "error" | wc -l)
        if [[ $recent_errors -gt 0 ]]; then
            print_warning "${recent_errors} erreur(s) dans les 5 dernières lignes"
        else
            print_success "Pas d'erreurs récentes"
        fi
    fi
else
    print_warning "Fichier de logs d'erreur non trouvé"
fi

# Logs Nginx
if [[ -f "/var/log/nginx/${APP_NAME}_error.log" ]]; then
    nginx_err_size=$(du -h "/var/log/nginx/${APP_NAME}_error.log" | cut -f1)
    echo -e "Logs Nginx erreurs: ${nginx_err_size}"
fi

# 8. Cron jobs
print_section "Tâches Cron"

if crontab -l 2>/dev/null | grep -q "backup.sh"; then
    print_success "Backup automatique configuré"
else
    print_warning "Backup automatique non configuré"
fi

if crontab -l 2>/dev/null | grep -q "reminders:send"; then
    print_success "Rappels email configurés"
else
    print_warning "Rappels email non configurés"
fi

# 9. Certificat SSL
print_section "Certificat SSL"

if command -v certbot &> /dev/null; then
    cert_info=$(certbot certificates 2>/dev/null | grep -A 2 "Certificate Name")
    if [[ -n "$cert_info" ]]; then
        print_success "Certificat SSL trouvé"
        # Vérifier l'expiration
        expiry=$(certbot certificates 2>/dev/null | grep "Expiry Date" | head -1)
        if [[ -n "$expiry" ]]; then
            echo "  ${expiry}"
        fi
    else
        print_warning "Aucun certificat SSL trouvé"
    fi
else
    print_warning "Certbot non installé"
fi

# 10. Ports ouverts
print_section "Ports ouverts"

if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":${APP_PORT}"; then
        print_success "Port ${APP_PORT} ouvert"
    else
        print_error "Port ${APP_PORT} non ouvert"
    fi

    if netstat -tuln | grep -q ":80"; then
        print_success "Port 80 (HTTP) ouvert"
    else
        print_warning "Port 80 (HTTP) non ouvert"
    fi

    if netstat -tuln | grep -q ":443"; then
        print_success "Port 443 (HTTPS) ouvert"
    else
        print_warning "Port 443 (HTTPS) non ouvert"
    fi
fi

# Résumé final
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Résumé${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Calculer un score de santé global
health_score=0
total_checks=10

# Application en ligne
pm2 list | grep -q "$APP_NAME.*online" && ((health_score++))

# HTTP répond
curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT} | grep -q "200\|302" && ((health_score++))

# Nginx actif
systemctl is-active --quiet nginx && ((health_score++))

# CPU < 80%
(( $(echo "$cpu_usage < 80" | bc -l) )) && ((health_score++))

# RAM < 80%
(( $(echo "$mem_percent < 80" | bc -l) )) && ((health_score++))

# Disque < 80%
[[ $disk_usage -lt 80 ]] && ((health_score++))

# Base de données OK
[[ -f "${APP_DIR}/prisma/prod.db" ]] && ((health_score++))

# Backups récents
[[ $diff_hours -lt 48 ]] && ((health_score++))

# Pas d'erreurs récentes
[[ $recent_errors -eq 0 ]] && ((health_score++))

# Cron configuré
crontab -l 2>/dev/null | grep -q "backup.sh" && ((health_score++))

# Afficher le score
health_percent=$((health_score * 100 / total_checks))

if [[ $health_percent -ge 80 ]]; then
    echo -e "${GREEN}État général: Excellent (${health_score}/${total_checks})${NC}"
elif [[ $health_percent -ge 60 ]]; then
    echo -e "${YELLOW}État général: Bon (${health_score}/${total_checks})${NC}"
else
    echo -e "${RED}État général: Problèmes détectés (${health_score}/${total_checks})${NC}"
fi

echo -e "\n${BLUE}Commandes utiles:${NC}"
echo -e "  pm2 logs ${APP_NAME}       # Voir les logs en temps réel"
echo -e "  pm2 monit               # Monitoring interactif"
echo -e "  pm2 restart ${APP_NAME}    # Redémarrer l'application"
echo -e "  ./update.sh             # Mettre à jour l'application"
echo -e "  ./rollback.sh           # Restaurer un backup"

echo ""
