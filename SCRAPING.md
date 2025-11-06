# Scraping du site Baie des Singes

Ce document explique comment utiliser le système de scraping pour importer automatiquement les événements depuis le site officiel https://www.baiedessinges.com/programme/liste/

## 🎯 Fonctionnalités

Le script de scraping récupère automatiquement :
- ✅ **Nom de l'événement**
- ✅ **Date de l'événement**
- ✅ **Description**
- ✅ **Image** (téléchargée et stockée localement)
- ✅ **Tarif**
- ✅ **URL de la page** sur le site officiel

## 📋 Nouveaux champs ajoutés

Le modèle `Event` a été enrichi avec :

```prisma
model Event {
  // ... champs existants
  imageUrl   String?  // URL locale de l'image (/images/events/...)
  tarif      String?  // Tarif de l'événement
  urlSite    String?  // URL de la page sur le site officiel
}
```

## 🚀 Utilisation

### 1. Via la ligne de commande

```bash
# Lancer le scraping manuellement
npm run scrape:events
```

Le script va :
1. Se connecter au site officiel
2. Extraire tous les événements de la page
3. Télécharger les images dans `public/images/events/`
4. Créer ou mettre à jour les événements dans la base de données
5. Afficher un résumé avec les statistiques

**Sortie exemple :**
```
╔════════════════════════════════════════════╗
║  Scraping Baie des Singes - Événements    ║
╚════════════════════════════════════════════╝

ℹ Démarrage du scraping...
✓ Dossier images créé: /var/www/baienevole/public/images/events
ℹ Navigation vers https://www.baiedessinges.com/programme/liste/...
ℹ Extraction des événements...
✓ 15 événement(s) trouvé(s)
ℹ Sauvegarde dans la base de données...
ℹ Téléchargement image: Concert acoustique
✓ Créé: Concert acoustique
ℹ Téléchargement image: Spectacle de marionnettes
✓ Créé: Spectacle de marionnettes

╔════════════════════════════════════════════╗
║              Résumé                        ║
╚════════════════════════════════════════════╝

✓ Événements créés: 12
ℹ Événements mis à jour: 3
```

### 2. Via l'API (interface admin)

Les administrateurs peuvent déclencher le scraping depuis l'interface :

**POST** `/api/admin/scrape/events`
```bash
curl -X POST http://localhost:3000/api/admin/scrape/events \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Réponse :**
```json
{
  "success": true,
  "message": "Scraping terminé avec succès",
  "stats": {
    "found": 15,
    "created": 12,
    "updated": 3,
    "errors": 0
  }
}
```

**GET** `/api/admin/scrape/status`

Obtenir le statut du dernier scraping :

```bash
curl http://localhost:3000/api/admin/scrape/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Réponse :**
```json
{
  "success": true,
  "stats": {
    "totalImported": 15,
    "lastImported": {
      "name": "Concert acoustique",
      "date": "2025-01-06T14:25:30.000Z"
    }
  }
}
```

## 🔧 Configuration

### Adapter les sélecteurs CSS

Le site peut évoluer et les sélecteurs CSS peuvent changer. Pour adapter le script :

1. Ouvrir `scripts/scrapeEvents.js`
2. Modifier les sélecteurs dans la fonction `scrapeEvents()` :

```javascript
// Ligne ~105
const eventElements = document.querySelectorAll('.event-item, .programme-item');

// Adapter selon la structure HTML actuelle
const titleEl = el.querySelector('h2, h3, .title');
const imageEl = el.querySelector('img');
const linkEl = el.querySelector('a[href*="/spectacle/"]');
```

### Déboguer le HTML

Si aucun événement n'est trouvé, le script sauvegarde automatiquement le HTML dans `debug-scraping.html` :

```bash
# Lancer le scraping
npm run scrape:events

# Si échec, inspecter le HTML
cat debug-scraping.html
```

Vous pouvez ensuite identifier les bons sélecteurs CSS à utiliser.

### Paramètres par défaut

Certains paramètres sont configurables dans le script :

```javascript
// Configuration (ligne ~13)
const SITE_URL = 'https://www.baiedessinges.com/programme/liste/';
const IMAGES_DIR = path.join(__dirname, '../public/images/events');
const CURRENT_SEASON = 30; // Saison 2024-2025

// Valeurs par défaut pour les événements (ligne ~206)
horaireArrivee: '19:00',
horaireDepart: '23:00',
nombreSpectatursAttendus: 100,
nombreBenevolesRequis: 5,
```

## 📁 Structure des fichiers

```
baienevole/
├── scripts/
│   └── scrapeEvents.js         # Script principal de scraping
├── src/
│   ├── controllers/
│   │   └── scrapeController.js # API endpoints pour le scraping
│   └── routes/
│       └── adminRoutes.js      # Routes admin (/api/admin/scrape/*)
├── public/
│   └── images/
│       └── events/             # Images téléchargées
│           ├── concert-acoustique-1704563130456.jpg
│           └── spectacle-marionnettes-1704563145789.jpg
├── prisma/
│   └── schema.prisma           # Modèle Event avec nouveaux champs
└── debug-scraping.html         # HTML de débogage (si échec)
```

## 🔄 Automatisation

### Cron job quotidien

Pour importer automatiquement les nouveaux événements :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter tous les jours à 3h00
0 3 * * * cd /var/www/baienevole && npm run scrape:events >> logs/scraping.log 2>&1
```

### Script de déploiement

Le script de déploiement peut également inclure un scraping initial :

```bash
# Dans scripts/deploy.sh
echo "Import des événements depuis le site..."
npm run scrape:events
```

## 🐛 Dépannage

### Aucun événement trouvé

**Causes possibles :**
- Les sélecteurs CSS ont changé → Adapter les sélecteurs
- Le site utilise du JavaScript pour charger le contenu → Puppeteer peut prendre du temps
- Le site a une protection anti-bot → Vérifier les headers User-Agent

**Solution :**
```bash
# Inspecter le HTML téléchargé
npm run scrape:events
cat debug-scraping.html
```

### Erreur de téléchargement d'image

**Causes :**
- URL d'image invalide
- Timeout réseau
- Image protégée

**Solution :**
Le script continue même si une image échoue. L'événement sera créé sans image.

### Erreur Puppeteer

**Causes :**
- Chrome/Chromium non installé
- Permissions insuffisantes

**Solution (Linux):**
```bash
# Installer les dépendances Chromium
sudo apt-get install -y chromium-browser
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libgtk-3-0 libnss3 libasound2
```

**Solution (Docker):**
```dockerfile
# Dans le Dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxss1 \
    xdg-utils
```

## 📊 Gestion des doublons

Le script vérifie automatiquement les doublons par :
- **Nom de l'événement** (exact)
- **Date** (même jour)

Si un événement existe déjà :
- ✅ Il est **mis à jour** avec les nouvelles informations
- ✅ L'image est re-téléchargée
- ✅ Le tarif et l'URL sont mis à jour

## 🔒 Sécurité

### Permissions

Les routes de scraping sont protégées :
- ✅ Authentification JWT requise
- ✅ Rôle Admin requis
- ✅ Accès refusé pour les bénévoles

### Validation des données

Le script valide :
- ✅ Format des URLs (images et pages)
- ✅ Format des dates
- ✅ Taille des images (timeout 10s)
- ✅ Caractères spéciaux dans les noms de fichiers

### Rate limiting

Pour éviter de surcharger le site :
- Navigation avec `networkidle2` (attend la fin du chargement)
- User-Agent standard
- Pas de parallélisation agressive

## 📚 Documentation API

La documentation complète est disponible sur Swagger UI :

**http://localhost:3000/api-docs**

Sections concernées :
- **Admin** → `POST /api/admin/scrape/events`
- **Admin** → `GET /api/admin/scrape/status`

## 🎨 Affichage des images dans l'interface

Les images sont servies via le serveur Express :

```javascript
// Dans le composant React
<img
  src={`http://localhost:3000${event.imageUrl}`}
  alt={event.nom}
/>

// Exemple: http://localhost:3000/images/events/concert-acoustique-1704563130456.jpg
```

## 🚀 Prochaines étapes

Améliorations possibles :
- [ ] Scraper les horaires précis depuis la page détaillée
- [ ] Récupérer le nombre de spectateurs attendus
- [ ] Scraper d'autres sites d'événements culturels
- [ ] Ajouter un système de notification pour les nouveaux événements
- [ ] Interface admin pour configurer les sélecteurs CSS
- [ ] Historique des scrapings avec logs détaillés

## 💡 Exemples d'utilisation

### Import initial

```bash
# Premier import depuis le site
npm run scrape:events
```

### Mise à jour mensuelle

```bash
# Mettre à jour les événements existants
npm run scrape:events
# Les événements existants seront mis à jour, les nouveaux créés
```

### Test après modification du site

```bash
# 1. Tester le scraping
npm run scrape:events

# 2. Vérifier les événements importés
npx prisma studio
# Ouvrir la table Event et vérifier les champs imageUrl, tarif, urlSite

# 3. Tester l'affichage des images
curl http://localhost:3000/images/events/
```

---

Pour toute question ou problème, consultez le [guide de dépannage](./DEPLOYMENT.md#dépannage) ou ouvrez une issue sur GitHub.
