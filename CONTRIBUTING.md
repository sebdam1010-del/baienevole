# Guide de contribution

Merci de contribuer à la plateforme de gestion des bénévoles de La Baie des Singes ! Ce guide vous aidera à bien démarrer.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Workflow de développement](#workflow-de-développement)
- [Conventions de code](#conventions-de-code)
- [Tests (TDD)](#tests-tdd)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)
- [Architecture du projet](#architecture-du-projet)

## Code de conduite

Ce projet adhère à un code de conduite pour créer un environnement accueillant et inclusif. En participant, vous vous engagez à respecter ce code.

**Principes clés :**
- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté
- Faites preuve d'empathie envers les autres membres

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **Git**
- **Un éditeur de code** (VS Code recommandé)

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Installation

### 1. Fork et clone le dépôt

```bash
# Forkez le projet sur GitHub
# Ensuite, clonez votre fork
git clone https://github.com/VOTRE-USERNAME/baienevole.git
cd baienevole
```

### 2. Installez les dépendances

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configuration de l'environnement

```bash
# Copiez le fichier .env.example
cp .env.example .env

# Éditez .env avec vos paramètres
```

### 4. Initialisez la base de données

```bash
# Génération du client Prisma
npm run db:generate

# Création de la base de données
npm run db:push

# (Optionnel) Données de test
npm run db:seed
```

### 5. Vérifiez que tout fonctionne

```bash
# Lancez les tests
npm test

# Lancez l'application en dev
npm run dev        # Terminal 1 - Backend
cd client && npm run dev  # Terminal 2 - Frontend
```

Ouvrez http://localhost:5173 dans votre navigateur.

## Workflow de développement

### Méthodologie TDD (Test-Driven Development)

Ce projet suit strictement la méthodologie TDD. **Chaque fonctionnalité doit commencer par ses tests.**

#### Cycle TDD (Red-Green-Refactor)

1. **RED** : Écrire un test qui échoue
2. **GREEN** : Écrire le code minimal pour faire passer le test
3. **REFACTOR** : Améliorer le code tout en gardant les tests verts

#### Exemple pratique

```javascript
// 1. RED - Écrire le test d'abord (tests/feature.test.js)
describe('New Feature', () => {
  it('should do something specific', async () => {
    const result = await newFeature();
    expect(result).toBe(expectedValue);
  });
});

// Lancer les tests - ils doivent échouer
npm test

// 2. GREEN - Implémenter la fonctionnalité (src/feature.js)
const newFeature = () => {
  return expectedValue;
};

// Lancer les tests - ils doivent passer
npm test

// 3. REFACTOR - Améliorer le code si nécessaire
// Puis relancer les tests pour vérifier
npm test
```

### Workflow Git

#### 1. Créer une branche

```bash
# Toujours partir de main à jour
git checkout main
git pull origin main

# Créer une branche descriptive
git checkout -b feature/nom-de-la-fonctionnalite
# ou
git checkout -b fix/description-du-bug
```

**Conventions de nommage des branches :**
- `feature/` : Nouvelle fonctionnalité
- `fix/` : Correction de bug
- `refactor/` : Refactoring de code
- `docs/` : Modifications de documentation
- `test/` : Ajout ou modification de tests

#### 2. Développer avec TDD

```bash
# 1. Écrire les tests
# 2. Lancer les tests (ils doivent échouer)
npm test

# 3. Implémenter la fonctionnalité
# 4. Lancer les tests (ils doivent passer)
npm test

# 5. Vérifier la couverture
npm test -- --coverage
```

#### 3. Commiter régulièrement

```bash
# Ajouter les fichiers
git add src/feature.js tests/feature.test.js

# Commiter avec un message descriptif
git commit -m "feat: Add user authentication feature

- Implement JWT token generation
- Add login/register endpoints
- Add authentication middleware
- Tests: 15 tests, 100% coverage"
```

**Format des messages de commit :**
```
<type>: <description courte>

[Corps optionnel avec détails]
[Tests et couverture]
```

**Types de commit :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactoring (pas de changement fonctionnel)
- `test`: Ajout/modification de tests
- `docs`: Documentation
- `style`: Formatage, linting
- `chore`: Tâches diverses (dépendances, config)

#### 4. Pousser la branche

```bash
git push origin feature/nom-de-la-fonctionnalite
```

## Conventions de code

### JavaScript/Node.js

- **Style** : ESLint + Prettier (configuration dans le projet)
- **Indentation** : 2 espaces
- **Quotes** : Single quotes pour JS, double quotes pour JSX
- **Semicolons** : Oui
- **Nommage** :
  - Variables/Fonctions : `camelCase`
  - Classes : `PascalCase`
  - Constantes : `UPPER_SNAKE_CASE`
  - Fichiers : `camelCase.js` ou `kebab-case.js`

### React/Frontend

- **Composants** : PascalCase (ex: `EventCard.jsx`)
- **Hooks** : Préfixe `use` (ex: `useAuth.js`)
- **Props** : camelCase
- **CSS** : Tailwind CSS v4 (voir DESIGN-SYSTEM.md)

### Exemples

```javascript
// ✅ Bon
const getUserById = async (userId) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  return user;
};

// ❌ Mauvais
async function get_user_by_id(user_id) {
  let user = await db.user.findUnique({where: {id: user_id}})
  return user
}
```

### Linting et formatage

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement
npm run lint:fix

# Formater le code
npm run format
```

## Tests (TDD)

### Principe : Tests AVANT le code

**⚠️ IMPORTANT** : Ne jamais écrire de code sans test. Les tests doivent échouer avant d'écrire l'implémentation.

### Types de tests

#### 1. Tests unitaires (Jest + Supertest)

```javascript
// tests/services/emailService.test.js
describe('EmailService', () => {
  describe('sendRegistrationConfirmation', () => {
    it('should send confirmation email with correct data', async () => {
      const result = await emailService.sendRegistrationConfirmation(
        volunteerInfo,
        eventInfo
      );

      expect(result.accepted).toContain(volunteerInfo.email);
      expect(result.response).toContain('250 OK');
    });
  });
});
```

#### 2. Tests d'intégration (Supertest)

```javascript
// tests/routes/events.test.js
describe('POST /api/events/:id/register', () => {
  it('should register user to event', async () => {
    const response = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.message).toBe('Registered successfully');
  });
});
```

#### 3. Tests E2E (Playwright)

```javascript
// e2e/volunteer-registration.spec.js
test('should register to an event', async ({ page }) => {
  await page.goto('/events');
  await page.click('[data-testid="event-register-btn"]');
  await expect(page.getByText('Inscription réussie')).toBeVisible();
});
```

### Couverture de code

**Objectif minimum : 80%**

```bash
# Vérifier la couverture
npm test -- --coverage

# La couverture doit être >= 80% pour tous les fichiers
```

### Bonnes pratiques

- **Un test = une assertion principale**
- **Noms descriptifs** : `it('should do X when Y happens')`
- **Arrange, Act, Assert** : Structure claire
- **Tests isolés** : Pas de dépendances entre tests
- **Mocking** : Utiliser des mocks pour services externes

```javascript
// ✅ Bon test
describe('User registration', () => {
  it('should create user and return JWT token when valid data provided', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123',
      firstName: 'Test',
      lastName: 'User',
    };

    // Act
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(userData.email);
  });
});
```

## Documentation

### Code

- **JSDoc** pour toutes les fonctions publiques
- **Commentaires** pour la logique complexe
- **README** à jour avec nouvelles fonctionnalités

```javascript
/**
 * Inscrit un bénévole à un événement
 * @param {string} userId - ID du bénévole
 * @param {string} eventId - ID de l'événement
 * @returns {Promise<Registration>} L'inscription créée
 * @throws {Error} Si événement dans moins de 24h ou déjà inscrit
 */
const registerToEvent = async (userId, eventId) => {
  // Implementation
};
```

### API (Swagger)

Documenter tous les nouveaux endpoints avec `@swagger` :

```javascript
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Liste tous les événements
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Liste des événements
 */
router.get('/', eventsController.getAllEvents);
```

## Pull Requests

### Avant de créer une PR

**Checklist obligatoire :**

- [ ] Tous les tests passent (`npm test`)
- [ ] Couverture >= 80% (`npm test -- --coverage`)
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Linting OK (`npm run lint`)
- [ ] Code formaté (`npm run format`)
- [ ] Documentation à jour
- [ ] API documentée (Swagger) si nouveaux endpoints
- [ ] README mis à jour si nécessaire

### Créer la Pull Request

1. **Poussez votre branche**
```bash
git push origin feature/nom-de-la-fonctionnalite
```

2. **Créez la PR sur GitHub**
   - Titre descriptif : `feat: Add user authentication`
   - Description détaillée avec :
     - Contexte et motivation
     - Changements apportés
     - Tests ajoutés
     - Screenshots si UI

3. **Template de PR**

```markdown
## Description

Brief description of changes.

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist

- [ ] Tests ajoutés/mis à jour
- [ ] Couverture >= 80%
- [ ] Documentation mise à jour
- [ ] Tests E2E passent
- [ ] Linting OK

## Tests

- Total: X tests
- Couverture: Y%
- E2E: Z tests

## Screenshots (si applicable)

[Ajouter captures d'écran]
```

### Processus de review

1. **CI/CD** : Les tests automatiques doivent passer
2. **Code review** : Au moins 1 approbation requise
3. **Discussions** : Répondre aux commentaires
4. **Merge** : Squash and merge (par défaut)

### Après le merge

```bash
# Mettre à jour votre branche main locale
git checkout main
git pull origin main

# Supprimer la branche locale
git branch -d feature/nom-de-la-fonctionnalite

# Supprimer la branche distante (optionnel, fait automatiquement sur GitHub)
git push origin --delete feature/nom-de-la-fonctionnalite
```

## Architecture du projet

```
baienevole/
├── src/                      # Backend (Node.js/Express)
│   ├── controllers/          # Logique métier
│   ├── routes/              # Routes API
│   ├── middleware/          # Middleware Express
│   ├── services/            # Services (email, etc.)
│   ├── config/              # Configuration (Swagger, etc.)
│   └── utils/               # Utilitaires
├── client/                  # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'app
│   │   ├── hooks/           # Custom hooks
│   │   ├── contexts/        # Context API
│   │   ├── services/        # API calls
│   │   └── utils/           # Utilitaires frontend
│   └── public/              # Assets statiques
├── tests/                   # Tests backend (Jest)
├── e2e/                     # Tests E2E (Playwright)
├── prisma/                  # Schéma base de données
└── scripts/                 # Scripts utilitaires
```

### Patterns utilisés

- **Backend** : MVC (Model-View-Controller)
- **Frontend** : Composants fonctionnels + Hooks
- **État** : Context API
- **Routing** : React Router
- **Styling** : Tailwind CSS v4
- **Tests** : Jest + Supertest + Playwright

## Resources

### Documentation

- [README.md](./README.md) - Documentation principale
- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - Charte graphique
- [UX-SPECIFICATIONS.md](./UX-SPECIFICATIONS.md) - Spécifications UX
- [ISSUES.md](./ISSUES.md) - Liste des issues
- [Swagger API Docs](http://localhost:3000/api-docs) - Documentation API

### Outils

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)

## Questions ?

Si vous avez des questions ou besoin d'aide :

1. Consultez la [documentation existante](./README.md)
2. Ouvrez une [issue](https://github.com/sebdam1010-del/baienevole/issues) avec le tag `question`
3. Contactez l'équipe du projet

---

**Merci de contribuer à La Baie des Singes !** 🎭
