#!/usr/bin/env node

/**
 * Script pour créer les issues GitHub via l'API
 *
 * Usage:
 *   GITHUB_TOKEN=your_token node create-issues.js
 *
 * Ou si gh CLI fonctionne, utilisez plutôt le script create-issues.sh
 */

const https = require('https');

const REPO_OWNER = 'sebdam1010-del';
const REPO_NAME = 'baienevole';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.error('');
  console.error('Generate a token at: https://github.com/settings/tokens');
  console.error('Required scopes: repo');
  console.error('');
  console.error('Usage: GITHUB_TOKEN=your_token node create-issues.js');
  process.exit(1);
}

const issues = [
  {
    title: '🔧 Setup du projet Node.js avec structure TDD',
    body: `## Objectif
Initialiser le projet Node.js avec une architecture propre et configurée pour le TDD.

## Tasks
- [ ] Initialiser package.json avec les dépendances nécessaires
- [ ] Installer Express.js pour le serveur web
- [ ] Configurer Jest pour les tests unitaires
- [ ] Configurer Supertest pour les tests d'intégration
- [ ] Créer la structure de dossiers (src/, tests/, public/)
- [ ] Configurer ESLint et Prettier
- [ ] Créer un fichier .env.example
- [ ] Ajouter .gitignore approprié

## Critères d'acceptation
- ✅ package.json configuré avec tous les scripts (test, start, dev)
- ✅ Structure de dossiers créée et documentée
- ✅ Premier test (sanity check) qui passe
- ✅ README mis à jour avec les commandes de dev

## Priorité
Critique - Prérequis pour tout le reste`,
    labels: ['setup', 'tdd', 'priority:high']
  },
  {
    title: '🔧 Configuration de la base de données',
    body: `## Objectif
Choisir et configurer la base de données pour l'application.

## Tasks
- [ ] Choisir la base de données (PostgreSQL recommandé)
- [ ] Installer et configurer l'ORM (Sequelize ou Prisma)
- [ ] Créer le schéma de base de données
- [ ] Configurer les migrations
- [ ] Écrire les tests pour la connexion DB
- [ ] Créer un script de seed pour les données de développement

## Critères d'acceptation
- ✅ Connexion à la base de données fonctionnelle
- ✅ Migrations configurées et documentées
- ✅ Tests de connexion passent
- ✅ Script de seed disponible`,
    labels: ['setup', 'database', 'priority:high']
  },
  {
    title: '🔧 Configuration CI/CD avec GitHub Actions',
    body: `## Objectif
Mettre en place l'intégration continue pour garantir que tous les tests passent avant chaque commit/PR.

## Tasks
- [ ] Créer workflow GitHub Actions pour les tests
- [ ] Configurer l'exécution automatique des tests sur PR
- [ ] Bloquer les merges si les tests échouent
- [ ] Ajouter badge de statut dans le README
- [ ] Configurer la couverture de code avec Istanbul/Jest

## Critères d'acceptation
- ✅ Workflow CI fonctionnel
- ✅ Tests exécutés automatiquement sur chaque PR
- ✅ Rapport de couverture de code disponible
- ✅ Badge de statut dans le README`,
    labels: ['setup', 'ci-cd', 'priority:medium']
  },
  {
    title: '🔐 Système d\'authentification des utilisateurs (TDD)',
    body: `## Objectif
Implémenter un système d'authentification sécurisé avec JWT en suivant la méthodologie TDD.

## Tasks
- [ ] Écrire les tests pour l'inscription des utilisateurs
- [ ] Implémenter l'inscription (hash bcrypt)
- [ ] Écrire les tests pour la connexion
- [ ] Implémenter la connexion avec JWT
- [ ] Écrire les tests pour la vérification du token
- [ ] Implémenter le middleware d'authentification
- [ ] Écrire les tests pour le refresh token
- [ ] Implémenter le refresh token

## Critères d'acceptation
- ✅ Tous les tests passent (couverture > 90%)
- ✅ Mots de passe hashés avec bcrypt
- ✅ JWT généré et vérifié correctement
- ✅ Middleware d'authentification fonctionnel
- ✅ Documentation API pour les endpoints auth`,
    labels: ['feature', 'authentication', 'tdd', 'priority:high']
  },
  {
    title: '🔐 Gestion des rôles (Admin / Bénévole) (TDD)',
    body: `## Objectif
Implémenter un système de rôles pour différencier les administrateurs des bénévoles.

## Tasks
- [ ] Écrire les tests pour les rôles utilisateur
- [ ] Ajouter le champ role au modèle User
- [ ] Écrire les tests pour le middleware de vérification des rôles
- [ ] Implémenter le middleware isAdmin
- [ ] Écrire les tests pour les permissions
- [ ] Protéger les routes admin

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Rôles Admin et Bénévole fonctionnels
- ✅ Routes admin protégées
- ✅ Middleware de vérification des rôles testés`,
    labels: ['feature', 'authorization', 'tdd', 'priority:high']
  },
  {
    title: '📅 Modèle et CRUD Événements (TDD)',
    body: `## Objectif
Créer le modèle Événement et implémenter les opérations CRUD en TDD.

## Tasks
- [ ] Écrire les tests pour le modèle Event
- [ ] Créer le modèle Event (date, nom, description, nombre_spectateurs_attendus, nombre_benevoles_requis, saison, commentaires)
- [ ] Écrire les tests pour CREATE event
- [ ] Implémenter POST /api/events
- [ ] Écrire les tests pour READ events
- [ ] Implémenter GET /api/events et GET /api/events/:id
- [ ] Écrire les tests pour UPDATE event
- [ ] Implémenter PUT /api/events/:id
- [ ] Écrire les tests pour DELETE event
- [ ] Implémenter DELETE /api/events/:id

## Critères d'acceptation
- ✅ Tous les tests passent (couverture > 90%)
- ✅ Validation des données (date, nombre de spectateurs, nombre de bénévoles requis, saison)
- ✅ Système d'archivage par saison (septembre à juin)
- ✅ Routes protégées (admin uniquement pour create/update/delete)
- ✅ Documentation API complète`,
    labels: ['feature', 'events', 'tdd', 'priority:high']
  },
  {
    title: '📅 Import CSV d\'événements (TDD)',
    body: `## Objectif
Permettre aux admins d'importer des événements en masse via un fichier CSV.

## Tasks
- [ ] Écrire les tests pour le parsing CSV
- [ ] Implémenter le parser CSV avec validation
- [ ] Écrire les tests pour la validation des données
- [ ] Implémenter la validation (dates, format, etc.)
- [ ] Écrire les tests pour l'endpoint d'import
- [ ] Implémenter POST /api/events/import
- [ ] Écrire les tests pour la gestion des erreurs
- [ ] Gérer les erreurs de format et les doublons
- [ ] Créer une prévisualisation des données avant import

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ CSV parsé correctement selon le format documenté
- ✅ Validation complète des données
- ✅ Gestion des erreurs avec messages clairs
- ✅ Prévisualisation des données disponible
- ✅ Upload limité aux admins`,
    labels: ['feature', 'events', 'csv', 'tdd', 'priority:high']
  },
  {
    title: '📅 Système d\'inscription aux événements (TDD)',
    body: `## Objectif
Permettre aux bénévoles de s'inscrire aux événements de manière flexible avec indicateurs visuels.

## Tasks
- [ ] Écrire les tests pour le modèle EventRegistration
- [ ] Créer la table de relation Event-User (inscriptions)
- [ ] Écrire les tests pour l'inscription à un événement
- [ ] Implémenter POST /api/events/:id/register (inscription illimitée)
- [ ] Écrire les tests pour la désinscription
- [ ] Implémenter DELETE /api/events/:id/register
- [ ] Écrire les tests pour le calcul du code couleur
- [ ] Implémenter la logique d'affichage avec code couleur :
  - 🟢 Vert (#ABD4A9) : inscrits ≤ quota requis
  - 🟠 Orange (#EF7856) : quota dépassé de 1 à 2
  - 🔴 Rouge (#DD2D4A) : quota dépassé de +2
- [ ] Écrire les tests pour les conflits d'horaire
- [ ] Avertir (sans bloquer) en cas d'événements simultanés
- [ ] Afficher le statut quota dans les réponses API

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Inscriptions illimitées (pas de blocage)
- ✅ Code couleur calculé et affiché correctement
- ✅ Bénévoles peuvent s'inscrire même si quota dépassé
- ✅ Détection des conflits d'horaire (avertissement seulement)
- ✅ Historique des inscriptions disponible
- ✅ API retourne le statut du quota (vert/orange/rouge)`,
    labels: ['feature', 'events', 'registration', 'tdd', 'priority:high']
  },
  {
    title: '👥 Profil bénévole (TDD)',
    body: `## Objectif
Créer et gérer les profils des bénévoles.

## Tasks
- [ ] Écrire les tests pour le modèle User/Volunteer
- [ ] Étendre le modèle User avec les infos bénévoles (téléphone, compétences, disponibilités)
- [ ] Écrire les tests pour GET profil
- [ ] Implémenter GET /api/profile
- [ ] Écrire les tests pour UPDATE profil
- [ ] Implémenter PUT /api/profile
- [ ] Écrire les tests pour la liste des bénévoles (admin)
- [ ] Implémenter GET /api/volunteers (admin uniquement)

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Bénévoles peuvent voir/modifier leur profil
- ✅ Admins peuvent voir la liste des bénévoles
- ✅ Validation des données de profil`,
    labels: ['feature', 'volunteers', 'tdd', 'priority:medium']
  },
  {
    title: '👥 Tableau de bord bénévole (TDD)',
    body: `## Objectif
Créer un tableau de bord pour que les bénévoles voient leurs inscriptions et événements à venir.

## Tasks
- [ ] Écrire les tests pour l'endpoint dashboard
- [ ] Implémenter GET /api/dashboard/my-events (événements inscrits)
- [ ] Écrire les tests pour les événements à venir
- [ ] Implémenter GET /api/dashboard/upcoming
- [ ] Écrire les tests pour l'historique
- [ ] Implémenter GET /api/dashboard/history
- [ ] Écrire les tests pour les statistiques
- [ ] Implémenter GET /api/dashboard/stats (heures bénévolat, etc.)

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Dashboard affiche les événements du bénévole
- ✅ Statistiques calculées correctement
- ✅ Filtre par date/statut disponible`,
    labels: ['feature', 'volunteers', 'dashboard', 'tdd', 'priority:medium']
  },
  {
    title: '🎨 Setup Frontend avec framework moderne',
    body: `## Objectif
Choisir et configurer un framework frontend moderne et responsive.

## Tasks
- [ ] Choisir le framework (React, Vue, ou Svelte recommandés)
- [ ] Initialiser le projet frontend
- [ ] Configurer un framework CSS (Tailwind CSS recommandé pour responsive)
- [ ] Créer la structure de composants
- [ ] Configurer le routing
- [ ] Connecter au backend (axios/fetch)
- [ ] Configurer les variables d'environnement

## Critères d'acceptation
- ✅ Framework frontend configuré
- ✅ Design system responsive en place
- ✅ Connexion au backend fonctionnelle
- ✅ Structure de composants claire`,
    labels: ['frontend', 'setup', 'priority:high']
  },
  {
    title: '🎨 Design System et composants de base (TDD)',
    body: `## Objectif
Créer un design system cohérent avec les composants de base réutilisables.

## Tasks
- [ ] Implémenter la charte graphique du brandboard (voir DESIGN-SYSTEM.md)
  - Palette de couleurs : #131226, #DD2D4A, #DFB999, #EF7856, #F5AC44, #ABD4A9
  - Typographie : Protest Riot (H1), League Spartan (corps)
- [ ] Configurer Tailwind CSS avec les couleurs de la marque
- [ ] Écrire les tests pour les composants Button
- [ ] Créer composant Button (primary, secondary, success avec variants)
- [ ] Écrire les tests pour Input/Form
- [ ] Créer composants Input, Textarea, Select
- [ ] Écrire les tests pour Card
- [ ] Créer composant Card avec bordure beige
- [ ] Écrire les tests pour Modal
- [ ] Créer composant Modal
- [ ] Écrire les tests pour Badge
- [ ] Créer composant Badge (success/warning/danger/info)
- [ ] Écrire les tests pour Table responsive
- [ ] Créer composant Table
- [ ] Intégrer les logos (pastille, pillule, écussons, pancartes, branche)
- [ ] Tester la responsivité sur mobile/tablet/desktop

## Critères d'acceptation
- ✅ Tous les tests de composants passent
- ✅ Charte graphique La Baie des Singes respectée
- ✅ Composants réutilisables et documentés
- ✅ Design responsive (mobile-first)
- ✅ Accessibilité WCAG 2.1 respectée
- ✅ Logos intégrés et optimisés
- ✅ Documentation Storybook (optionnel)`,
    labels: ['frontend', 'ui', 'design', 'tdd', 'priority:high']
  },
  {
    title: '🎨 Page d\'authentification responsive (TDD)',
    body: `## Objectif
Créer les pages de connexion et inscription avec design responsive.

## Tasks
- [ ] Écrire les tests pour le formulaire de connexion
- [ ] Créer la page de connexion
- [ ] Écrire les tests pour le formulaire d'inscription
- [ ] Créer la page d'inscription
- [ ] Écrire les tests pour la validation des formulaires
- [ ] Implémenter la validation côté client
- [ ] Écrire les tests pour la gestion des erreurs
- [ ] Afficher les messages d'erreur
- [ ] Tester la responsivité mobile

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Pages responsive sur tous les écrans
- ✅ Validation en temps réel
- ✅ UX fluide et intuitive
- ✅ Gestion des erreurs claire`,
    labels: ['frontend', 'authentication', 'ui', 'tdd', 'priority:high']
  },
  {
    title: '🎨 Interface admin - Gestion des événements (TDD)',
    body: `## Objectif
Créer l'interface admin pour gérer les événements (création, modification, suppression).

## Tasks
- [ ] Écrire les tests pour la liste des événements
- [ ] Créer la page liste des événements (Table responsive)
- [ ] Écrire les tests pour le formulaire de création
- [ ] Créer le formulaire de création d'événement
- [ ] Écrire les tests pour le formulaire d'édition
- [ ] Créer le formulaire d'édition
- [ ] Écrire les tests pour la suppression
- [ ] Implémenter la confirmation de suppression
- [ ] Écrire les tests pour les filtres/recherche
- [ ] Ajouter filtres et recherche

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Interface responsive et intuitive
- ✅ CRUD complet fonctionnel
- ✅ Confirmations pour actions destructives
- ✅ Filtres et recherche opérationnels`,
    labels: ['frontend', 'admin', 'events', 'ui', 'tdd', 'priority:high']
  },
  {
    title: '🎨 Interface admin - Import CSV (TDD)',
    body: `## Objectif
Créer l'interface d'import CSV avec drag & drop et prévisualisation.

## Tasks
- [ ] Écrire les tests pour l'upload de fichier
- [ ] Créer la zone de drag & drop pour CSV
- [ ] Écrire les tests pour la prévisualisation
- [ ] Afficher une prévisualisation des données
- [ ] Écrire les tests pour la validation
- [ ] Afficher les erreurs de validation
- [ ] Écrire les tests pour la confirmation d'import
- [ ] Implémenter l'import final
- [ ] Tester la responsivité mobile

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Drag & drop fonctionnel
- ✅ Prévisualisation claire des données
- ✅ Gestion des erreurs détaillée
- ✅ UX fluide et intuitive
- ✅ Responsive sur mobile`,
    labels: ['frontend', 'admin', 'csv', 'ui', 'tdd', 'priority:high']
  },
  {
    title: '🎨 Interface bénévole - Calendrier des événements (TDD)',
    body: `## Objectif
Créer un calendrier responsive pour visualiser et s'inscrire aux événements.

## Tasks
- [ ] Écrire les tests pour l'affichage du calendrier
- [ ] Intégrer une bibliothèque de calendrier (FullCalendar ou similaire)
- [ ] Écrire les tests pour l'affichage des événements
- [ ] Afficher les événements disponibles
- [ ] Écrire les tests pour l'inscription
- [ ] Implémenter l'inscription en un clic
- [ ] Écrire les tests pour les vues (mois/semaine/jour)
- [ ] Ajouter les différentes vues
- [ ] Écrire les tests pour les filtres
- [ ] Ajouter filtres par type/lieu
- [ ] Tester la responsivité mobile

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Calendrier responsive et lisible
- ✅ Inscription intuitive
- ✅ Multiples vues disponibles
- ✅ Filtres fonctionnels
- ✅ UX mobile optimisée`,
    labels: ['frontend', 'volunteers', 'calendar', 'ui', 'tdd', 'priority:high']
  },
  {
    title: '🎨 Interface bénévole - Dashboard personnel (TDD)',
    body: `## Objectif
Créer le tableau de bord personnel du bénévole avec ses inscriptions et statistiques.

## Tasks
- [ ] Écrire les tests pour l'affichage des inscriptions
- [ ] Afficher les événements à venir
- [ ] Écrire les tests pour l'historique
- [ ] Afficher l'historique des participations
- [ ] Écrire les tests pour les statistiques
- [ ] Afficher statistiques (heures, nombre d'événements)
- [ ] Écrire les tests pour la gestion du profil
- [ ] Intégrer l'édition du profil
- [ ] Tester la responsivité

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Dashboard clair et informatif
- ✅ Statistiques visuelles (graphiques)
- ✅ Responsive sur tous les écrans
- ✅ Navigation intuitive`,
    labels: ['frontend', 'volunteers', 'dashboard', 'ui', 'tdd', 'priority:medium']
  },
  {
    title: '🔔 Système de notifications email (TDD)',
    body: `## Objectif
Implémenter un système de notifications par email pour les rappels d'événements.

## Tasks
- [ ] Écrire les tests pour l'envoi d'email
- [ ] Configurer Nodemailer ou service email (SendGrid, Mailgun)
- [ ] Écrire les tests pour les templates d'email
- [ ] Créer les templates d'email (inscription, rappel, annulation)
- [ ] Écrire les tests pour les rappels automatiques
- [ ] Implémenter rappels 24h avant événement
- [ ] Écrire les tests pour la file d'attente
- [ ] Utiliser une queue (Bull/Redis) pour les emails

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Emails envoyés correctement
- ✅ Templates professionnels et clairs
- ✅ Rappels automatiques fonctionnels
- ✅ Gestion des erreurs d'envoi`,
    labels: ['feature', 'notifications', 'email', 'tdd', 'priority:medium']
  },
  {
    title: '📊 Export des plannings (PDF, iCal) (TDD)',
    body: `## Objectif
Permettre l'export des plannings en PDF et iCal.

## Tasks
- [ ] Écrire les tests pour l'export PDF
- [ ] Implémenter GET /api/events/export/pdf
- [ ] Écrire les tests pour l'export iCal
- [ ] Implémenter GET /api/events/export/ical
- [ ] Écrire les tests pour l'export CSV
- [ ] Implémenter GET /api/events/export/csv
- [ ] Tester les formats générés

## Critères d'acceptation
- ✅ Tous les tests passent
- ✅ Exports PDF formatés correctement
- ✅ iCal compatible avec calendriers standards
- ✅ CSV structuré et réutilisable`,
    labels: ['feature', 'export', 'tdd', 'priority:low']
  },
  {
    title: '🧪 Configuration de la couverture de code (>80%)',
    body: `## Objectif
Configurer Jest pour mesurer et maintenir une couverture de code élevée.

## Tasks
- [ ] Configurer Jest coverage
- [ ] Définir seuils minimaux (80% statements, branches, functions, lines)
- [ ] Ajouter script npm run test:coverage
- [ ] Intégrer dans CI/CD
- [ ] Exclure les fichiers de configuration du coverage

## Critères d'acceptation
- ✅ Coverage configuré et fonctionnel
- ✅ Seuils minimaux définis
- ✅ Rapport généré automatiquement
- ✅ CI/CD vérifie la couverture`,
    labels: ['testing', 'quality', 'priority:high']
  },
  {
    title: '🧪 Tests end-to-end (E2E) avec Playwright ou Cypress',
    body: `## Objectif
Ajouter des tests E2E pour les parcours utilisateurs critiques.

## Tasks
- [ ] Choisir et installer l'outil E2E (Playwright ou Cypress)
- [ ] Configurer les tests E2E
- [ ] Écrire tests E2E pour le parcours d'inscription
- [ ] Écrire tests E2E pour l'authentification
- [ ] Écrire tests E2E pour la création d'événement (admin)
- [ ] Écrire tests E2E pour l'inscription à un événement
- [ ] Intégrer dans CI/CD

## Critères d'acceptation
- ✅ Tests E2E configurés et fonctionnels
- ✅ Parcours critiques couverts
- ✅ Tests passent en local et en CI
- ✅ Screenshots/vidéos des échecs disponibles`,
    labels: ['testing', 'e2e', 'priority:medium']
  },
  {
    title: '📱 Transformer en PWA (TDD)',
    body: `## Objectif
Rendre l'application installable comme PWA pour une meilleure expérience mobile.

## Tasks
- [ ] Créer le manifest.json
- [ ] Configurer le service worker
- [ ] Écrire les tests pour le mode offline
- [ ] Implémenter cache basique pour mode offline
- [ ] Ajouter les icônes d'application
- [ ] Tester l'installation sur mobile

## Critères d'acceptation
- ✅ Application installable sur mobile
- ✅ Mode offline basique fonctionnel
- ✅ Icônes et splash screen configurés
- ✅ Tests passent`,
    labels: ['feature', 'pwa', 'tdd', 'priority:low']
  },
  {
    title: '📚 Documentation API complète',
    body: `## Objectif
Créer une documentation API complète avec Swagger/OpenAPI.

## Tasks
- [ ] Installer Swagger/OpenAPI
- [ ] Documenter tous les endpoints
- [ ] Ajouter exemples de requêtes/réponses
- [ ] Générer documentation interactive
- [ ] Ajouter lien dans README

## Critères d'acceptation
- ✅ Documentation Swagger accessible
- ✅ Tous les endpoints documentés
- ✅ Exemples clairs et complets
- ✅ Schémas de données définis`,
    labels: ['documentation', 'priority:medium']
  },
  {
    title: '📚 Guide de contribution',
    body: `## Objectif
Créer un CONTRIBUTING.md pour guider les nouveaux contributeurs.

## Tasks
- [ ] Créer CONTRIBUTING.md
- [ ] Expliquer le workflow TDD
- [ ] Documenter les conventions de code
- [ ] Expliquer le processus de PR
- [ ] Ajouter exemples de tests

## Critères d'acceptation
- ✅ CONTRIBUTING.md complet
- ✅ Guidelines claires
- ✅ Exemples concrets
- ✅ Process documenté`,
    labels: ['documentation', 'priority:low']
  },
  {
    title: '🚀 Configuration du déploiement',
    body: `## Objectif
Préparer le déploiement en production.

## Tasks
- [ ] Choisir plateforme (Heroku, Vercel, Railway, etc.)
- [ ] Configurer les variables d'environnement
- [ ] Configurer la base de données en production
- [ ] Créer script de déploiement
- [ ] Documenter le processus de déploiement

## Critères d'acceptation
- ✅ Application déployable facilement
- ✅ Variables d'environnement configurées
- ✅ Base de données production prête
- ✅ Documentation de déploiement`,
    labels: ['deployment', 'priority:low']
  }
];

function createIssue(issue, callback) {
  const data = JSON.stringify({
    title: issue.title,
    body: issue.body,
    labels: issue.labels
  });

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'Node.js'
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201) {
        const result = JSON.parse(responseData);
        console.log(`✅ Created issue #${result.number}: ${issue.title}`);
        callback(null, result);
      } else {
        console.error(`❌ Failed to create issue: ${issue.title}`);
        console.error(`Status: ${res.statusCode}`);
        console.error(`Response: ${responseData}`);
        callback(new Error(`HTTP ${res.statusCode}`));
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Error creating issue: ${issue.title}`);
    console.error(error);
    callback(error);
  });

  req.write(data);
  req.end();
}

async function createAllIssues() {
  console.log(`🚀 Creating ${issues.length} issues on ${REPO_OWNER}/${REPO_NAME}...\n`);

  for (const issue of issues) {
    await new Promise((resolve) => {
      createIssue(issue, (err) => {
        setTimeout(resolve, 1000); // Rate limiting: wait 1 second between requests
      });
    });
  }

  console.log('\n✨ Done! Check your issues at:');
  console.log(`https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
}

createAllIssues().catch(console.error);
