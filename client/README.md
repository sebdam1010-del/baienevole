# Baie des Singes - Frontend

Frontend React pour la plateforme de gestion des bénévoles de la Baie des Singes.

## Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS v4** - Framework CSS
- **React Router v6** - Navigation
- **Axios** - HTTP client

## Design System

L'application utilise la charte graphique officielle de La Baie des Singes :

### Couleurs
- Navy : `#131226` (var(--color-baie-navy))
- Rouge : `#DD2D4A` (var(--color-baie-red))
- Beige : `#DFB999` (var(--color-baie-beige))
- Orange : `#EF7856` (var(--color-baie-orange))
- Jaune : `#F5AC44` (var(--color-baie-yellow))
- Vert : `#ABD4A9` (var(--color-baie-green))

### Typographie
- **Protest Riot** - Titres (h1-h6)
- **League Spartan** - Corps de texte

## Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## Configuration

Créer un fichier `.env` à partir de `.env.example` :

```env
VITE_API_URL=http://localhost:3000/api
```

## Structure

```
client/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── services/       # Services (API calls)
│   ├── context/        # React Context (Auth, etc.)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilitaires
│   ├── App.jsx         # Composant racine
│   └── main.jsx        # Point d'entrée
├── public/             # Fichiers statiques
└── dist/               # Build de production
```

## Pages

- `/login` - Connexion
- `/register` - Inscription
- `/` - Liste des événements
- `/dashboard` - Tableau de bord bénévole
- `/profile` - Profil utilisateur
- `/admin/events` - Administration des événements (admin uniquement)

## Développement

Le serveur de développement tourne sur `http://localhost:5173` par défaut.
Le backend doit être lancé sur `http://localhost:3000`.

## Build

La commande `npm run build` génère les fichiers optimisés dans le dossier `dist/`.
