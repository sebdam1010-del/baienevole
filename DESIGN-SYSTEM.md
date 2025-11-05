# Design System - La Baie des Singes

Ce document définit la charte graphique et le design system de la plateforme de gestion des bénévoles.

## 🎨 Palette de couleurs

### Couleurs principales

```css
/* Bleu marine foncé - Couleur principale */
--color-primary: #131226;
--color-primary-rgb: 19, 18, 38;
--color-primary-cmyk: 100, 95, 49, 71;

/* Rouge/Rose - Couleur d'accent */
--color-accent: #DD2D4A;
--color-accent-rgb: 221, 45, 74;
--color-accent-cmyk: 6, 92, 60, 1;
```

### Couleurs secondaires

```css
/* Beige/Sable - Couleur neutre chaude */
--color-secondary-beige: #DFB999;
--color-secondary-beige-rgb: 220, 185, 153;
--color-secondary-beige-cmyk: 16, 30, 42, 0;

/* Orange corail - Couleur d'accent chaude */
--color-secondary-orange: #EF7856;
--color-secondary-orange-rgb: 239, 120, 86;
--color-secondary-orange-cmyk: 0, 64, 65, 0;

/* Jaune/Or - Couleur d'accent lumineuse */
--color-secondary-yellow: #F5AC44;
--color-secondary-yellow-rgb: 245, 172, 68;
--color-secondary-yellow-cmyk: 2, 38, 79, 0;

/* Vert clair - Couleur d'accent fraîche */
--color-secondary-green: #ABD4A9;
--color-secondary-green-rgb: 171, 212, 169;
--color-secondary-green-cmyk: 39, 0, 43, 0;
```

### Utilisation des couleurs

| Couleur | Utilisation recommandée |
|---------|-------------------------|
| **#131226** (Bleu marine) | Arrière-plans, textes principaux, headers |
| **#DD2D4A** (Rouge/Rose) | Boutons CTA, alertes, éléments interactifs |
| **#DFB999** (Beige) | Arrière-plans clairs, cartes, sections |
| **#EF7856** (Orange) | Badges, notifications, éléments secondaires |
| **#F5AC44** (Jaune/Or) | Highlights, événements importants |
| **#ABD4A9** (Vert) | Success states, confirmations, validations |

## 📝 Typographie

### Polices

#### Titres H1
- **Police** : Protest Riot Regular
- **Usage** : Titres principaux, hero sections
- **Taille** : 48px desktop / 32px mobile
- **Poids** : Regular

```css
h1 {
  font-family: 'Protest Riot', sans-serif;
  font-weight: 400;
  font-size: 3rem; /* 48px */
  line-height: 1.2;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem; /* 32px */
  }
}
```

#### Sous-titres H2
- **Police** : League Spartan Bold
- **Usage** : Sous-titres de sections
- **Taille** : 32px desktop / 24px mobile
- **Poids** : Bold (700)

```css
h2 {
  font-family: 'League Spartan', sans-serif;
  font-weight: 700;
  font-size: 2rem; /* 32px */
  line-height: 1.3;
}

@media (max-width: 768px) {
  h2 {
    font-size: 1.5rem; /* 24px */
  }
}
```

#### Corps de texte
- **Police** : League Spartan Regular
- **Usage** : Paragraphes, textes courants
- **Taille** : 16px desktop / 14px mobile
- **Poids** : Regular (400)

```css
body, p {
  font-family: 'League Spartan', sans-serif;
  font-weight: 400;
  font-size: 1rem; /* 16px */
  line-height: 1.6;
}
```

### Échelle typographique

```css
:root {
  /* Titres */
  --font-size-h1: 3rem;      /* 48px */
  --font-size-h2: 2rem;      /* 32px */
  --font-size-h3: 1.5rem;    /* 24px */
  --font-size-h4: 1.25rem;   /* 20px */

  /* Corps de texte */
  --font-size-base: 1rem;    /* 16px */
  --font-size-small: 0.875rem; /* 14px */
  --font-size-tiny: 0.75rem; /* 12px */

  /* Line heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.8;
}
```

## 🖼️ Logos et assets

### Variantes du logo

1. **Logo Pastille** : Format rond, utilisation principale
2. **Logo Pillule** : Format horizontal, pour les headers
3. **Écussons** : Format badge, pour les éléments décoratifs
4. **Pancartes** : Format avec cadre, pour les bannières
5. **Branche** : Les 3 singes sur branche, élément illustratif
6. **Nom typographique** : "LA BAIE DES SINGES" en texte

### Emplacement des assets

```
/public/assets/
  /logos/
    - logo-pastille.svg
    - logo-pillule.svg
    - logo-ecussons.svg
    - logo-pancartes.svg
    - logo-branche.svg
    - logo-nom.svg
```

## 🎯 Composants UI

### Boutons

#### Bouton primaire

```css
.btn-primary {
  background-color: #DD2D4A;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'League Spartan', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #C02538;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(221, 45, 74, 0.3);
}
```

#### Bouton secondaire

```css
.btn-secondary {
  background-color: #131226;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'League Spartan', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #1F1E3A;
  transform: translateY(-2px);
}
```

#### Bouton success

```css
.btn-success {
  background-color: #ABD4A9;
  color: #131226;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'League Spartan', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### Cards

```css
.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(19, 18, 38, 0.1);
  border: 1px solid #DFB999;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(19, 18, 38, 0.15);
  transform: translateY(-4px);
}
```

### Badges

```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 700;
}

.badge-success {
  background-color: #ABD4A9;
  color: #131226;
}

.badge-warning {
  background-color: #F5AC44;
  color: #131226;
}

.badge-danger {
  background-color: #DD2D4A;
  color: #FFFFFF;
}

.badge-info {
  background-color: #EF7856;
  color: #FFFFFF;
}
```

## 📱 Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1440px;
}
```

### Grid System

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 0 32px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 48px;
  }
}
```

## 🌐 Accessibilité

### Contraste des couleurs

Tous les couples de couleurs respectent les normes WCAG 2.1 AA :
- Texte sur fond clair : ratio minimum 4.5:1
- Texte large sur fond clair : ratio minimum 3:1
- Éléments interactifs : ratio minimum 3:1

### Focus states

```css
*:focus {
  outline: 2px solid #DD2D4A;
  outline-offset: 2px;
}

button:focus,
a:focus {
  outline: 3px solid #DD2D4A;
  outline-offset: 4px;
}
```

## 📦 Configuration Tailwind CSS

Pour intégrer ce design system avec Tailwind CSS :

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#131226',
          light: '#1F1E3A',
          dark: '#0A0A14',
        },
        accent: {
          DEFAULT: '#DD2D4A',
          light: '#E85570',
          dark: '#C02538',
        },
        beige: {
          DEFAULT: '#DFB999',
          light: '#EDD1B8',
          dark: '#CCA47A',
        },
        orange: {
          DEFAULT: '#EF7856',
          light: '#F59C7F',
          dark: '#D45E3D',
        },
        yellow: {
          DEFAULT: '#F5AC44',
          light: '#F9C36E',
          dark: '#D99430',
        },
        green: {
          DEFAULT: '#ABD4A9',
          light: '#C5E2C4',
          dark: '#8FBD8D',
        },
      },
      fontFamily: {
        heading: ['Protest Riot', 'sans-serif'],
        sans: ['League Spartan', 'sans-serif'],
      },
      fontSize: {
        'h1': '3rem',
        'h2': '2rem',
        'h3': '1.5rem',
        'h4': '1.25rem',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}
```

## 🎨 Exemples d'interface

### Header

```html
<header class="bg-primary text-white">
  <div class="container py-4">
    <img src="/assets/logos/logo-pillule.svg" alt="La Baie des Singes" class="h-12">
  </div>
</header>
```

### Card d'événement

```html
<div class="card">
  <div class="badge badge-info">Saison 29</div>
  <h3 class="text-primary mt-2">Spectacle de marionnettes</h3>
  <p class="text-gray-600 mt-2">150 spectateurs attendus</p>
  <button class="btn-primary mt-4">S'inscrire</button>
</div>
```

## 📚 Ressources

- **Site web** : baiedessinges.com
- **Brandboard PDF** : Disponible dans `/docs/client_brandboard.pdf`
- **Polices** :
  - Protest Riot : https://fonts.google.com/specimen/Protest+Riot
  - League Spartan : https://fonts.google.com/specimen/League+Spartan

---

**Note** : Ce design system doit être respecté dans tous les développements de l'application pour garantir une cohérence visuelle et une expérience utilisateur optimale.
