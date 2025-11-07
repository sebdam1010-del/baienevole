# Guide Rapide - Tester la Plateforme en 10 Minutes

## 1. Prérequis

Vérifiez que les serveurs tournent :
```bash
# Backend sur http://localhost:3000
# Frontend sur http://localhost:5173

# Si besoin de redémarrer :
npm run dev                    # Backend (depuis la racine)
cd client && npm run dev      # Frontend
```

## 2. Créer des événements de test futurs

```bash
npm run test:data
```

Cela va créer 5 événements :
- ✅ 4 événements futurs disponibles pour inscription
- ⏰ 1 événement dans moins de 24h (pour tester la restriction)

## 3. Comptes de test disponibles

### Bénévole
- Email: `benevole1@example.com`
- Mot de passe: `volunteer123`

### Admin
- Email: `admin@baiedessinges.com`
- Mot de passe: `admin123`

## 4. Test rapide (10 minutes)

### A. Connexion et navigation (2 min)
1. Ouvrir http://localhost:5173/login
2. Se connecter avec le compte bénévole
3. Explorer les pages : Dashboard, Événements, Profil

### B. Inscription à un événement (3 min)
1. Aller sur /events
2. Vérifier que les événements passés affichent "Événement terminé"
3. Cliquer sur un événement futur
4. S'inscrire à l'événement
5. Vérifier le message de succès
6. Vérifier l'apparition dans "Bénévoles inscrits"

### C. Test de désinscription (2 min)
1. Cliquer sur "Se désinscrire"
2. Vérifier le message de succès
3. Vérifier la disparition de la liste

### D. Test événement imminent (2 min)
1. Aller sur l'événement "Événement imminent - Test 24h"
2. Essayer de s'inscrire
3. Vérifier le message d'erreur clair

### E. Dashboard et profil (1 min)
1. Aller sur /dashboard
2. Vérifier les statistiques
3. Aller sur /profile
4. Modifier une information
5. Sauvegarder et vérifier

## 5. Test responsive (5 minutes optionnel)

1. Ouvrir DevTools (F12)
2. Cliquer sur l'icône mobile/responsive
3. Tester sur iPhone SE (375px)
4. Tester sur iPad (768px)
5. Vérifier que tout s'affiche correctement

## 6. Problèmes courants

### Les images ne s'affichent pas
- Vérifier que le backend tourne bien sur port 3000
- Vérifier le proxy dans client/vite.config.js

### Erreur 401 lors de l'inscription
- Se déconnecter et se reconnecter
- Vérifier que le token est bien dans localStorage (F12 > Application > Local Storage)

### "Événement introuvable"
- Lancer `npm run test:data` pour créer les événements de test

### Pas d'événements futurs visibles
- Tous les événements scrapés sont historiques
- Utiliser `npm run test:data` pour créer des événements futurs

## 7. Pour aller plus loin

Consulter le guide complet : **TESTING_GUIDE.md**

Il contient :
- ✅ Checklist complète de 80+ tests
- 🔐 Tests de sécurité
- 📧 Tests des emails
- 🎨 Tests responsive détaillés
- 📋 Checklist avant déploiement

## 8. Nettoyage après tests

Pour supprimer les événements de test :

```sql
sqlite3 prisma/dev.db "DELETE FROM Event WHERE commentaires = 'Événement de test' OR commentaires = 'Pour tester la restriction des 24h';"
```

Ou via Prisma Studio :
```bash
npm run db:studio
```

---

## Résumé des commandes utiles

```bash
# Créer les données de test
npm run test:data

# Voir les utilisateurs
sqlite3 prisma/dev.db "SELECT email, role FROM User;"

# Voir les événements
sqlite3 prisma/dev.db "SELECT nom, date FROM Event ORDER BY date DESC LIMIT 10;"

# Prisma Studio (interface graphique)
npm run db:studio

# Tester une API
curl http://localhost:3000/api/events
```

---

**Note importante** : Les événements créés par le scraping sont tous historiques (2012-2020). Pour tester les inscriptions, utilisez obligatoirement `npm run test:data` pour créer des événements futurs.
