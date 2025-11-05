# Baie des Singes - Plateforme de Gestion des Bénévoles

Plateforme web développée en Node.js pour faciliter la gestion de l'emploi du temps des bénévoles de la Baie des Singes.

## Description

Cette application permet de :
- Gérer les profils des bénévoles
- Créer et organiser des créneaux horaires
- Permettre aux bénévoles de s'inscrire aux créneaux disponibles
- Visualiser les plannings en temps réel
- Recevoir des notifications et rappels

## Technologies

- **Backend**: Node.js
- **Base de données**: À définir
- **Frontend**: À définir

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
- [ ] Système d'inscription aux créneaux
- [ ] Tableau de bord pour visualiser les plannings
- [ ] Notifications par email
- [ ] Export des plannings (PDF, iCal)
- [ ] Interface d'administration

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

À définir

## Contact

Pour toute question concernant ce projet, veuillez contacter l'équipe de la Baie des Singes.
