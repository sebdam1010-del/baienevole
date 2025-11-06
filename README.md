# Baie des Singes - Plateforme de Gestion des Bénévoles

[![CI](https://github.com/sebdam1010-del/baienevole/actions/workflows/ci.yml/badge.svg)](https://github.com/sebdam1010-del/baienevole/actions/workflows/ci.yml)

Plateforme web développée en Node.js pour faciliter la gestion de l'emploi du temps des bénévoles de la Baie des Singes.

**🎯 Méthodologie : TDD (Test-Driven Development)**
**📱 Design : Responsive et moderne (mobile-first)**

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
- **Base de données**: PostgreSQL (recommandé)
- **Frontend**: Framework moderne (React/Vue/Svelte) + Tailwind CSS
- **Tests**: Jest + Supertest + Playwright/Cypress
- **ORM**: Sequelize ou Prisma

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

## Structure du projet

```
baienevole/
├── src/
│   ├── routes/          # Routes API
│   ├── controllers/     # Logique métier
│   ├── models/          # Modèles de données
│   ├── middleware/      # Middleware Express
│   └── utils/           # Utilitaires
├── tests/               # Tests
├── public/              # Fichiers statiques
└── views/               # Templates (si applicable)
```

## Fonctionnalités prévues

- [ ] Authentification des bénévoles
- [ ] Gestion des profils utilisateurs
- [ ] Création de créneaux horaires
- [ ] Gestion des événements
  - [ ] Création manuelle d'événements
  - [ ] Import d'événements via fichier CSV
  - [ ] Validation et prévisualisation des données CSV
  - [ ] Gestion des erreurs d'import
  - [ ] Spécifier le nombre de bénévoles requis par événement
- [ ] Système d'inscription flexible aux événements
  - [ ] Inscription illimitée (pas de blocage)
  - [ ] Affichage avec code couleur selon le quota :
    - 🟢 Vert : inscriptions dans le quota requis
    - 🟠 Orange : quota dépassé de 1 à 2 personnes
    - 🔴 Rouge : quota dépassé de plus de 2 personnes
  - [ ] Les bénévoles peuvent s'inscrire même si quota atteint
- [ ] Tableau de bord pour visualiser les plannings
- [ ] Notifications par email
- [ ] Export des plannings (PDF, iCal)
- [ ] Interface d'administration

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

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

À définir

## Contact

Pour toute question concernant ce projet, veuillez contacter l'équipe de la Baie des Singes.
