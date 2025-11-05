# Baie des Singes - Plateforme de Gestion des Bénévoles

Plateforme web développée en Node.js pour faciliter la gestion de l'emploi du temps des bénévoles de la Baie des Singes.

## Description

Cette application permet de :
- Gérer les profils des bénévoles
- Créer et organiser des créneaux horaires
- Gérer les événements (création manuelle ou import CSV)
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
nom,description,date_debut,date_fin,lieu,nombre_benevoles_requis
Nettoyage plage,Nettoyage de la plage principale,2024-06-15 09:00,2024-06-15 12:00,Plage des Singes,5
Accueil visiteurs,Accueil et orientation des visiteurs,2024-06-16 14:00,2024-06-16 18:00,Entrée principale,3
```

### Colonnes requises

- **nom** : Nom de l'événement (obligatoire)
- **description** : Description détaillée de l'événement (optionnel)
- **date_debut** : Date et heure de début au format YYYY-MM-DD HH:MM (obligatoire)
- **date_fin** : Date et heure de fin au format YYYY-MM-DD HH:MM (obligatoire)
- **lieu** : Lieu de l'événement (optionnel)
- **nombre_benevoles_requis** : Nombre de bénévoles nécessaires (optionnel, défaut: 1)

### Règles de validation

- Les dates doivent être au format ISO (YYYY-MM-DD HH:MM)
- La date de fin doit être postérieure à la date de début
- Le nombre de bénévoles doit être un entier positif
- L'encodage du fichier doit être UTF-8

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

À définir

## Contact

Pour toute question concernant ce projet, veuillez contacter l'équipe de la Baie des Singes.
