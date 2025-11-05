# Spécifications UX/UI - La Baie des Singes

Ce document définit l'expérience utilisateur et l'interface de la plateforme de gestion des bénévoles.

## 🎯 Principe directeur

**L'interface ne doit JAMAIS freiner les inscriptions.**
Le code couleur est informatif uniquement et ne doit pas décourager les bénévoles de s'inscrire.

---

## 📱 Vue principale : Liste des événements (grille 3 colonnes)

**C'EST LA VUE LA PLUS IMPORTANTE - Affichée en premier**

### Structure de l'interface

```
┌──────────────────────────────────────────────────────────────────┐
│  LA BAIE DES SINGES - Planning Bénévoles              [Admin]    │
│                                                                   │
│  Filtres: [Saison ▼] [Année ▼]                 [Export CSV]     │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🎭 Marionnettes  [🟢]          │  🎵 Concert   [🟠]           │
│  │                                 │                             │
│  │ 📅 15 juin 2024                │ 20 sept 2024                │
│  │ ⏰ 14h00 → 17h30               │ ⏰ 18h30 → 22h00            │
│  │                                 │                             │
│  │ Bénévoles :                    │ Bénévoles :                 │
│  │ #Jean #Marie #Pierre           │ #Sophie #Lucas #Emma        │
│  │ #Sophie #Lucas                 │ #Marc #Julie #Tom           │
│  │                                 │ #Lisa                       │
│  │                                 │                             │
│  │ [S'inscrire] [Détails →]      │ [S'inscrire] [Détails →]   │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🎪 Théâtre      [🔴]           │  ...                        │
│  │ ...                            │                             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Principes de la liste en grille

**Affichage :**
- **Grille 3 colonnes + lignes** (desktop)
- Vue chronologique (ordre de date)
- Cartes d'événements compactes avec infos essentielles
- **Titre de l'événement** en haut
- **Pastille de couleur** discrète (coin supérieur droit) :
  - 🟢 Vert (#ABD4A9) : quota OK
  - 🟠 Orange (#EF7856) : quota +1 ou +2
  - 🔴 Rouge (#DD2D4A) : quota +3 ou plus
- **Date** : format "JJ mois YYYY"
- **Horaires** : format "HH:MM → HH:MM" (arrivée → départ)
- **Bénévoles en mode hashtag** : #Prénom (compact, comme des chips/badges)
- **Pas de compteurs** - Aucun chiffre visible
- **Bouton S'inscrire** directement sur la carte
- **Bouton Détails** pour voir plus d'infos

**Responsive :**
- Desktop : Grille 3 colonnes
- Tablet : Grille 2 colonnes
- Mobile : 1 colonne (empilé)

---

## 🔍 Filtres essentiels

### Filtre par Saison

Dropdown avec les saisons disponibles :
```
Saison ▼
├─ Toutes les saisons
├─ Saison 30 (2024-2025)
├─ Saison 29 (2023-2024) ← actuelle
├─ Saison 28 (2022-2023)
└─ ...
```

**Fonctionnement :**
- Une saison = septembre à juin
- Exemple : Saison 29 = sept 2023 à juin 2024
- Par défaut : Saison en cours

### Filtre par Année

Dropdown avec les années disponibles :
```
Année ▼
├─ Toutes les années
├─ 2024
├─ 2023
└─ ...
```

**Fonctionnement :**
- Année civile (janvier à décembre)
- Utilisé pour les bilans de l'association
- Peut être combiné avec le filtre saison

**Important :** Les deux filtres sont indépendants et peuvent être combinés :
- Exemple 1 : "Saison 29" = tous les événements de sept 2023 à juin 2024
- Exemple 2 : "Année 2024" = tous les événements de janv à déc 2024
- Exemple 3 : "Saison 29 + Année 2024" = événements de janv à juin 2024

---

## 📄 Page détail d'un événement

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  ← Retour au planning                                    │
│                                                          │
│  🎭 Spectacle de marionnettes                     [🟢]  │
│  ═══════════════════════════════════════════════════════ │
│                                                          │
│  📅 Date : 15 juin 2024                                 │
│  ⏰ Horaires : Arrivée 14h00 → Départ 17h30            │
│  🎪 Saison : 29                                         │
│  👥 Spectateurs attendus : 150                          │
│                                                          │
│  📝 Description                                         │
│  Spectacle pour enfants avec les marionnettes géantes   │
│                                                          │
│  💬 Commentaires                                        │
│  Prévoir chaises supplémentaires                        │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  👥 BÉNÉVOLES INSCRITS                            [🟢]  │
│                                                          │
│  ✓ Jean Dupont                      Inscrit le 10/05 à 14h30 │
│  ✓ Marie Laurent                    Inscrit le 10/05 à 15h12 │
│  ✓ Pierre Martin                    Inscrit le 11/05 à 09h45 │
│  ✓ Sophie Bernard                   Inscrit le 12/05 à 18h20 │
│  ✓ Lucas Petit                      Inscrit le 13/05 à 11h05 │
│  ✓ Emma Moreau                      Inscrit le 14/05 à 16h30 │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  [S'inscrire comme bénévole]                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Affichage des bénévoles inscrits

**Principe : Liste simple et claire**

- Liste des noms avec **heure d'inscription**
- Format : "Nom Prénom - Inscrit le JJ/MM à HHhMM"
- **Pas de compteur visible** (ex : pas de "6/5")
- **Pas d'avatar, pas de photo, pas de rôles**
- **Pas de section séparée** ("Dans le quota" / "En surplus")
- Juste la pastille de couleur globale en haut à droite (indicateur non contraignant)
- Ordre d'inscription : premier inscrit en haut

**Ce qui ne doit PAS apparaître :**
- ❌ Avatars ou photos de profil
- ❌ Compteurs (ex: "5/5", "6 inscrits")
- ❌ Compétences ou rôles
- ❌ Distinction visuelle quota/surplus

**Ce qui doit apparaître :**
- ✅ Nom complet du bénévole
- ✅ Date et heure d'inscription
- ✅ Ordre chronologique (premier inscrit = premier affiché)

**Bouton d'action :**
- Si pas inscrit ET délai > 24h : **[S'inscrire comme bénévole]** (bouton primary rouge #DD2D4A)
- Si pas inscrit ET délai < 24h : **[Inscriptions closes]** (bouton désactivé) + message explicatif
- Si déjà inscrit : **[Me désinscrire]** (bouton secondary)

**⚠️ RÈGLE IMPORTANTE : Délai de 24h minimum**
- Les inscriptions sont closes 24h avant l'événement
- Raison : Éviter les confusions sur la présence des bénévoles
- Message affiché : "Les inscriptions pour cet événement sont closes (moins de 24h avant le début)"

**🚨 ALERTE EMAIL EN CAS DE DÉSINSCRIPTION**
- Si un bénévole se désinscrit → Email automatique envoyé aux admins
- Email contient :
  - Nom du bénévole qui s'est désinscrit
  - Nom de l'événement
  - Date et horaires de l'événement
  - Nombre de bénévoles restants
- Raison : Les admins doivent être alertés rapidement en cas de désistement

---

## 👨‍💼 Interface Admin

### Dashboard admin

```
┌─────────────────────────────────────────────────────────┐
│  ADMINISTRATION                                          │
│                                                          │
│  [Créer un événement] [Importer CSV] [Gérer bénévoles] │
│                                                          │
│  Filtres: [Saison ▼] [Année ▼]    [📊 Export CSV]      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ÉVÉNEMENTS                                              │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Date         │ Nom              │ Inscrits │  🎨  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ 15/06/2024   │ Marionnettes     │    5     │  🟢  │  │
│  │ 20/09/2024   │ Concert          │    7     │  🟠  │  │
│  │ 05/10/2024   │ Théâtre          │   10     │  🔴  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Fonctionnalités admin :**
- Créer/Modifier/Supprimer des événements
- Importer des événements via CSV
- Vue tableau avec nombre d'inscrits (admins peuvent voir les chiffres)
- Clic sur un événement → voir la liste complète des inscrits
- Possibilité d'inscrire/désinscrire des bénévoles manuellement
- Export CSV des événements avec liste des inscrits

---

## 📊 Exports CSV

### Export "Événements avec bénévoles"

**Déclenchement :** Bouton **[Export CSV]** avec filtres actifs

**Format du fichier CSV exporté :**

```csv
date,nom,saison,nombre_spectateurs_attendus,nombre_benevoles_requis,nombre_inscrits,statut_quota,benevoles_inscrits,commentaires
2024-06-15,Spectacle de marionnettes,29,150,5,6,orange,"Jean Dupont; Marie Laurent; Pierre Martin; Sophie Bernard; Lucas Petit; Emma Moreau",Prévoir chaises supplémentaires
2024-09-20,Concert acoustique,30,200,8,10,rouge,"...",Annulation si pluie
```

**Colonnes de l'export :**
- `date` : Date de l'événement
- `nom` : Nom de l'événement
- `saison` : Numéro de saison
- `nombre_spectateurs_attendus` : Spectateurs prévus
- `nombre_benevoles_requis` : Quota de bénévoles
- `nombre_inscrits` : Nombre réel d'inscrits
- `statut_quota` : vert / orange / rouge
- `benevoles_inscrits` : Liste des noms séparés par ";"
- `commentaires` : Commentaires de l'événement

**Utilisation :**
- Statistiques de la saison
- Archivage annuel
- Bilan de l'association
- Analyse des taux de participation

### Export par Saison vs par Année

**Export par Saison :**
- Utilisé pour : Bilan artistique de la saison
- Période : Septembre à Juin
- Exemple : Export "Saison 29" = sept 2023 à juin 2024

**Export par Année :**
- Utilisé pour : Bilan administratif de l'association
- Période : Janvier à Décembre
- Exemple : Export "Année 2024" = janv à déc 2024

---

## 🎨 Design et couleurs

### Pastilles de statut

Les pastilles de couleur doivent être :
- **Discrètes** : Petites, en coin de carte
- **Non intrusives** : Ne pas dominer l'interface
- **Informatives** : Visible mais pas alarmante

**Tailles suggérées :**
- Desktop : 16px de diamètre
- Mobile : 12px de diamètre

**Position :**
- Coin supérieur droit de la carte événement
- À côté du titre sur la page détail

### Typographie

- **Titres événements** : League Spartan Bold, taille adaptative
- **Corps de texte** : League Spartan Regular
- **Dates** : League Spartan Bold avec icône 📅

### Hiérarchie visuelle

**Dans la liste :**
1. Nom de l'événement (le plus visible)
2. Date
3. Pastille de couleur (discrète)
4. Informations secondaires (spectateurs, commentaires)

**Page détail :**
1. Nom de l'événement
2. Informations clés (date, saison, spectateurs)
3. Description
4. Liste des bénévoles
5. Bouton d'action

---

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px
  - Cartes empilées
  - Navigation hamburger
  - Pastilles plus petites

- **Tablet** : 768px - 1024px
  - 2 colonnes de cartes
  - Navigation visible

- **Desktop** : > 1024px
  - 2-3 colonnes de cartes
  - Sidebar pour filtres (optionnel)
  - Vue tableau pour admin

### Adaptation mobile

**Liste événements :**
```
┌─────────────────────────┐
│ ☰  LA BAIE DES SINGES  │
│                         │
│ [Saison ▼] [Année ▼]   │
│ [Export CSV]            │
│                         │
├─────────────────────────┤
│                         │
│ 📅 15 juin 2024    [🟢] │
│ ┌─────────────────────┐ │
│ │ Marionnettes        │ │
│ │ 150 spectateurs     │ │
│ │                     │ │
│ │ [Détails →]        │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

---

## 🔔 Notifications et feedback

### Confirmations

**Après inscription :**
```
✓ Vous êtes inscrit au spectacle de marionnettes
  Un email de confirmation vous a été envoyé.
```

**Après désinscription :**
```
✓ Vous êtes désinscrit du spectacle de marionnettes
```

### Avertissements (non bloquants)

**Événement simultané :**
```
⚠️ Attention : Vous êtes déjà inscrit à un autre événement ce jour-là.
   Vous pouvez quand même vous inscrire.

   [Annuler] [M'inscrire quand même]
```

### Messages bloquants

**Inscription trop tardive (< 24h) :**
```
⛔ Inscriptions closes

Les inscriptions pour cet événement sont closes.
Il reste moins de 24h avant le début de l'événement.

Pour toute question, contactez un administrateur.
```

---

## 🎯 Parcours utilisateur

### Bénévole : S'inscrire à un événement

1. Connexion
2. Vue liste chronologique des événements
3. Repérage visuel rapide :
   - 🟢 Vert = besoin de monde
   - 🟠 Orange = quota presque atteint
   - 🔴 Rouge = beaucoup d'inscrits (mais peut quand même s'inscrire)
4. Clic sur "Voir les détails"
5. Lecture des informations
6. Clic sur "S'inscrire comme bénévole"
7. Confirmation visuelle + email

### Admin : Créer un événement et suivre les inscriptions

1. Connexion admin
2. Clic sur "Créer un événement" ou "Importer CSV"
3. Remplissage du formulaire / Upload CSV
4. Validation et création
5. Suivi des inscriptions via vue tableau
6. Export CSV en fin de saison pour statistiques

---

## 📋 Récapitulatif des décisions UX

| Aspect | Décision |
|--------|----------|
| **Compteurs** | ❌ Aucun compteur visible (ne pas freiner) |
| **Code couleur** | ✅ Pastille discrète (vert/orange/rouge) |
| **Vue principale** | Vue chronologique simple |
| **Filtres** | Saison + Année (essentiels) |
| **Export** | CSV avec événements + bénévoles inscrits |
| **Cycles** | Saison (sept-juin) + Année (janv-déc) |
| **Inscription** | Illimitée, jamais bloquée |
| **Liste bénévoles** | Simple, sans séparation quota/surplus |
| **Design** | Épuré, moderne, responsive |

---

**Principe cardinal : L'interface guide mais ne contraint jamais.**

## ⚠️ Note importante sur l'indicateur coloré

L'indicateur coloré (pastille verte/orange/rouge) est **UNIQUEMENT INFORMATIF**.

**Son rôle :**
- Permettre de se rendre compte visuellement de l'affluence
- Donner une indication sur le quota sans être contraignant
- Ne JAMAIS bloquer ou décourager les inscriptions (sauf délai 24h)

**Ce qu'il n'est PAS :**
- ❌ Un feu rouge qui empêche l'inscription
- ❌ Un message d'alerte angoissant
- ❌ Une raison de ne pas s'inscrire

**Ce qu'il est :**
- ✅ Un simple indicateur visuel discret
- ✅ Une information passive
- ✅ Un outil de prise de conscience, rien de plus
