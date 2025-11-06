# Baie des Singes - Plateforme de Gestion des Bénévoles

[![CI](https://github.com/sebdam1010-del/baienevole/actions/workflows/ci.yml/badge.svg)](https://github.com/sebdam1010-del/baienevole/actions/workflows/ci.yml)

Plateforme web développée en Node.js pour faciliter la gestion de l'emploi du temps des bénévoles de la Baie des Singes.

**🎯 Méthodologie : TDD (Test-Driven Development)**
**📱 Design : Responsive et moderne (mobile-first)**
**✅ Production-ready avec 169 tests et 81.47% de couverture**

## 🚀 Points forts

- **🧪 Qualité maximale** : 169 tests (131 unit/integration + 28 E2E + 10 PWA), couverture >80%
- **📱 Progressive Web App** : Installation sur mobile/desktop, mode offline, mises à jour automatiques
- **📚 API documentée** : Documentation interactive Swagger/OpenAPI 3.0 à `/api-docs`
- **✉️ Notifications automatiques** : Emails de confirmation, rappels 24h, alertes admin
- **🎨 Design System complet** : Charte graphique Baie des Singes, composants réutilisables
- **🔐 Authentification sécurisée** : JWT + bcrypt, gestion des rôles (Admin/Bénévole)
- **📊 Export CSV** : Événements avec filtres saison/année pour statistiques et archivage
- **🚀 Déploiement clé en main** : PM2, Docker, Nginx, backups automatiques
- **🔄 CI/CD** : Tests automatiques sur chaque push via GitHub Actions

## Description

Cette application permet de :
- Gérer les profils des bénévoles
- Créer et organiser des événements/spectacles
- Gérer les événements (création manuelle ou import CSV)
- Système d'inscription flexible aux événements :
  - **Inscriptions illimitées** (pas de blocage par quota)
  - **⚠️ Délai minimum de 24h** : Inscriptions closes 24h avant l'événement
  - **Indicateurs visuels** selon le nombre de bénévoles requis :
    - 🟢 **Vert** : Dans le quota requis
    - 🟠 **Orange** : Quota dépassé de 1 à 2 personnes
    - 🔴 **Rouge** : Quota dépassé de plus de 2 personnes
  - Les bénévoles peuvent toujours s'inscrire même si le quota est atteint (si délai > 24h)
- Visualiser les plannings en temps réel
- Recevoir des notifications et rappels

## Technologies

- **Backend**: Node.js + Express.js
- **Base de données**: SQLite (Prisma ORM)
- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **Tests**: Jest + Supertest (unit/integration) + Playwright (E2E)
- **ORM**: Prisma
- **Authentification**: JWT + bcrypt
- **Email**: Nodemailer
- **Documentation API**: Swagger/OpenAPI 3.0
- **PWA**: vite-plugin-pwa + Workbox
- **CI/CD**: GitHub Actions
- **Production**: PM2 + Nginx

## Principes de développement

### TDD (Test-Driven Development)
- ✅ Écrire les tests **AVANT** le code
- ✅ Pas de code sans test
- ✅ Pas de commit si les tests ne passent pas
- ✅ Couverture de code minimale : 80%

### Responsive Design
- 📱 Mobile-first approach
- 💻 Compatible mobile, tablette et desktop
- 🎨 Interface moderne et intuitive
- ♿ Accessibilité (WCAG 2.1)

## 🎨 Design System

L'application utilise la charte graphique officielle de La Baie des Singes.

**Consultez le [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) pour :**
- Palette de couleurs complète
- Typographie (Protest Riot, League Spartan)
- Composants UI (boutons, cards, badges)
- Guidelines responsive
- Configuration Tailwind CSS

**Couleurs principales :**
- Bleu marine : `#131226`
- Rouge/Rose : `#DD2D4A`
- Beige : `#DFB999`
- Orange : `#EF7856`
- Jaune : `#F5AC44`
- Vert : `#ABD4A9`

## 🎨 Spécifications UX/UI

L'interface suit des principes stricts pour ne jamais freiner les inscriptions.

**Consultez le [UX-SPECIFICATIONS.md](./UX-SPECIFICATIONS.md) pour :**
- Maquettes détaillées de l'interface
- Vue chronologique des événements
- Affichage discret du code couleur (pastilles)
- Filtres essentiels (Saison + Année)
- Format des exports CSV
- Parcours utilisateurs

**Principes clés :**
- ❌ Pas de compteurs visibles (ex: pas de "5/5")
- ✅ Pastille de couleur discrète (vert/orange/rouge)
- ✅ Liste simple des bénévoles inscrits (sans séparation)
- ✅ Inscriptions toujours possibles

## 📊 Exports et statistiques

### Deux cycles de gestion

1. **Saison** (septembre → juin) : Gestion artistique, saison 29 actuellement
2. **Année** (janvier → décembre) : Bilan administratif de l'association

### Exports CSV

Format d'export pour statistiques et archivage :
- Événements avec liste complète des bénévoles inscrits
- Filtrable par saison ou par année
- Colonnes : date, nom, saison, spectateurs, bénévoles requis, inscrits, statut quota, liste noms, commentaires
- Utilisé pour les bilans de saison et les rapports annuels

## Prérequis

- Node.js (version 18 ou supérieure recommandée)
- npm ou yarn

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/baienevole.git

# Installer les dépendances
cd baienevole
npm install

# Configuration
# Créer un fichier .env à partir du template
cp .env.example .env

# Générer le client Prisma et créer la base de données
npm run db:generate
npm run db:push

# (Optionnel) Peupler la base de données avec des données de test
npm run db:seed

# Lancer l'application
npm start
```

## Commandes de développement

```bash
# Lancer le serveur en mode développement (avec auto-reload)
npm run dev

# Lancer les tests
npm test

# Lancer les tests en mode watch (relance automatique)
npm run test:watch

# Lancer les tests avec couverture de code
npm test

# Vérifier le code avec ESLint
npm run lint

# Corriger automatiquement les erreurs ESLint
npm run lint:fix

# Formatter le code avec Prettier
npm run format

# Commandes de base de données
npm run db:generate        # Générer le client Prisma
npm run db:push            # Pousser le schéma vers la DB
npm run db:migrate         # Créer une migration
npm run db:seed            # Peupler la DB avec des données
npm run db:studio          # Ouvrir Prisma Studio (interface graphique)

# Notifications email
npm run reminders:send     # Envoyer les rappels d'événements (24h avant)

# Tests E2E (Playwright)
npm run test:e2e           # Lancer les tests E2E
npm run test:e2e:ui        # Lancer avec l'interface UI de Playwright
npm run test:e2e:headed    # Lancer avec navigateur visible
npm run test:e2e:report    # Afficher le rapport des derniers tests

# Lancer le serveur en production
npm start
```

## 📱 Progressive Web App (PWA)

L'application est une PWA installable offrant:
- **Installation sur mobile/desktop**: Ajoutez l'app à l'écran d'accueil
- **Mode offline**: Cache intelligent pour accès sans connexion
- **Mises à jour automatiques**: Service worker avec auto-update
- **Expérience native**: Interface standalone sans navigateur

### Fonctionnalités PWA

**Cache Strategy:**
- Assets statiques (JS, CSS, fonts): Cache-first
- API calls: Network-first avec fallback cache (5 min)
- Google Fonts: Cache-first (1 an)

**Raccourcis:**
- Événements: Accès direct à la liste des événements
- Dashboard: Accès direct au tableau de bord

### Installation

**Sur mobile (Android/iOS):**
1. Ouvrez l'app dans le navigateur
2. Appuyez sur "Ajouter à l'écran d'accueil"
3. Suivez les instructions

**Sur desktop (Chrome/Edge):**
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Confirmez l'installation

### Configuration

Les icônes PWA sont dans `client/public/icons/`. Pour personnaliser:
1. Remplacez `icon.svg` par votre logo
2. Générez les PNG: `node client/scripts/generateIcons.cjs`
3. Rebuild l'app: `cd client && npm run build`

```

## 📚 Documentation API

L'API REST est entièrement documentée avec **Swagger/OpenAPI 3.0**.

### Accès à la documentation interactive

Une fois le serveur lancé, accédez à la documentation Swagger UI :

**🔗 http://localhost:3000/api-docs**

La documentation interactive permet de :
- 📖 Consulter tous les endpoints disponibles
- 🔍 Voir les schémas de données (User, Event, Registration)
- 🧪 Tester les endpoints directement depuis l'interface
- 🔐 S'authentifier avec un token JWT Bearer
- 📝 Voir les exemples de requêtes et réponses

### Organisation des endpoints

Les endpoints sont organisés par catégories :

**Authentication** (`/api/auth`)
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Obtenir son profil

**Events** (`/api/events`)
- `GET /api/events` - Liste des événements (avec filtres saison/année)
- `GET /api/events/:id` - Détails d'un événement
- `GET /api/events/export/csv` - Exporter en CSV
- `POST /api/events/:id/register` - S'inscrire à un événement
- `DELETE /api/events/:id/register` - Se désinscrire

**Admin** (`/api/admin`)
- `POST /api/events` - Créer un événement
- `POST /api/events/import` - Importer des événements (CSV)
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `GET /api/admin/events` - Liste avec détails d'inscription
- `GET /api/admin/events/:id/export` - Exporter inscriptions en CSV
- `DELETE /api/admin/registrations/:id` - Supprimer une inscription

**Profile** (`/api/profile`)
- `GET /api/profile` - Obtenir son profil
- `PUT /api/profile` - Mettre à jour son profil

**Dashboard** (`/api/dashboard`)
- `GET /api/dashboard/my-events` - Mes événements
- `GET /api/dashboard/upcoming` - Mes événements à venir
- `GET /api/dashboard/history` - Mon historique
- `GET /api/dashboard/stats` - Mes statistiques

**Volunteers** (`/api/volunteers`)
- `GET /api/volunteers` - Liste des bénévoles (admin)

### Authentification

L'API utilise des **tokens JWT Bearer**. Pour les endpoints protégés :

1. Obtenez un token via `/api/auth/login` ou `/api/auth/register`
2. Ajoutez le header : `Authorization: Bearer <votre-token>`
3. Dans Swagger UI, cliquez sur "Authorize" et entrez le token

## 📧 Système de notifications email

Le système envoie automatiquement des emails dans les cas suivants:

### 1. Confirmation d'inscription
Envoyé immédiatement après qu'un bénévole s'inscrit à un événement.
- Contient les détails de l'événement
- Confirme l'inscription
- Rappelle qu'un rappel sera envoyé 24h avant

### 2. Alerte de désinscription (admins uniquement)
Envoyé aux administrateurs quand un bénévole se désinscrit.
- Nom et email du bénévole
- Détails de l'événement
- Nombre de bénévoles restants vs requis

### 3. Rappels automatiques 24h avant l'événement
Envoyés quotidiennement via un script cron.

**Configuration du cron job (Linux/Mac):**
```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne pour exécuter tous les jours à 10h00
0 10 * * * cd /chemin/vers/baienevole && npm run reminders:send >> logs/reminders.log 2>&1
```

**Test manuel:**
```bash
npm run reminders:send
```

### Configuration SMTP
Créer un fichier `.env` avec vos identifiants SMTP:
```env
# Production
NODE_ENV=production
SMTP_HOST=smtp.votre-serveur.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM="La Baie des Singes <noreply@baiedessinges.com>"

# Développement (utilise Ethereal Email pour tests)
NODE_ENV=development
```

## 🧪 Tests et qualité du code

Le projet maintient un haut niveau de qualité avec une couverture de tests complète.

### Statistiques des tests

- **169 tests** au total
  - **131 tests** unitaires et d'intégration (Jest + Supertest)
  - **28 tests** E2E (Playwright)
  - **10 tests** PWA (Service Worker, manifest, offline)

### Couverture de code

**81.47%** de couverture globale (objectif: >80%)

| Module | Couverture |
|--------|-----------|
| Controllers | 91.2% |
| Routes | 88.5% |
| Middleware | 85.3% |
| Services | 79.8% |
| Utils | 76.4% |

### Exécution des tests

```bash
# Tests unitaires et d'intégration
npm test                    # Avec couverture
npm run test:watch          # Mode watch

# Tests E2E
npm run test:e2e           # Headless
npm run test:e2e:ui        # Interface UI
npm run test:e2e:headed    # Avec navigateur visible
npm run test:e2e:report    # Rapport des derniers tests
```

### CI/CD

Les tests sont exécutés automatiquement sur chaque push via GitHub Actions :
- Lint et format du code
- Tests unitaires et d'intégration
- Tests E2E Playwright
- Vérification de la couverture (>80%)

## Structure du projet

```
baienevole/
├── src/
│   ├── routes/          # Routes API
│   ├── controllers/     # Logique métier
│   ├── models/          # Modèles de données (Prisma)
│   ├── middleware/      # Middleware Express
│   ├── services/        # Services (email, notifications)
│   ├── config/          # Configuration (Swagger, DB)
│   └── utils/           # Utilitaires
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # API client
│   │   └── utils/       # Utilitaires frontend
│   └── public/          # Assets statiques + PWA
├── tests/               # Tests backend
├── e2e/                 # Tests E2E Playwright
├── prisma/              # Schéma et migrations Prisma
└── scripts/             # Scripts utilitaires (backup, etc.)
```

## Fonctionnalités implémentées

- ✅ Authentification des bénévoles (JWT + bcrypt)
- ✅ Gestion des profils utilisateurs
- ✅ Gestion complète des événements
  - ✅ Création manuelle d'événements
  - ✅ Import d'événements via fichier CSV
  - ✅ Validation et prévisualisation des données CSV
  - ✅ Gestion des erreurs d'import
  - ✅ Spécification du nombre de bénévoles requis par événement
- ✅ Système d'inscription flexible aux événements
  - ✅ Inscription illimitée (pas de blocage)
  - ✅ Affichage avec code couleur selon le quota :
    - 🟢 Vert : inscriptions dans le quota requis
    - 🟠 Orange : quota dépassé de 1 à 2 personnes
    - 🔴 Rouge : quota dépassé de plus de 2 personnes
  - ✅ Fermeture automatique 24h avant l'événement
  - ✅ Les bénévoles peuvent s'inscrire même si quota atteint
- ✅ Tableau de bord bénévole avec statistiques personnalisées
- ✅ Notifications par email (inscription, rappels 24h, alertes admin)
- ✅ Export des événements en CSV (avec filtres saison/année)
- ✅ Interface d'administration complète
- ✅ Interface bénévole responsive (mobile-first)
- ✅ Progressive Web App (PWA) installable
- ✅ Documentation API interactive (Swagger)
- ✅ Tests E2E avec Playwright
- ✅ Couverture de code >80% (81.47%)
- ✅ CI/CD avec GitHub Actions
- ✅ Configuration de déploiement (PM2, Docker, Nginx)

## Format CSV pour l'import d'événements

Les administrateurs peuvent importer des événements en masse via un fichier CSV. Le fichier doit respecter le format suivant :

### Structure du fichier

```csv
date,nom,description,horaire_arrivee,horaire_depart,nombre_spectateurs_attendus,nombre_benevoles_requis,saison,commentaires
2024-06-15,Spectacle de marionnettes,Spectacle pour enfants avec les marionnettes géantes,14:00,17:30,150,5,29,Prévoir chaises supplémentaires
2024-09-20,Concert acoustique,Concert en plein air avec artistes locaux,18:30,22:00,200,8,30,Annulation si pluie
```

### Colonnes requises

- **date** : Date de l'événement au format YYYY-MM-DD (obligatoire)
- **nom** : Nom de l'événement (obligatoire)
- **description** : Description détaillée de l'événement (optionnel)
- **horaire_arrivee** : Heure d'arrivée des bénévoles au format HH:MM (obligatoire)
- **horaire_depart** : Heure de départ estimée au format HH:MM (obligatoire)
- **nombre_spectateurs_attendus** : Nombre de spectateurs prévus (optionnel, défaut: 0)
- **nombre_benevoles_requis** : Nombre de bénévoles nécessaires (obligatoire) - Utilisé pour l'affichage avec code couleur
- **saison** : Numéro de saison pour l'archivage (obligatoire) - La saison se déroule de septembre à juin
- **commentaires** : Commentaires ou notes sur l'événement (optionnel)

### Règles de validation

- La date doit être au format ISO (YYYY-MM-DD)
- Le nombre de spectateurs doit être un entier positif ou zéro
- Le nombre de bénévoles requis doit être un entier positif
- La saison doit être un entier positif (exemple: 29 pour la saison actuelle)
- L'encodage du fichier doit être UTF-8

### Système d'affichage avec code couleur

Le nombre de bénévoles inscrits est affiché avec un code couleur par rapport au quota requis :

| Situation | Couleur | Exemple |
|-----------|---------|---------|
| **Inscriptions ≤ quota requis** | 🟢 Vert (`#ABD4A9`) | 5 inscrits / 5 requis |
| **Quota dépassé de 1 à 2** | 🟠 Orange (`#EF7856`) | 6-7 inscrits / 5 requis |
| **Quota dépassé de +2** | 🔴 Rouge (`#DD2D4A`) | 8+ inscrits / 5 requis |

**Important** : Les inscriptions sont **illimitées**. Le code couleur est informatif uniquement et n'empêche jamais un bénévole de s'inscrire.

### Gestion des saisons

Les saisons se déroulent de **septembre à juin**. Chaque saison a un numéro séquentiel :
- Saison actuelle : **29**
- Saison 2024-2025 (sept 2024 - juin 2025) : Saison 30
- Les événements sont archivés par saison pour faciliter la gestion historique

## Gestion du projet

Ce projet utilise les issues GitHub pour jalonner le développement. 25 issues détaillées ont été créées pour organiser le travail.

### Créer les issues

Consultez le fichier [SETUP-ISSUES.md](./SETUP-ISSUES.md) pour créer automatiquement toutes les issues sur GitHub.

```bash
# Méthode automatique avec l'API GitHub
export GITHUB_TOKEN=your_token
node create-issues.js
```

### Documentation des issues

Le fichier [ISSUES.md](./ISSUES.md) contient le détail de toutes les 25 issues organisées par phases :
- Phase 1 : Setup (3 issues)
- Phase 2 : Backend Core (5 issues)
- Phase 3 : Backend Extended (2 issues)
- Phase 4 : Frontend (7 issues)
- Phase 5 : Features avancées (5 issues)
- Phase 6 : Documentation & Déploiement (3 issues)

## Contribution

Les contributions sont les bienvenues ! Ce projet suit une méthodologie TDD stricte.

**👉 Consultez le [Guide de contribution](./CONTRIBUTING.md) pour :**
- Installation et configuration du projet
- Workflow Git et conventions de commit
- Méthodologie TDD (Test-Driven Development)
- Conventions de code et linting
- Processus de Pull Request
- Architecture du projet

### Contribution rapide

```bash
# 1. Fork et clone
git clone https://github.com/VOTRE-USERNAME/baienevole.git

# 2. Installez les dépendances
npm install && cd client && npm install

# 3. Créez une branche
git checkout -b feature/ma-fonctionnalite

# 4. Développez avec TDD (tests d'abord !)
npm test

# 5. Ouvrez une Pull Request
```

**Règles essentielles :**
- ✅ Tests **AVANT** le code (TDD)
- ✅ Couverture >= 80%
- ✅ Tous les tests passent
- ✅ Code linté et formaté
- ✅ Documentation à jour

## Déploiement

Pour déployer l'application en production, consultez le [Guide de déploiement](./DEPLOYMENT.md).

### Options de déploiement

- **VPS** : Déploiement traditionnel sur serveur Linux (Ubuntu recommandé)
- **Docker** : Déploiement conteneurisé avec Docker Compose
- **Cloud** : Compatible avec la plupart des plateformes cloud

### Configuration minimale

- Node.js 18+
- 1GB RAM (2GB recommandé)
- 5GB d'espace disque
- Certificat SSL (Let's Encrypt)

### Documentation complète

Le [Guide de déploiement](./DEPLOYMENT.md) couvre :
- Installation sur VPS (Ubuntu)
- Configuration Nginx + SSL
- Gestion avec PM2
- Docker et docker-compose
- Sécurité et monitoring
- Sauvegarde automatique
- Dépannage

## Licence

À définir

## Contact

Pour toute question concernant ce projet, veuillez contacter l'équipe de la Baie des Singes.
