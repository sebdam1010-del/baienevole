# Guide de Test - Plateforme Baie des Singes

## Préparation

### 1. Créer les données de test
```bash
# Créer des événements futurs pour les tests
node scripts/createTestEvents.js

# Vérifier les utilisateurs de test existants
# Admin: admin@baiedessinges.com / admin123
# Bénévole 1: benevole1@example.com / volunteer123
```

### 2. Vérifier que les serveurs tournent
```bash
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# API Docs: http://localhost:3000/api-docs
```

---

## Tests Fonctionnels

### A. Authentification

#### Test 1.1: Connexion Bénévole
- [ ] Aller sur http://localhost:5173/login
- [ ] Se connecter avec: `benevole1@example.com` / `volunteer123`
- [ ] Vérifier la redirection vers le dashboard
- [ ] Vérifier l'affichage du prénom en haut à droite

#### Test 1.2: Connexion Admin
- [ ] Se déconnecter
- [ ] Se connecter avec: `admin@baiedessinges.com` / `admin123`
- [ ] Vérifier l'accès aux fonctionnalités admin

#### Test 1.3: Déconnexion
- [ ] Cliquer sur "Déconnexion"
- [ ] Vérifier la redirection vers /login
- [ ] Vérifier qu'on ne peut plus accéder aux pages protégées

#### Test 1.4: Mauvais identifiants
- [ ] Essayer de se connecter avec un mauvais mot de passe
- [ ] Vérifier le message d'erreur

---

### B. Gestion des Événements (Vue Bénévole)

#### Test 2.1: Liste des événements
- [ ] Connexion en tant que bénévole
- [ ] Aller sur /events
- [ ] Vérifier l'affichage de tous les événements
- [ ] Vérifier l'affichage des miniatures (portraits à gauche)
- [ ] Vérifier les badges avec les noms des bénévoles inscrits

#### Test 2.2: Filtres
- [ ] Tester le filtre par saison
- [ ] Tester le filtre par année
- [ ] Tester la recherche par titre
- [ ] Vérifier que les filtres se combinent correctement

#### Test 2.3: Événements passés
- [ ] Vérifier que les événements passés affichent "Événement terminé"
- [ ] Vérifier qu'on ne peut pas s'inscrire aux événements passés

#### Test 2.4: Détails d'un événement
- [ ] Cliquer sur "Détails →" d'un événement futur
- [ ] Vérifier l'affichage complet (image, description HTML, commentaires)
- [ ] Vérifier la liste des bénévoles inscrits
- [ ] Vérifier le bouton "← Retour"

---

### C. Inscriptions Bénévoles

#### Test 3.1: Inscription à un événement futur
- [ ] Aller sur un événement futur (dans plus de 24h)
- [ ] Cliquer sur "S'inscrire à cet événement"
- [ ] Vérifier le message de succès
- [ ] Vérifier que le bouton devient "Se désinscrire"
- [ ] Vérifier l'apparition dans la liste des inscrits
- [ ] Vérifier l'ajout du badge avec son prénom dans la liste /events

#### Test 3.2: Désinscription
- [ ] Sur un événement où on est inscrit
- [ ] Cliquer sur "Se désinscrire"
- [ ] Vérifier le message de succès
- [ ] Vérifier que le bouton redevient "S'inscrire"
- [ ] Vérifier la disparition de la liste des inscrits

#### Test 3.3: Événement dans moins de 24h
- [ ] Aller sur l'événement "Événement imminent - Test 24h"
- [ ] Vérifier le message d'erreur lors de la tentative d'inscription
- [ ] Vérifier l'affichage du message explicatif

#### Test 3.4: Double inscription (même événement)
- [ ] S'inscrire à un événement
- [ ] Essayer de s'inscrire à nouveau (via API ou en rechargeant vite)
- [ ] Vérifier le message "Vous êtes déjà inscrit"

#### Test 3.5: Conflits horaires
- [ ] S'inscrire à "Concert de test - Trio Jazz" (19h-23h)
- [ ] Créer manuellement un événement le même jour avec horaires qui se chevauchent
- [ ] Tenter de s'inscrire au second événement
- [ ] Vérifier l'avertissement de conflit (mais inscription autorisée quand même)

---

### D. Dashboard Bénévole

#### Test 4.1: Statistiques personnelles
- [ ] Aller sur /dashboard
- [ ] Vérifier l'affichage du nombre d'événements à venir
- [ ] Vérifier l'affichage du nombre d'événements passés
- [ ] S'inscrire à un nouvel événement
- [ ] Rafraîchir le dashboard
- [ ] Vérifier la mise à jour des statistiques

#### Test 4.2: Événements à venir
- [ ] Vérifier la liste des événements à venir auxquels on est inscrit
- [ ] Vérifier le tri par date
- [ ] Vérifier l'affichage des informations (date, horaires)

#### Test 4.3: Historique
- [ ] Vérifier la liste des événements passés
- [ ] Vérifier le tri par date (plus récents en premier)

---

### E. Profil Bénévole

#### Test 5.1: Affichage du profil
- [ ] Aller sur /profile
- [ ] Vérifier l'affichage de toutes les informations
- [ ] Vérifier la liste des compétences
- [ ] Vérifier les disponibilités

#### Test 5.2: Modification du profil
- [ ] Modifier le téléphone
- [ ] Ajouter/modifier les compétences
- [ ] Modifier les disponibilités
- [ ] Modifier la bio
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier le message de succès
- [ ] Rafraîchir la page
- [ ] Vérifier que les modifications sont sauvegardées

---

### F. Administration (Compte Admin)

#### Test 6.1: Vue admin des événements
- [ ] Se connecter en tant qu'admin
- [ ] Aller sur la page admin des événements
- [ ] Vérifier l'affichage de tous les événements
- [ ] Vérifier les informations détaillées des inscriptions

#### Test 6.2: Création d'événement
- [ ] Créer un nouvel événement via le formulaire admin
- [ ] Vérifier tous les champs obligatoires
- [ ] Vérifier les validations (date, horaires, nombres)
- [ ] Soumettre le formulaire
- [ ] Vérifier l'apparition dans la liste

#### Test 6.3: Modification d'événement
- [ ] Modifier un événement existant
- [ ] Changer plusieurs champs
- [ ] Sauvegarder
- [ ] Vérifier les modifications

#### Test 6.4: Suppression d'événement
- [ ] Supprimer un événement de test
- [ ] Vérifier la confirmation
- [ ] Vérifier la disparition de la liste

#### Test 6.5: Import CSV
- [ ] Préparer un fichier CSV avec des événements
- [ ] Utiliser la fonction d'import
- [ ] Vérifier les événements créés
- [ ] Tester avec un CSV invalide
- [ ] Vérifier les messages d'erreur

#### Test 6.6: Export CSV
- [ ] Exporter la liste des événements
- [ ] Ouvrir le fichier CSV
- [ ] Vérifier les données (dates, inscrits, statuts)
- [ ] Tester l'export avec filtres (saison, année)

#### Test 6.7: Gestion des bénévoles
- [ ] Voir la liste de tous les bénévoles
- [ ] Consulter le profil détaillé d'un bénévole
- [ ] Voir l'historique de ses inscriptions
- [ ] Exporter les données d'un bénévole

---

### G. Responsive Design

#### Test 7.1: Mobile (375px)
- [ ] Ouvrir DevTools
- [ ] Passer en mode mobile (iPhone SE)
- [ ] Tester la navigation
- [ ] Vérifier les images et layouts
- [ ] Tester les formulaires

#### Test 7.2: Tablette (768px)
- [ ] Passer en mode tablette (iPad)
- [ ] Vérifier la grille d'événements
- [ ] Vérifier la navigation
- [ ] Tester les interactions

#### Test 7.3: Desktop (1920px)
- [ ] Passer en grand écran
- [ ] Vérifier que tout s'affiche correctement
- [ ] Vérifier la grille d'événements (3 colonnes)

---

### H. Performance et UX

#### Test 8.1: Temps de chargement
- [ ] Ouvrir Network tab
- [ ] Charger /events
- [ ] Vérifier le temps de chargement des images
- [ ] Vérifier le lazy loading (images chargées au scroll)

#### Test 8.2: Messages de feedback
- [ ] Vérifier les messages de succès (inscription, modification)
- [ ] Vérifier les messages d'erreur
- [ ] Vérifier que les messages disparaissent après 3s

#### Test 8.3: États de chargement
- [ ] Vérifier les spinners/textes pendant les inscriptions
- [ ] Vérifier les boutons désactivés pendant le chargement
- [ ] Vérifier qu'on ne peut pas double-cliquer

---

### I. Sécurité

#### Test 9.1: Accès non authentifié
- [ ] Se déconnecter
- [ ] Essayer d'accéder à /dashboard
- [ ] Vérifier la redirection vers /login
- [ ] Essayer d'accéder à /profile
- [ ] Essayer d'accéder à /admin

#### Test 9.2: Accès bénévole aux pages admin
- [ ] Se connecter en tant que bénévole
- [ ] Essayer d'accéder aux pages admin
- [ ] Vérifier le refus d'accès

#### Test 9.3: Token JWT
- [ ] Ouvrir DevTools > Application > LocalStorage
- [ ] Vérifier la présence du token
- [ ] Supprimer le token manuellement
- [ ] Essayer de naviguer
- [ ] Vérifier la redirection vers /login

---

### J. Emails (Si SMTP configuré)

#### Test 10.1: Confirmation d'inscription
- [ ] S'inscrire à un événement
- [ ] Vérifier la réception de l'email de confirmation
- [ ] Vérifier le contenu de l'email

#### Test 10.2: Alerte de désinscription (Admin)
- [ ] Se désinscrire d'un événement
- [ ] Vérifier que l'admin reçoit une alerte email
- [ ] Vérifier le contenu (nom bénévole, événement, quota restant)

#### Test 10.3: Rappels automatiques
- [ ] Vérifier la configuration du cron pour les rappels
- [ ] Tester manuellement : `node scripts/sendReminders.js`

---

## Tests API (avec curl ou Postman)

### Test API 1: Récupérer tous les événements
```bash
curl http://localhost:3000/api/events
```

### Test API 2: Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"benevole1@example.com","password":"volunteer123"}'
```

### Test API 3: Inscription avec token
```bash
TOKEN="votre_token_ici"
EVENT_ID="id_event_ici"
curl -X POST http://localhost:3000/api/events/$EVENT_ID/register \
  -H "Authorization: Bearer $TOKEN"
```

---

## Checklist avant déploiement

### Configuration
- [ ] Variables d'environnement de production configurées
- [ ] Base de données de production créée
- [ ] SMTP configuré pour les emails
- [ ] JWT_SECRET sécurisé et différent du dev
- [ ] CORS configuré pour le domaine de production

### Code
- [ ] Pas de console.log sensibles
- [ ] Pas de credentials en dur
- [ ] Toutes les dépendances à jour
- [ ] Build production testé : `npm run build`

### Base de données
- [ ] Migrations appliquées : `npm run db:migrate`
- [ ] Utilisateur admin créé
- [ ] Données de test supprimées (ou marquées)

### Performance
- [ ] Images optimisées
- [ ] Bundle size vérifié
- [ ] PWA manifeste configuré
- [ ] Service worker fonctionnel

### Sécurité
- [ ] Headers de sécurité configurés
- [ ] Rate limiting activé
- [ ] Protection CSRF en place
- [ ] Backup de la base de données configuré

### Documentation
- [ ] README à jour
- [ ] API documentée (Swagger accessible)
- [ ] Guide utilisateur créé
- [ ] Procédure de sauvegarde documentée

---

## Bugs connus à vérifier

1. **Événements passés** : Vérifier que tous les événements historiques affichent bien "Événement terminé"
2. **Lazy loading** : Vérifier que les images se chargent bien au scroll sur mobile
3. **Conflits horaires** : Vérifier que l'avertissement s'affiche mais autorise l'inscription
4. **Timezone** : Vérifier la gestion des fuseaux horaires pour les dates

---

## Utilisation de ce guide

1. **Test complet** : Suivre tous les tests dans l'ordre (2-3 heures)
2. **Test rapide** : Tests A, B, C, E uniquement (30 minutes)
3. **Test admin** : Tests F uniquement (30 minutes)
4. **Test avant release** : Checklist de déploiement complète

---

## Rapport de bugs

Pour chaque bug trouvé, noter :
- [ ] Étape exacte du test
- [ ] Comportement attendu
- [ ] Comportement observé
- [ ] Navigateur et version
- [ ] Screenshots si pertinent
- [ ] Message d'erreur console (F12)
