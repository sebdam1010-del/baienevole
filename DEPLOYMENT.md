# Guide de déploiement

Ce guide explique comment déployer la plateforme de gestion des bénévoles de La Baie des Singes en production.

## Table des matières

- [Prérequis](#prérequis)
- [Déploiement local (développement)](#déploiement-local-développement)
- [Déploiement sur serveur VPS](#déploiement-sur-serveur-vps)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Configuration de production](#configuration-de-production)
- [Base de données](#base-de-données)
- [Service de production](#service-de-production)
- [Sécurité](#sécurité)
- [Monitoring et logs](#monitoring-et-logs)
- [Sauvegarde](#sauvegarde)
- [Dépannage](#dépannage)

## Prérequis

### Environnement serveur

- **OS** : Linux (Ubuntu 22.04 LTS recommandé)
- **Node.js** : v18 ou supérieur
- **npm** : v9 ou supérieur
- **RAM** : Minimum 1GB, 2GB recommandé
- **Espace disque** : Minimum 5GB
- **Processeur** : 1 CPU minimum

### Domaine et certificat SSL

- Nom de domaine configuré (ex: `baiedessinges.com`)
- Certificat SSL (Let's Encrypt recommandé)

### Services externes

- **Email** : Serveur SMTP ou service (SendGrid, Mailgun, etc.)
- **Backup** : Solution de sauvegarde (optionnel)

## Déploiement local (développement)

Voir le [README.md](./README.md) pour les instructions de développement local.

## Déploiement sur serveur VPS

### 1. Préparation du serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de Git
sudo apt install -y git

# Installation de PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installation de Nginx (reverse proxy)
sudo apt install -y nginx

# Installation de Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Clone du projet

```bash
# Créer un utilisateur dédié
sudo adduser baienevole
sudo usermod -aG sudo baienevole

# Se connecter en tant que cet utilisateur
su - baienevole

# Cloner le projet
cd /home/baienevole
git clone https://github.com/sebdam1010-del/baienevole.git
cd baienevole
```

### 3. Installation des dépendances

```bash
# Backend
npm install --production

# Frontend
cd client
npm install
npm run build
cd ..
```

### 4. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier avec vos paramètres de production
nano .env
```

Configuration minimale pour la production :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./prisma/prod.db"
JWT_SECRET=GENERER_UNE_CLE_TRES_LONGUE_ET_ALEATOIRE
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@baiedessinges.com
SMTP_PASS=votre_mot_de_passe_smtp
SMTP_FROM="La Baie des Singes <noreply@baiedessinges.com>"
FRONTEND_URL=https://baiedessinges.com
```

**⚠️ IMPORTANT** : Générer un JWT_SECRET sécurisé :

```bash
# Générer une clé aléatoire de 64 caractères
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Initialisation de la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données de production
npm run db:push

# (Optionnel) Créer un utilisateur admin
npm run db:seed
```

### 6. Configuration de Nginx

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/baiedessinges
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name baiedessinges.com www.baiedessinges.com;

    # Frontend (fichiers statiques React)
    location / {
        root /home/baienevole/baienevole/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Documentation Swagger
    location /api-docs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site :

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/baiedessinges /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 7. Configuration SSL avec Let's Encrypt

```bash
# Obtenir un certificat SSL
sudo certbot --nginx -d baiedessinges.com -d www.baiedessinges.com

# Le certificat sera automatiquement renouvelé
# Vérifier le renouvellement automatique
sudo systemctl status certbot.timer
```

### 8. Démarrage avec PM2

```bash
# Démarrer l'application
pm2 start src/server.js --name baienevole

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Exécuter la commande affichée par PM2

# Vérifier le statut
pm2 status
pm2 logs baienevole
```

### 9. Configuration du cron pour les rappels email

```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne pour exécuter tous les jours à 10h
0 10 * * * cd /home/baienevole/baienevole && /usr/bin/npm run reminders:send >> /home/baienevole/logs/reminders.log 2>&1

# Créer le dossier de logs
mkdir -p /home/baienevole/logs
```

## Déploiement avec Docker

### 1. Créer le Dockerfile

Créer `Dockerfile` à la racine :

```dockerfile
# Build stage pour le frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache openssl

# Copier les fichiers backend
COPY package*.json ./
RUN npm ci --production

COPY prisma/ ./prisma/
COPY src/ ./src/
COPY scripts/ ./scripts/

# Générer le client Prisma
RUN npx prisma generate

# Copier le build frontend
COPY --from=frontend-build /app/client/dist ./client/dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]
```

### 2. Créer docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:./prisma/prod.db
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
    volumes:
      - ./prisma:/app/prisma
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Déploiement

```bash
# Build et démarrage
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## Configuration de production

### Variables d'environnement

Fichier `.env` de production :

```env
# Serveur
NODE_ENV=production
PORT=3000

# Base de données
DATABASE_URL="file:./prisma/prod.db"

# JWT - IMPORTANT: Utiliser une clé longue et aléatoire
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire_generee
JWT_EXPIRES_IN=24h

# Email SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@baiedessinges.com
SMTP_PASS=mot_de_passe_smtp_securise
SMTP_FROM="La Baie des Singes <noreply@baiedessinges.com>"

# Frontend
FRONTEND_URL=https://baiedessinges.com
```

### Permissions des fichiers

```bash
# Base de données accessible seulement par l'utilisateur
chmod 600 prisma/prod.db

# Fichier .env sécurisé
chmod 600 .env

# Logs accessibles
chmod 755 logs/
```

## Base de données

### SQLite en production

SQLite convient pour un nombre modéré d'utilisateurs (<100 bénévoles).

**Avantages** :
- Pas de serveur à configurer
- Fichier unique facile à sauvegarder
- Performance excellente pour lecture

**Limites** :
- Pas de scaling horizontal
- Concurrence limitée

### Migration vers PostgreSQL (optionnel)

Pour un scaling plus important :

```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Créer une base de données
sudo -u postgres createdb baienevole
sudo -u postgres createuser baienevole_user

# Modifier .env
DATABASE_URL="postgresql://baienevole_user:password@localhost:5432/baienevole"

# Migrer le schéma
npx prisma migrate deploy
```

## Service de production

### Script PM2 ecosystem

Créer `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'baienevole',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Utilisation :

```bash
# Démarrer avec le fichier config
pm2 start ecosystem.config.js --env production

# Recharger sans downtime
pm2 reload baienevole

# Redémarrer
pm2 restart baienevole
```

## Sécurité

### Checklist de sécurité

- [ ] **Variables d'environnement** : `.env` avec permissions 600
- [ ] **JWT_SECRET** : Clé longue et aléatoire (64+ caractères)
- [ ] **HTTPS** : Certificat SSL configuré
- [ ] **Headers** : Headers de sécurité (Helmet.js déjà configuré)
- [ ] **Rate limiting** : Limite les requêtes (déjà configuré)
- [ ] **Validation** : Validation des inputs (déjà configuré)
- [ ] **Secrets** : `.env` dans .gitignore
- [ ] **Firewall** : Ouvrir seulement ports 80, 443, 22
- [ ] **Mises à jour** : Système et dépendances à jour

### Configuration du firewall (UFW)

```bash
# Installer UFW
sudo apt install -y ufw

# Configurer les règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Activer
sudo ufw enable

# Vérifier
sudo ufw status
```

## Monitoring et logs

### Logs PM2

```bash
# Voir les logs en temps réel
pm2 logs baienevole

# Logs d'erreur seulement
pm2 logs baienevole --err

# Vider les logs
pm2 flush
```

### Monitoring PM2

```bash
# Dashboard en temps réel
pm2 monit

# Statistiques
pm2 show baienevole
```

### Rotation des logs

Créer `/etc/logrotate.d/baienevole` :

```
/home/baienevole/baienevole/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 baienevole baienevole
}
```

## Sauvegarde

### Script de sauvegarde automatique

Créer `scripts/backup.sh` :

```bash
#!/bin/bash

BACKUP_DIR="/home/baienevole/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/home/baienevole/baienevole/prisma/prod.db"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
cp $DB_FILE "$BACKUP_DIR/db_backup_$DATE.db"

# Compresser
gzip "$BACKUP_DIR/db_backup_$DATE.db"

# Garder seulement les 30 derniers backups
ls -t $BACKUP_DIR/db_backup_*.db.gz | tail -n +31 | xargs -r rm

echo "Backup completed: db_backup_$DATE.db.gz"
```

Configuration du cron :

```bash
# Backup tous les jours à 2h du matin
0 2 * * * /home/baienevole/baienevole/scripts/backup.sh >> /home/baienevole/logs/backup.log 2>&1
```

### Sauvegarde distante (optionnel)

Utiliser `rsync` ou `rclone` pour copier sur un serveur distant ou cloud.

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs baienevole --lines 100

# Vérifier les variables d'environnement
cat .env

# Vérifier les permissions de la base de données
ls -la prisma/
```

### Erreurs de connexion à la base de données

```bash
# Vérifier que le fichier existe
ls -la prisma/prod.db

# Régénérer le client Prisma
npm run db:generate

# Recrée le schéma si nécessaire
npm run db:push
```

### Nginx renvoie 502 Bad Gateway

```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Tester la connexion locale
curl http://localhost:3000/api/health
```

### Emails ne sont pas envoyés

```bash
# Tester manuellement
npm run reminders:send

# Vérifier les credentials SMTP dans .env
cat .env | grep SMTP

# Vérifier les logs
pm2 logs baienevole | grep -i email
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
sudo certbot renew

# Vérifier l'auto-renouvellement
sudo systemctl status certbot.timer

# Forcer le test de renouvellement
sudo certbot renew --dry-run
```

## Mise à jour de l'application

```bash
# Aller dans le dossier du projet
cd /home/baienevole/baienevole

# Sauvegarder la base de données
./scripts/backup.sh

# Pull des dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install --production

# Rebuilder le frontend
cd client
npm install
npm run build
cd ..

# Migrer la base de données si nécessaire
npx prisma migrate deploy

# Recharger PM2 sans downtime
pm2 reload baienevole

# Vérifier que tout fonctionne
pm2 logs baienevole --lines 50
```

---

Pour toute question sur le déploiement, consultez le [README.md](./README.md) ou ouvrez une [issue](https://github.com/sebdam1010-del/baienevole/issues).
