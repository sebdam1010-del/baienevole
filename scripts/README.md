# Scripts de Déploiement et Maintenance

Ce dossier contient tous les scripts nécessaires pour déployer et maintenir l'application en production.

## 📋 Scripts Disponibles

### 🚀 `deploy.sh` - Déploiement Initial

Script complet pour le premier déploiement de l'application sur un serveur de production.

**Prérequis:**
- Serveur Linux (Ubuntu 20.04+ recommandé)
- Accès root/sudo
- Connexion internet

**Utilisation:**
```bash
# Sur le serveur de production
wget https://raw.githubusercontent.com/sebdam1010-del/baienevole/main/scripts/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

**Le script va:**
1. ✅ Vérifier et installer les prérequis (Node.js, PM2, Nginx, Git)
2. ✅ Cloner le repository
3. ✅ Configurer l'environnement (.env)
4. ✅ Installer les dépendances (backend + frontend)
5. ✅ Configurer la base de données
6. ✅ Builder le frontend
7. ✅ Démarrer l'application avec PM2
8. ✅ Configurer Nginx (reverse proxy + SSL optionnel)
9. ✅ Configurer les backups automatiques (cron)
10. ✅ Configurer les rappels email (cron)

**Configuration interactive:**
Le script vous demandera:
- JWT Secret (généré automatiquement si vide)
- Port de l'application (défaut: 3000)
- Nom de domaine
- Configuration SMTP (host, port, user, password, email expéditeur)
- Installation du certificat SSL Let's Encrypt (optionnel)
- Activation des backups automatiques (optionnel)
- Activation des rappels email (optionnel)

---

### 🔄 `update.sh` - Mise à jour

Script rapide pour mettre à jour l'application après un déploiement initial.

**Utilisation:**
```bash
cd /var/www/baienevole/scripts
sudo ./update.sh
```

**Le script va:**
1. ✅ Créer un backup automatique de la base de données
2. ✅ Pull les dernières modifications Git
3. ✅ Mettre à jour les dépendances (backend + frontend)
4. ✅ Rebuilder le frontend
5. ✅ Appliquer les migrations de base de données
6. ✅ Redémarrer l'application avec PM2
7. ✅ Vérifier que l'application est en ligne

**Quand l'utiliser:**
- Après chaque push sur la branche main
- Lors de l'ajout de nouvelles fonctionnalités
- Pour appliquer des correctifs

---

### ↩️ `rollback.sh` - Restauration

Script pour restaurer une version précédente de la base de données en cas de problème.

**Utilisation:**
```bash
cd /var/www/baienevole/scripts
sudo ./rollback.sh
```

**Le script va:**
1. ✅ Lister tous les backups disponibles
2. ✅ Vous demander de sélectionner un backup
3. ✅ Créer un backup de la base actuelle (sécurité)
4. ✅ Arrêter l'application
5. ✅ Restaurer le backup sélectionné
6. ✅ Redémarrer l'application
7. ✅ Vérifier que tout fonctionne

**Quand l'utiliser:**
- Après une mise à jour problématique
- En cas de corruption de données
- Pour revenir à un état stable

**⚠️ ATTENTION:** Cette opération remplace la base de données actuelle!

---

### 💾 `backup.sh` - Sauvegarde

Script pour créer une sauvegarde manuelle ou automatique de la base de données.

**Utilisation:**
```bash
cd /var/www/baienevole/scripts
./backup.sh
```

**Le script va:**
1. ✅ Créer une copie de la base de données
2. ✅ Compresser le backup (gzip)
3. ✅ Garder uniquement les 30 derniers backups
4. ✅ Afficher les informations du backup

**Backups automatiques:**
Si configuré pendant le déploiement, le script s'exécute automatiquement tous les jours à 2h00.

**Vérifier le cron:**
```bash
crontab -l | grep backup
```

**Format des fichiers:**
```
backups/db_backup_20250106_143000.db.gz
              └─ YYYYMMDD_HHMMSS
```

---

## 🔧 Configuration Post-Déploiement

### Vérifier l'état de l'application

```bash
# Statut PM2
pm2 status

# Logs en temps réel
pm2 logs baienevole

# Monitoring
pm2 monit

# Redémarrer
pm2 restart baienevole

# Arrêter
pm2 stop baienevole
```

### Vérifier Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Logs
sudo tail -f /var/log/nginx/baienevole_access.log
sudo tail -f /var/log/nginx/baienevole_error.log
```

### Vérifier les Cron Jobs

```bash
# Lister les tâches cron
crontab -l

# Logs des backups
tail -f /var/www/baienevole/logs/backup.log

# Logs des rappels email
tail -f /var/www/baienevole/logs/reminders.log
```

---

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs baienevole --lines 100

# Vérifier les logs de l'application
tail -f /var/www/baienevole/logs/err.log

# Vérifier les variables d'environnement
cat /var/www/baienevole/.env
```

### Nginx renvoie une erreur 502

```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier le port
sudo netstat -tulpn | grep 3000

# Tester la connexion locale
curl http://localhost:3000
```

### Base de données corrompue

```bash
# Restaurer le dernier backup
cd /var/www/baienevole/scripts
sudo ./rollback.sh
```

### Espace disque insuffisant

```bash
# Vérifier l'espace disque
df -h

# Nettoyer les anciens backups manuellement
cd /var/www/baienevole/backups
ls -lt | tail -n +31 | awk '{print $9}' | xargs rm

# Nettoyer les logs PM2
pm2 flush
```

---

## 📊 Maintenance Recommandée

### Quotidien (automatique)
- ✅ Backup de la base de données (2h00)
- ✅ Envoi des rappels email (10h00)

### Hebdomadaire (manuel)
```bash
# Vérifier l'état général
pm2 status
df -h
free -h

# Vérifier les logs d'erreurs
tail -n 50 /var/www/baienevole/logs/err.log

# Vérifier les backups
ls -lh /var/www/baienevole/backups | tail -n 7
```

### Mensuel (manuel)
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Nettoyer les backups (garder 30 jours)
# (fait automatiquement par backup.sh)

# Vérifier les certificats SSL
sudo certbot certificates

# Renouveler les certificats si nécessaire
sudo certbot renew
```

---

## 🔒 Sécurité

### Permissions des fichiers

```bash
# .env doit être lisible uniquement par root
chmod 600 /var/www/baienevole/.env

# Base de données
chmod 600 /var/www/baienevole/prisma/prod.db

# Dossier backups
chmod 700 /var/www/baienevole/backups
```

### Firewall (UFW)

```bash
# Autoriser SSH
sudo ufw allow ssh

# Autoriser HTTP et HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Activer le firewall
sudo ufw enable
```

---

## 📚 Ressources

- **Guide de déploiement complet**: [DEPLOYMENT.md](../DEPLOYMENT.md)
- **Documentation API**: http://votre-domaine.com/api-docs
- **Guide de contribution**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Issues GitHub**: https://github.com/sebdam1010-del/baienevole/issues

---

## 🆘 Support

En cas de problème, consultez:
1. Les logs de l'application (`pm2 logs baienevole`)
2. Les logs Nginx (`/var/log/nginx/baienevole_*.log`)
3. Le [guide de dépannage](../DEPLOYMENT.md#dépannage)
4. Ouvrez une issue sur GitHub
