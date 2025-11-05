# Baie des Singes - Plateforme de Gestion des Bénévoles

Plateforme web développée en Node.js pour faciliter la gestion de l'emploi du temps des bénévoles de la Baie des Singes.

**🎯 Méthodologie : TDD (Test-Driven Development)**
**📱 Design : Responsive et moderne (mobile-first)**

## Description

Cette application permet de :
- Gérer les profils des bénévoles
- Créer et organiser des créneaux horaires
- Gérer les événements (création manuelle ou import CSV)
- Permettre aux bénévoles de s'inscrire aux créneaux disponibles
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

# Lancer l'application
npm start
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
- [ ] Système d'inscription aux créneaux
- [ ] Tableau de bord pour visualiser les plannings
- [ ] Notifications par email
- [ ] Export des plannings (PDF, iCal)
- [ ] Interface d'administration

## Format CSV pour l'import d'événements

Les administrateurs peuvent importer des événements en masse via un fichier CSV. Le fichier doit respecter le format suivant :

### Structure du fichier

```csv
date,nom,description,nombre_spectateurs_attendus,saison,commentaires
2024-06-15,Spectacle de marionnettes,Spectacle pour enfants avec les marionnettes géantes,150,29,Prévoir chaises supplémentaires
2024-09-20,Concert acoustique,Concert en plein air avec artistes locaux,200,30,Annulation si pluie
```

### Colonnes requises

- **date** : Date de l'événement au format YYYY-MM-DD (obligatoire)
- **nom** : Nom de l'événement (obligatoire)
- **description** : Description détaillée de l'événement (optionnel)
- **nombre_spectateurs_attendus** : Nombre de spectateurs prévus (optionnel, défaut: 0)
- **saison** : Numéro de saison pour l'archivage (obligatoire) - La saison se déroule de septembre à juin
- **commentaires** : Commentaires ou notes sur l'événement (optionnel)

### Règles de validation

- La date doit être au format ISO (YYYY-MM-DD)
- Le nombre de spectateurs doit être un entier positif ou zéro
- La saison doit être un entier positif (exemple: 29 pour la saison actuelle)
- L'encodage du fichier doit être UTF-8

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
