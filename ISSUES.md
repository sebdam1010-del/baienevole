# Issues GitHub - Plateforme Baie des Singes

Ce document contient toutes les issues à créer sur GitHub pour jalonner le projet.

## ✅ État du projet

**Toutes les 25 issues sont complétées !**

Le projet est **production-ready** avec :
- 169 tests (131 unit/integration + 28 E2E + 10 PWA)
- 81.47% de couverture de code
- Documentation complète (API, Contribution, Déploiement)
- CI/CD fonctionnel avec GitHub Actions
- Progressive Web App (PWA) installable
- Système de notifications email automatiques

### Résumé par phase

| Phase | Issues | État |
|-------|--------|------|
| **Phase 1 : Infrastructure & Setup** | #1, #2, #3 | ✅ Complétée |
| **Phase 2 : Backend Core** | #4, #5, #6, #7, #8 | ✅ Complétée |
| **Phase 3 : Backend Extended** | #9, #10, #19 | ✅ Complétée |
| **Phase 4 : Frontend** | #11, #12, #13, #14, #15, #16, #17 | ✅ Complétée |
| **Phase 5 : Features avancées** | #18, #20, #21, #22 | ✅ Complétée |
| **Phase 6 : Documentation & Déploiement** | #23, #24, #25 | ✅ Complétée |

**Dernier commit :** Issue #20 - Configuration de la couverture de code (>80%)

---

## 🔧 Infrastructure & Setup

### Issue #1: Setup du projet Node.js avec structure TDD
**Labels:** `setup`, `tdd`, `priority:high`

**Description:**
Initialiser le projet Node.js avec une architecture propre et configurée pour le TDD.

**Tasks:**
- [ ] Initialiser package.json avec les dépendances nécessaires
- [ ] Installer Express.js pour le serveur web
- [ ] Configurer Jest pour les tests unitaires
- [ ] Configurer Supertest pour les tests d'intégration
- [ ] Créer la structure de dossiers (src/, tests/, public/)
- [ ] Configurer ESLint et Prettier
- [ ] Créer un fichier .env.example
- [ ] Ajouter .gitignore approprié

**Critères d'acceptation:**
- ✅ package.json configuré avec tous les scripts (test, start, dev)
- ✅ Structure de dossiers créée et documentée
- ✅ Premier test (sanity check) qui passe
- ✅ README mis à jour avec les commandes de dev

**Priorité:** Critique - Prérequis pour tout le reste

---

### Issue #2: Configuration de la base de données
**Labels:** `setup`, `database`, `priority:high`

**Description:**
Choisir et configurer la base de données pour l'application.

**Tasks:**
- [ ] Choisir la base de données (PostgreSQL recommandé)
- [ ] Installer et configurer l'ORM (Sequelize ou Prisma)
- [ ] Créer le schéma de base de données
- [ ] Configurer les migrations
- [ ] Écrire les tests pour la connexion DB
- [ ] Créer un script de seed pour les données de développement

**Critères d'acceptation:**
- ✅ Connexion à la base de données fonctionnelle
- ✅ Migrations configurées et documentées
- ✅ Tests de connexion passent
- ✅ Script de seed disponible

---

### Issue #3: Configuration CI/CD avec GitHub Actions
**Labels:** `setup`, `ci-cd`, `priority:medium`

**Description:**
Mettre en place l'intégration continue pour garantir que tous les tests passent avant chaque commit/PR.

**Tasks:**
- [ ] Créer workflow GitHub Actions pour les tests
- [ ] Configurer l'exécution automatique des tests sur PR
- [ ] Bloquer les merges si les tests échouent
- [ ] Ajouter badge de statut dans le README
- [ ] Configurer la couverture de code avec Istanbul/Jest

**Critères d'acceptation:**
- ✅ Workflow CI fonctionnel
- ✅ Tests exécutés automatiquement sur chaque PR
- ✅ Rapport de couverture de code disponible
- ✅ Badge de statut dans le README

---

## 🔐 Authentification & Autorisation

### Issue #4: Système d'authentification des utilisateurs (TDD)
**Labels:** `feature`, `authentication`, `tdd`, `priority:high`

**Description:**
Implémenter un système d'authentification sécurisé avec JWT en suivant la méthodologie TDD.

**Tasks:**
- [ ] Écrire les tests pour l'inscription des utilisateurs
- [ ] Implémenter l'inscription (hash bcrypt)
- [ ] Écrire les tests pour la connexion
- [ ] Implémenter la connexion avec JWT
- [ ] Écrire les tests pour la vérification du token
- [ ] Implémenter le middleware d'authentification
- [ ] Écrire les tests pour le refresh token
- [ ] Implémenter le refresh token

**Critères d'acceptation:**
- ✅ Tous les tests passent (couverture > 90%)
- ✅ Mots de passe hashés avec bcrypt
- ✅ JWT généré et vérifié correctement
- ✅ Middleware d'authentification fonctionnel
- ✅ Documentation API pour les endpoints auth

---

### Issue #5: Gestion des rôles (Admin / Bénévole) (TDD)
**Labels:** `feature`, `authorization`, `tdd`, `priority:high`

**Description:**
Implémenter un système de rôles pour différencier les administrateurs des bénévoles.

**Tasks:**
- [ ] Écrire les tests pour les rôles utilisateur
- [ ] Ajouter le champ role au modèle User
- [ ] Écrire les tests pour le middleware de vérification des rôles
- [ ] Implémenter le middleware isAdmin
- [ ] Écrire les tests pour les permissions
- [ ] Protéger les routes admin

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Rôles Admin et Bénévole fonctionnels
- ✅ Routes admin protégées
- ✅ Middleware de vérification des rôles testés

---

## 📅 Gestion des Événements

### Issue #6: Modèle et CRUD Événements (TDD)
**Labels:** `feature`, `events`, `tdd`, `priority:high`

**Description:**
Créer le modèle Événement et implémenter les opérations CRUD en TDD.

**Tasks:**
- [ ] Écrire les tests pour le modèle Event
- [ ] Créer le modèle Event (date, nom, description, horaire_arrivee, horaire_depart, nombre_spectateurs_attendus, nombre_benevoles_requis, saison, commentaires)
- [ ] Écrire les tests pour CREATE event
- [ ] Implémenter POST /api/events
- [ ] Écrire les tests pour READ events
- [ ] Implémenter GET /api/events et GET /api/events/:id
- [ ] Écrire les tests pour UPDATE event
- [ ] Implémenter PUT /api/events/:id
- [ ] Écrire les tests pour DELETE event
- [ ] Implémenter DELETE /api/events/:id

**Critères d'acceptation:**
- ✅ Tous les tests passent (couverture > 90%)
- ✅ Validation des données (date, nombre de spectateurs, nombre de bénévoles requis, saison)
- ✅ Système d'archivage par saison (septembre à juin)
- ✅ Routes protégées (admin uniquement pour create/update/delete)
- ✅ Documentation API complète

---

### Issue #7: Import CSV d'événements (TDD)
**Labels:** `feature`, `events`, `csv`, `tdd`, `priority:high`

**Description:**
Permettre aux admins d'importer des événements en masse via un fichier CSV.

**Tasks:**
- [ ] Écrire les tests pour le parsing CSV
- [ ] Implémenter le parser CSV avec validation
- [ ] Écrire les tests pour la validation des données
- [ ] Implémenter la validation (dates, format, etc.)
- [ ] Écrire les tests pour l'endpoint d'import
- [ ] Implémenter POST /api/events/import
- [ ] Écrire les tests pour la gestion des erreurs
- [ ] Gérer les erreurs de format et les doublons
- [ ] Créer une prévisualisation des données avant import

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ CSV parsé correctement selon le format documenté
- ✅ Validation complète des données
- ✅ Gestion des erreurs avec messages clairs
- ✅ Prévisualisation des données disponible
- ✅ Upload limité aux admins

---

### Issue #8: Système d'inscription aux événements (TDD)
**Labels:** `feature`, `events`, `registration`, `tdd`, `priority:high`

**Description:**
Permettre aux bénévoles de s'inscrire aux événements de manière flexible avec indicateurs visuels.

**Tasks:**
- [ ] Écrire les tests pour le modèle EventRegistration
- [ ] Créer la table de relation Event-User (inscriptions avec timestamp)
- [ ] Écrire les tests pour la vérification du délai 24h
- [ ] Implémenter la logique : bloquer inscription si événement dans moins de 24h
- [ ] Écrire les tests pour l'inscription à un événement
- [ ] Implémenter POST /api/events/:id/register (inscription illimitée si délai > 24h)
- [ ] Écrire les tests pour la désinscription
- [ ] Implémenter DELETE /api/events/:id/register
- [ ] Écrire les tests pour l'alerte email admin en cas de désinscription
- [ ] Implémenter l'envoi automatique d'email aux admins lors d'une désinscription
  - Contenu : nom bénévole, événement, date, horaires, nb restants
- [ ] Écrire les tests pour le calcul du code couleur
- [ ] Implémenter la logique d'affichage avec code couleur :
  - 🟢 Vert (#ABD4A9) : inscrits ≤ quota requis
  - 🟠 Orange (#EF7856) : quota dépassé de 1 à 2
  - 🔴 Rouge (#DD2D4A) : quota dépassé de +2
- [ ] Écrire les tests pour les conflits d'horaire
- [ ] Avertir (sans bloquer) en cas d'événements simultanés
- [ ] Afficher le statut quota dans les réponses API

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Inscriptions bloquées si événement dans moins de 24h
- ✅ Inscriptions illimitées (pas de blocage par quota) si délai > 24h
- ✅ Code couleur calculé et affiché correctement
- ✅ Bénévoles peuvent s'inscrire même si quota dépassé (si délai > 24h)
- ✅ Détection des conflits d'horaire (avertissement seulement)
- ✅ Historique des inscriptions disponible
- ✅ API retourne le statut du quota (vert/orange/rouge)
- ✅ Message clair si inscriptions closes (< 24h)

---

## 👥 Gestion des Bénévoles

### Issue #9: Profil bénévole (TDD)
**Labels:** `feature`, `volunteers`, `tdd`, `priority:medium`

**Description:**
Créer et gérer les profils des bénévoles.

**Tasks:**
- [ ] Écrire les tests pour le modèle User/Volunteer
- [ ] Étendre le modèle User avec les infos bénévoles (téléphone, compétences, disponibilités)
- [ ] Écrire les tests pour GET profil
- [ ] Implémenter GET /api/profile
- [ ] Écrire les tests pour UPDATE profil
- [ ] Implémenter PUT /api/profile
- [ ] Écrire les tests pour la liste des bénévoles (admin)
- [ ] Implémenter GET /api/volunteers (admin uniquement)

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Bénévoles peuvent voir/modifier leur profil
- ✅ Admins peuvent voir la liste des bénévoles
- ✅ Validation des données de profil

---

### Issue #10: Tableau de bord bénévole (TDD)
**Labels:** `feature`, `volunteers`, `dashboard`, `tdd`, `priority:medium`

**Description:**
Créer un tableau de bord pour que les bénévoles voient leurs inscriptions et événements à venir.

**Tasks:**
- [ ] Écrire les tests pour l'endpoint dashboard
- [ ] Implémenter GET /api/dashboard/my-events (événements inscrits)
- [ ] Écrire les tests pour les événements à venir
- [ ] Implémenter GET /api/dashboard/upcoming
- [ ] Écrire les tests pour l'historique
- [ ] Implémenter GET /api/dashboard/history
- [ ] Écrire les tests pour les statistiques
- [ ] Implémenter GET /api/dashboard/stats (heures bénévolat, etc.)

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Dashboard affiche les événements du bénévole
- ✅ Statistiques calculées correctement
- ✅ Filtre par date/statut disponible

---

## 🎨 Interface Utilisateur Responsive

### Issue #11: Setup Frontend avec framework moderne
**Labels:** `frontend`, `setup`, `priority:high`

**Description:**
Choisir et configurer un framework frontend moderne et responsive.

**Tasks:**
- [ ] Choisir le framework (React, Vue, ou Svelte recommandés)
- [ ] Initialiser le projet frontend
- [ ] Configurer un framework CSS (Tailwind CSS recommandé pour responsive)
- [ ] Créer la structure de composants
- [ ] Configurer le routing
- [ ] Connecter au backend (axios/fetch)
- [ ] Configurer les variables d'environnement

**Critères d'acceptation:**
- ✅ Framework frontend configuré
- ✅ Design system responsive en place
- ✅ Connexion au backend fonctionnelle
- ✅ Structure de composants claire

---

### Issue #12: Design System et composants de base (TDD)
**Labels:** `frontend`, `ui`, `design`, `tdd`, `priority:high`

**Description:**
Créer un design system cohérent avec les composants de base réutilisables.

**Tasks:**
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

**Critères d'acceptation:**
- ✅ Tous les tests de composants passent
- ✅ Charte graphique La Baie des Singes respectée
- ✅ Composants réutilisables et documentés
- ✅ Design responsive (mobile-first)
- ✅ Accessibilité WCAG 2.1 respectée
- ✅ Logos intégrés et optimisés
- ✅ Documentation Storybook (optionnel)

---

### Issue #13: Page d'authentification responsive (TDD)
**Labels:** `frontend`, `authentication`, `ui`, `tdd`, `priority:high`

**Description:**
Créer les pages de connexion et inscription avec design responsive.

**Tasks:**
- [ ] Écrire les tests pour le formulaire de connexion
- [ ] Créer la page de connexion
- [ ] Écrire les tests pour le formulaire d'inscription
- [ ] Créer la page d'inscription
- [ ] Écrire les tests pour la validation des formulaires
- [ ] Implémenter la validation côté client
- [ ] Écrire les tests pour la gestion des erreurs
- [ ] Afficher les messages d'erreur
- [ ] Tester la responsivité mobile

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Pages responsive sur tous les écrans
- ✅ Validation en temps réel
- ✅ UX fluide et intuitive
- ✅ Gestion des erreurs claire

---

### Issue #14: Interface admin - Gestion des événements (TDD)
**Labels:** `frontend`, `admin`, `events`, `ui`, `tdd`, `priority:high`

**Description:**
Créer l'interface admin complète pour gérer les événements avec tableau détaillé, gestion manuelle des inscriptions, exports et statistiques.

**Tasks:**
- [ ] Écrire les tests pour le tableau des événements
- [ ] Créer le tableau des événements avec colonnes :
  - Date, Nom, Saison, Nombre d'inscrits, Statut quota (pastille), Actions
- [ ] Écrire les tests pour le formulaire de création
- [ ] Créer le formulaire de création d'événement
- [ ] Écrire les tests pour le formulaire d'édition
- [ ] Créer le formulaire d'édition
- [ ] Écrire les tests pour la suppression
- [ ] Implémenter la confirmation de suppression
- [ ] Écrire les tests pour les filtres/recherche
- [ ] Ajouter filtres Saison + Année + recherche par nom
- [ ] Écrire les tests pour la gestion manuelle des inscriptions
- [ ] Permettre aux admins d'inscrire un bénévole manuellement (dropdown de sélection)
- [ ] Permettre aux admins de désinscrire un bénévole (avec confirmation)
- [ ] Écrire les tests pour l'export CSV par événement
- [ ] Implémenter export CSV de la liste des inscrits d'un événement spécifique
- [ ] Écrire les tests pour les statistiques
- [ ] Afficher statistiques globales :
  - Taux de remplissage moyen
  - Bénévoles les plus actifs (nombre d'inscriptions)
  - Événements avec le plus d'inscrits

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Tableau complet avec nombre d'inscrits et statut visible
- ✅ CRUD complet fonctionnel
- ✅ Admins peuvent inscrire/désinscrire manuellement
- ✅ Export CSV par événement disponible
- ✅ Statistiques calculées et affichées
- ✅ Interface responsive et intuitive
- ✅ Confirmations pour actions destructives
- ✅ Filtres Saison + Année opérationnels

---

### Issue #15: Interface admin - Import CSV (TDD)
**Labels:** `frontend`, `admin`, `csv`, `ui`, `tdd`, `priority:high`

**Description:**
Créer l'interface d'import CSV avec drag & drop et prévisualisation.

**Tasks:**
- [ ] Écrire les tests pour l'upload de fichier
- [ ] Créer la zone de drag & drop pour CSV
- [ ] Écrire les tests pour la prévisualisation
- [ ] Afficher une prévisualisation des données
- [ ] Écrire les tests pour la validation
- [ ] Afficher les erreurs de validation
- [ ] Écrire les tests pour la confirmation d'import
- [ ] Implémenter l'import final
- [ ] Tester la responsivité mobile

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Drag & drop fonctionnel
- ✅ Prévisualisation claire des données
- ✅ Gestion des erreurs détaillée
- ✅ UX fluide et intuitive
- ✅ Responsive sur mobile

---

### Issue #16: Interface bénévole - Vue chronologique des événements (TDD)
**Labels:** `frontend`, `volunteers`, `events-list`, `ui`, `tdd`, `priority:high`

**Description:**
Créer la vue principale en grille 3 colonnes avec événements affichés de manière compacte, bénévoles en mode hashtag, et filtres essentiels. C'EST LA VUE LA PLUS IMPORTANTE (affichée en premier).

**Tasks:**
- [ ] Écrire les tests pour l'affichage de la grille 3 colonnes
- [ ] Créer la grille responsive :
  - Desktop : 3 colonnes
  - Tablet : 2 colonnes
  - Mobile : 1 colonne
- [ ] Créer les cartes d'événements compactes avec :
  - Titre de l'événement
  - Date (format "JJ mois YYYY")
  - **Horaires** : "HHhMM → HHhMM" (arrivée → départ)
  - Liste bénévoles en mode **hashtag** : #Prénom #Prénom (chips/badges compacts)
  - Pastille de couleur discrète (coin supérieur droit)
    - 🟢 Vert (quota OK) / 🟠 Orange (quota +1-2) / 🔴 Rouge (quota +3+)
    - 16px desktop, 12px mobile
  - Bouton [S'inscrire] directement sur la carte
  - Bouton [Détails →] pour accéder au détail
  - **PAS de compteurs visibles** (ex: pas de "5/5")
- [ ] Écrire les tests pour les filtres
- [ ] Implémenter filtre par **Saison** (septembre à juin)
- [ ] Implémenter filtre par **Année** (janvier à décembre)
- [ ] Permettre la combinaison des deux filtres
- [ ] Écrire les tests pour la page détail événement
- [ ] Créer la page détail avec liste des bénévoles inscrits
  - Nom complet + heure d'inscription ("Inscrit le JJ/MM à HHhMM")
  - Pas d'avatar, pas de photo, pas de rôles
  - Ordre chronologique (premier inscrit en haut)
- [ ] Écrire les tests pour l'inscription/désinscription
- [ ] Implémenter boutons d'action [S'inscrire] / [Se désinscrire]
- [ ] Tester la responsivité (mobile, tablet, desktop)
  - Desktop : 2-3 colonnes de cartes
  - Tablet : 2 colonnes
  - Mobile : 1 colonne (empilé)

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Vue chronologique claire et épurée
- ✅ Pastilles de couleur discrètes (pas de compteurs)
- ✅ Filtres Saison + Année fonctionnels
- ✅ Page détail avec liste simple des inscrits
- ✅ Inscription/désinscription intuitive
- ✅ Responsive sur tous les écrans
- ✅ Conforme aux specs UX (voir UX-SPECIFICATIONS.md)

---

### Issue #17: Interface bénévole - Dashboard personnel (TDD)
**Labels:** `frontend`, `volunteers`, `dashboard`, `ui`, `tdd`, `priority:medium`

**Description:**
Créer le tableau de bord personnel du bénévole avec ses inscriptions et statistiques.

**Tasks:**
- [ ] Écrire les tests pour l'affichage des inscriptions
- [ ] Afficher les événements à venir
- [ ] Écrire les tests pour l'historique
- [ ] Afficher l'historique des participations
- [ ] Écrire les tests pour les statistiques
- [ ] Afficher statistiques (heures, nombre d'événements)
- [ ] Écrire les tests pour la gestion du profil
- [ ] Intégrer l'édition du profil
- [ ] Tester la responsivité

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Dashboard clair et informatif
- ✅ Statistiques visuelles (graphiques)
- ✅ Responsive sur tous les écrans
- ✅ Navigation intuitive

---

## 🔔 Notifications

### Issue #18: Système de notifications email (TDD)
**Labels:** `feature`, `notifications`, `email`, `tdd`, `priority:medium`

**Description:**
Implémenter un système de notifications par email pour les rappels d'événements.

**Tasks:**
- [ ] Écrire les tests pour l'envoi d'email
- [ ] Configurer Nodemailer ou service email (SendGrid, Mailgun)
- [ ] Écrire les tests pour les templates d'email
- [ ] Créer les templates d'email (inscription, rappel, annulation)
- [ ] Écrire les tests pour les rappels automatiques
- [ ] Implémenter rappels 24h avant événement
- [ ] Écrire les tests pour la file d'attente
- [ ] Utiliser une queue (Bull/Redis) pour les emails

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Emails envoyés correctement
- ✅ Templates professionnels et clairs
- ✅ Rappels automatiques fonctionnels
- ✅ Gestion des erreurs d'envoi

---

## 📊 Exports & Rapports

### Issue #19: Export CSV des événements avec bénévoles (TDD)
**Labels:** `feature`, `export`, `tdd`, `priority:high`

**Description:**
Permettre l'export CSV des événements avec la liste complète des bénévoles inscrits pour statistiques et archivage.

**Tasks:**
- [ ] Écrire les tests pour l'export CSV avec bénévoles
- [ ] Implémenter GET /api/events/export/csv avec filtres
  - Filtre par saison (septembre à juin)
  - Filtre par année (janvier à décembre)
  - Combinaison des deux filtres possible
- [ ] Colonnes du CSV :
  - date, nom, saison, nombre_spectateurs_attendus
  - nombre_benevoles_requis, nombre_inscrits, statut_quota
  - benevoles_inscrits (liste noms séparés par ";")
  - commentaires
- [ ] Écrire les tests pour le calcul du statut quota (vert/orange/rouge)
- [ ] Tester l'export avec différents filtres
- [ ] Export PDF (optionnel, priorité basse)
- [ ] Export iCal (optionnel, priorité basse)

**Critères d'acceptation:**
- ✅ Tous les tests passent
- ✅ Export CSV fonctionnel avec filtres saison + année
- ✅ Colonnes complètes avec liste des bénévoles inscrits
- ✅ Statut quota calculé correctement (vert/orange/rouge)
- ✅ Utilisable pour statistiques et bilans association
- ✅ Encodage UTF-8 pour accents français

---

## 🧪 Tests & Qualité

### Issue #20: Configuration de la couverture de code (>80%)
**Labels:** `testing`, `quality`, `priority:high`

**Description:**
Configurer Jest pour mesurer et maintenir une couverture de code élevée.

**Tasks:**
- [ ] Configurer Jest coverage
- [ ] Définir seuils minimaux (80% statements, branches, functions, lines)
- [ ] Ajouter script npm run test:coverage
- [ ] Intégrer dans CI/CD
- [ ] Exclure les fichiers de configuration du coverage

**Critères d'acceptation:**
- ✅ Coverage configuré et fonctionnel
- ✅ Seuils minimaux définis
- ✅ Rapport généré automatiquement
- ✅ CI/CD vérifie la couverture

---

### Issue #21: Tests end-to-end (E2E) avec Playwright ou Cypress
**Labels:** `testing`, `e2e`, `priority:medium`

**Description:**
Ajouter des tests E2E pour les parcours utilisateurs critiques.

**Tasks:**
- [ ] Choisir et installer l'outil E2E (Playwright ou Cypress)
- [ ] Configurer les tests E2E
- [ ] Écrire tests E2E pour le parcours d'inscription
- [ ] Écrire tests E2E pour l'authentification
- [ ] Écrire tests E2E pour la création d'événement (admin)
- [ ] Écrire tests E2E pour l'inscription à un événement
- [ ] Intégrer dans CI/CD

**Critères d'acceptation:**
- ✅ Tests E2E configurés et fonctionnels
- ✅ Parcours critiques couverts
- ✅ Tests passent en local et en CI
- ✅ Screenshots/vidéos des échecs disponibles

---

## 📱 Progressive Web App (PWA)

### Issue #22: Transformer en PWA (TDD)
**Labels:** `feature`, `pwa`, `tdd`, `priority:low`

**Description:**
Rendre l'application installable comme PWA pour une meilleure expérience mobile.

**Tasks:**
- [ ] Créer le manifest.json
- [ ] Configurer le service worker
- [ ] Écrire les tests pour le mode offline
- [ ] Implémenter cache basique pour mode offline
- [ ] Ajouter les icônes d'application
- [ ] Tester l'installation sur mobile

**Critères d'acceptation:**
- ✅ Application installable sur mobile
- ✅ Mode offline basique fonctionnel
- ✅ Icônes et splash screen configurés
- ✅ Tests passent

---

## 📚 Documentation

### Issue #23: Documentation API complète
**Labels:** `documentation`, `priority:medium`

**Description:**
Créer une documentation API complète avec Swagger/OpenAPI.

**Tasks:**
- [ ] Installer Swagger/OpenAPI
- [ ] Documenter tous les endpoints
- [ ] Ajouter exemples de requêtes/réponses
- [ ] Générer documentation interactive
- [ ] Ajouter lien dans README

**Critères d'acceptation:**
- ✅ Documentation Swagger accessible
- ✅ Tous les endpoints documentés
- ✅ Exemples clairs et complets
- ✅ Schémas de données définis

---

### Issue #24: Guide de contribution
**Labels:** `documentation`, `priority:low`

**Description:**
Créer un CONTRIBUTING.md pour guider les nouveaux contributeurs.

**Tasks:**
- [ ] Créer CONTRIBUTING.md
- [ ] Expliquer le workflow TDD
- [ ] Documenter les conventions de code
- [ ] Expliquer le processus de PR
- [ ] Ajouter exemples de tests

**Critères d'acceptation:**
- ✅ CONTRIBUTING.md complet
- ✅ Guidelines claires
- ✅ Exemples concrets
- ✅ Process documenté

---

## 🚀 Déploiement

### Issue #25: Configuration du déploiement
**Labels:** `deployment`, `priority:low`

**Description:**
Préparer le déploiement en production.

**Tasks:**
- [ ] Choisir plateforme (Heroku, Vercel, Railway, etc.)
- [ ] Configurer les variables d'environnement
- [ ] Configurer la base de données en production
- [ ] Créer script de déploiement
- [ ] Documenter le processus de déploiement

**Critères d'acceptation:**
- ✅ Application déployable facilement
- ✅ Variables d'environnement configurées
- ✅ Base de données production prête
- ✅ Documentation de déploiement

---

