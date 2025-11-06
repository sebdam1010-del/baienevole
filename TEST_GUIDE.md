# Guide de tests avant déploiement

Ce guide vous aide à tester complètement la plateforme BaieNévole avant le déploiement en production.

## 1. Prérequis

```bash
# Assurez-vous que le backend et frontend sont lancés
npm run dev          # Terminal 1 (backend)
cd client && npm run dev  # Terminal 2 (frontend)
```

## 2. Tests automatisés

### Tests unitaires et d'intégration

```bash
# Tests backend
npm test

# Tests avec couverture
npm run test:coverage

# Tests frontend
cd client
npm test
```

## 3. Tests manuels - API (avec Postman ou curl)

### 3.1. Santé de l'API

```bash
curl http://localhost:3000/api/health
# Résultat attendu: {"status":"ok","timestamp":"..."}
```

### 3.2. Tests d'authentification

#### Inscription

Créez un fichier `test-register.json`:
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123",
  "nom": "Test",
  "prenom": "User"
}
```

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d @test-register.json
```

#### Connexion

Créez un fichier `test-login.json`:
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```

```bash
# Connexion et sauvegarde du token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test-login.json > login-response.json

# Extraire le token
TOKEN=$(cat login-response.json | jq -r '.token')
echo "Token: $TOKEN"
```

### 3.3. Tests des événements

```bash
# Liste des événements
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events | jq .

# Détails d'un événement (remplacer EVENT_ID)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/EVENT_ID | jq .

# S'inscrire à un événement
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"poste": "accueil"}' \
  http://localhost:3000/api/events/EVENT_ID/register | jq .
```

### 3.4. Tests du profil bénévole

```bash
# Récupérer son profil
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/benevoles/me | jq .

# Dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/benevoles/dashboard | jq .

# Ses inscriptions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/benevoles/me/registrations | jq .
```

### 3.5. Tests Admin

Créez un admin dans la base de données:

```bash
npx prisma studio
# Ouvrir table Benevole
# Trouver votre utilisateur
# Changer role: "benevole" en "admin"
```

```bash
# Dashboard admin
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/dashboard | jq .

# Tous les bénévoles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/benevoles | jq .

# Toutes les inscriptions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/registrations | jq .

# Créer un événement
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Event",
    "date": "2025-12-25T19:00:00Z",
    "description": "Test description",
    "horaireArrivee": "19:00",
    "horaireDepart": "23:00",
    "nombreBenevolesRequis": 5,
    "saison": 30
  }' \
  http://localhost:3000/api/admin/events | jq .

# Lancer le scraping
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/scrape/events | jq .
```

## 4. Tests manuels - Frontend

Ouvrez http://localhost:5173

### 4.1. Parcours visiteur non connecté

- [ ] La page d'accueil s'affiche correctement
- [ ] La liste des événements est visible
- [ ] Cliquer sur un événement affiche ses détails
- [ ] Le bouton "S'inscrire" redirige vers la page de connexion
- [ ] Les liens "Connexion" et "Inscription" sont accessibles

### 4.2. Parcours d'inscription

- [ ] Cliquer sur "Inscription"
- [ ] Remplir le formulaire (email, password, nom, prénom)
- [ ] Validation des champs (email valide, password fort)
- [ ] Soumettre le formulaire
- [ ] Redirection automatique après inscription
- [ ] Message de succès affiché

### 4.3. Parcours de connexion

- [ ] Cliquer sur "Connexion"
- [ ] Entrer email et password
- [ ] Soumettre
- [ ] Redirection vers le dashboard bénévole
- [ ] Le nom de l'utilisateur apparaît dans le header

### 4.4. Parcours bénévole

**Dashboard:**
- [ ] Voir les statistiques personnelles
- [ ] Voir la liste de ses inscriptions
- [ ] Voir les événements à venir

**Liste des événements:**
- [ ] Parcourir la liste des événements
- [ ] Filtrer par date/nom
- [ ] Cliquer sur "S'inscrire" sur un événement
- [ ] Choisir un poste (accueil, bar, etc.)
- [ ] Confirmer l'inscription
- [ ] Message de succès
- [ ] L'événement apparaît dans "Mes inscriptions"

**Profil:**
- [ ] Accéder à son profil
- [ ] Voir ses informations (nom, prénom, email)
- [ ] Voir ses inscriptions
- [ ] Voir les événements passés
- [ ] Se désinscrire d'un événement futur
- [ ] Modifier son profil (nom, prénom)

**Déconnexion:**
- [ ] Cliquer sur "Déconnexion"
- [ ] Redirection vers la page d'accueil
- [ ] Plus d'accès aux pages protégées

### 4.5. Parcours administrateur

**Dashboard Admin:**
- [ ] Accéder au dashboard admin (menu ou route /admin)
- [ ] Voir les statistiques globales
  - Nombre total de bénévoles
  - Nombre total d'événements
  - Nombre total d'inscriptions
  - Événements avec places disponibles

**Gestion des événements:**
- [ ] Liste de tous les événements
- [ ] Créer un nouvel événement manuellement
- [ ] Modifier un événement existant
- [ ] Supprimer un événement
- [ ] Voir les inscriptions par événement

**Import CSV:**
- [ ] Accéder à la page d'import
- [ ] Télécharger le fichier exemple
- [ ] Uploader un CSV valide
- [ ] Voir le résumé de l'import (créés, ignorés, erreurs)
- [ ] Vérifier que les événements sont créés

**Scraping:**
- [ ] Accéder à la page de scraping
- [ ] Voir le statut actuel (dernière exécution, nombre d'événements)
- [ ] Cliquer sur "Lancer le scraping"
- [ ] Voir les logs en temps réel (ou message de progression)
- [ ] Vérifier le résumé final
- [ ] Vérifier que les nouveaux événements apparaissent

**Gestion des bénévoles:**
- [ ] Liste de tous les bénévoles
- [ ] Rechercher un bénévole
- [ ] Voir le détail d'un bénévole (ses inscriptions)
- [ ] Modifier le rôle d'un bénévole (admin/benevole)

## 5. Tests de sécurité

### 5.1. Protection des routes

```bash
# Accès sans authentification (doit retourner 401)
curl -i http://localhost:3000/api/benevoles/me
curl -i http://localhost:3000/api/admin/dashboard

# Token invalide (doit retourner 401)
curl -i -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/benevoles/me

# Accès admin sans être admin (doit retourner 403)
# Utilisez un token de bénévole non-admin
curl -i -H "Authorization: Bearer $BENEVOLE_TOKEN" \
  http://localhost:3000/api/admin/dashboard
```

### 5.2. Validation des entrées

```bash
# Email invalide
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "Test123", "nom": "Test", "prenom": "User"}'
# Doit retourner une erreur 400

# Password trop court
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "123", "nom": "Test", "prenom": "User"}'
# Doit retourner une erreur 400
```

## 6. Tests de performance

### 6.1. Temps de réponse

```bash
# Mesurer le temps de réponse des endpoints principaux
time curl -s http://localhost:3000/api/events > /dev/null
time curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/benevoles/dashboard > /dev/null
```

### 6.2. Test de charge (optionnel)

Si vous avez `ab` (Apache Bench) installé:

```bash
# 100 requêtes, 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/health

# Avec authentification
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events
```

## 7. Tests de la base de données

```bash
# Ouvrir Prisma Studio pour inspecter les données
npx prisma studio

# Vérifier:
# - Les bénévoles sont créés correctement
# - Les événements ont toutes les informations
# - Les inscriptions sont liées correctement
# - Les images des événements sont présentes
# - Pas de doublons d'événements (même urlSite)
```

## 8. Checklist finale avant déploiement

### Backend

- [ ] Tous les tests unitaires passent (`npm test`)
- [ ] Les routes API répondent correctement
- [ ] L'authentification fonctionne (JWT)
- [ ] Les validations empêchent les données invalides
- [ ] Les routes admin sont protégées
- [ ] Le scraping fonctionne et ne crée pas de doublons
- [ ] L'import CSV fonctionne
- [ ] Les images sont téléchargées et servies

### Frontend

- [ ] Tous les composants s'affichent correctement
- [ ] Les formulaires sont validés
- [ ] Les redirections fonctionnent
- [ ] Le routing fonctionne (pas d'erreurs 404)
- [ ] Les messages d'erreur sont clairs
- [ ] L'UI est responsive (mobile, tablette, desktop)
- [ ] Les états de chargement sont affichés
- [ ] La déconnexion fonctionne

### Base de données

- [ ] Les migrations sont à jour
- [ ] Les relations entre tables sont correctes
- [ ] Les indexes sont en place
- [ ] Pas de données de test sensibles

### Configuration

- [ ] Variables d'environnement définies (.env)
- [ ] JWT_SECRET est sécurisé
- [ ] DATABASE_URL est correcte
- [ ] PORT est défini

### Documentation

- [ ] README.md est à jour
- [ ] API documentée (Swagger ou README)
- [ ] Guide de déploiement existe
- [ ] Variables d'environnement documentées

## 9. Logs et monitoring

```bash
# Vérifier les logs backend
tail -f logs/app.log  # Si configuré

# Vérifier les erreurs dans la console du serveur
# Pas d'erreurs non gérées
# Pas de warnings critiques
```

## 10. Nettoyage avant déploiement

```bash
# Supprimer les données de test
npx prisma studio
# Supprimer les utilisateurs de test

# Supprimer les fichiers de test créés
rm -f test-*.json login-response.json

# Vérifier qu'il n'y a pas de secrets dans le code
git grep -i "password\|secret\|api_key" | grep -v "PASSWORD"
```

---

## Commandes rapides de test

```bash
# Test complet rapide (dans l'ordre)
# 1. Santé API
curl http://localhost:3000/api/health

# 2. Créer fichiers de test
cat > test-register.json <<EOF
{
  "email": "rapid@test.com",
  "password": "RapidTest123",
  "nom": "Rapid",
  "prenom": "Test"
}
EOF

cat > test-login.json <<EOF
{
  "email": "rapid@test.com",
  "password": "RapidTest123"
}
EOF

# 3. Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d @test-register.json

# 4. Connexion et extraction token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test-login.json | jq -r '.token')

# 5. Test routes protégées
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events | jq '.[] | {id, nom, date}'

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/benevoles/me | jq '{nom, prenom, email}'

echo "✓ Tests rapides terminés avec succès!"
```

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs du serveur
2. Vérifiez la base de données avec `npx prisma studio`
3. Vérifiez les variables d'environnement (.env)
4. Relancez les migrations: `npx prisma migrate dev`
