# Configuration des Issues GitHub

Ce document explique comment créer les 25 issues détaillées pour jalonner le projet.

## Option 1 : Script automatique avec l'API GitHub (Recommandé)

### Prérequis

1. Générer un token GitHub personnel :
   - Aller sur https://github.com/settings/tokens
   - Cliquer sur "Generate new token" > "Generate new token (classic)"
   - Donner un nom au token (ex: "baienevole-issues")
   - Cocher la scope **`repo`** (Full control of private repositories)
   - Cliquer sur "Generate token"
   - **Copier le token immédiatement** (vous ne pourrez plus le voir après)

### Utilisation

```bash
# Exporter le token GitHub
export GITHUB_TOKEN=your_github_token_here

# Exécuter le script
node create-issues.js
```

Le script créera automatiquement les 25 issues sur le repository GitHub.

## Option 2 : Création manuelle

Si le script ne fonctionne pas, vous pouvez créer les issues manuellement :

1. Ouvrir le fichier `ISSUES.md`
2. Copier le contenu de chaque issue
3. Aller sur https://github.com/sebdam1010-del/baienevole/issues/new
4. Coller le titre et le corps de l'issue
5. Ajouter les labels correspondants
6. Répéter pour les 25 issues

## Liste des Labels à créer

Avant de créer les issues, assurez-vous que les labels suivants existent sur votre repository :

### Par priorité
- `priority:high` (rouge) - Priorité haute
- `priority:medium` (jaune) - Priorité moyenne
- `priority:low` (vert) - Priorité basse

### Par catégorie
- `setup` (gris) - Configuration et infrastructure
- `tdd` (bleu) - Test-Driven Development
- `feature` (vert clair) - Nouvelle fonctionnalité
- `frontend` (violet) - Interface utilisateur
- `backend` (orange) - Backend/API
- `testing` (bleu foncé) - Tests
- `documentation` (gris clair) - Documentation
- `database` (marron) - Base de données
- `ci-cd` (bleu marine) - CI/CD
- `authentication` (rouge foncé) - Authentification
- `authorization` (rouge) - Autorisation
- `events` (vert) - Gestion des événements
- `volunteers` (jaune) - Gestion des bénévoles
- `csv` (violet clair) - Import/Export CSV
- `notifications` (orange clair) - Notifications
- `email` (orange) - Emails
- `export` (vert foncé) - Exports
- `quality` (bleu clair) - Qualité du code
- `e2e` (bleu) - Tests end-to-end
- `pwa` (violet) - Progressive Web App
- `deployment` (gris foncé) - Déploiement
- `ui` (rose) - Interface utilisateur
- `design` (rose clair) - Design
- `calendar` (jaune clair) - Calendrier
- `dashboard` (cyan) - Tableau de bord
- `admin` (rouge) - Administration
- `registration` (vert clair) - Inscriptions

## Ordre de priorité des issues

### Phase 1 : Setup (Issues #1-3)
1. Setup du projet Node.js avec structure TDD
2. Configuration de la base de données
3. Configuration CI/CD avec GitHub Actions

### Phase 2 : Backend Core (Issues #4-8)
4. Système d'authentification (TDD)
5. Gestion des rôles (TDD)
6. Modèle et CRUD Événements (TDD)
7. Import CSV d'événements (TDD)
8. Système d'inscription aux événements (TDD)

### Phase 3 : Backend Extended (Issues #9-10)
9. Profil bénévole (TDD)
10. Tableau de bord bénévole (TDD)

### Phase 4 : Frontend (Issues #11-17)
11. Setup Frontend avec framework moderne
12. Design System et composants de base (TDD)
13. Page d'authentification responsive (TDD)
14. Interface admin - Gestion des événements (TDD)
15. Interface admin - Import CSV (TDD)
16. Interface bénévole - Calendrier (TDD)
17. Interface bénévole - Dashboard personnel (TDD)

### Phase 5 : Features avancées (Issues #18-22)
18. Système de notifications email (TDD)
19. Export des plannings (TDD)
20. Configuration couverture de code
21. Tests E2E
22. Transformer en PWA

### Phase 6 : Documentation & Déploiement (Issues #23-25)
23. Documentation API complète
24. Guide de contribution
25. Configuration du déploiement

## Notes importantes

- **TDD obligatoire** : Toutes les issues marquées (TDD) doivent être développées en Test-Driven Development
- **Pas de commit sans tests** : Aucun code ne doit être committé si les tests ne passent pas
- **Responsive first** : Toutes les interfaces doivent être responsive (mobile, tablet, desktop)
- **Couverture de code** : Objectif minimum de 80% de couverture
- **CI/CD** : Les tests doivent passer automatiquement sur chaque PR

## Ressources

- Repository : https://github.com/sebdam1010-del/baienevole
- Issues : https://github.com/sebdam1010-del/baienevole/issues
- Documentation GitHub API : https://docs.github.com/en/rest/issues
