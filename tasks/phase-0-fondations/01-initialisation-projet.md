# Tâche 0.1 — Initialisation du monorepo

**Phase :** 0 — Fondations
**Dépendances :** aucune
**Réfs cahier des charges :** §9.1, §9.4

## Objectif

Créer la structure de dépôt à la racine du projet avec deux applications séparées, `client/` (React) et `server/` (Node/Express), chacune avec son propre `package.json`, et l'outillage commun (git, éditeur, linting).

## Contexte

Le cahier des charges impose une architecture client/serveur découplée (§9.3) communiquant en REST/JSON. La structure de dossiers suggérée est détaillée au §9.4 — on la suit ici comme socle, en la complétant au fil des phases suivantes plutôt que de tout créer d'un coup.

## Étapes détaillées

1. **Racine du dépôt**
   - Initialiser un dépôt git (`git init`) si ce n'est pas déjà fait.
   - Créer un `.gitignore` racine couvrant : `node_modules/`, `.env`, `.env.local`, `dist/`, `build/`, `server/uploads/*` (garder `.gitkeep`), fichiers OS (`.DS_Store`).
   - Créer un `README.md` racine minimal (sera complété en Phase 5) : nom du projet, stack, lien vers le cahier des charges.

2. **Dossier `server/`**
   - `npm init -y` puis renseigner `name`, `description`, `license`.
   - Créer l'arborescence minimale : `src/config/`, `src/models/`, `src/controllers/`, `src/routes/`, `src/middlewares/`, `src/services/`, `uploads/` (avec `.gitkeep`).
   - Ajouter les scripts npm : `dev` (avec `nodemon`), `start` (`node src/app.js`).
   - Installer les dépendances de base listées au §9.2 (backend) : `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `express-rate-limit`, `express-validator`, `multer`, `dotenv`, `morgan`. Dev-dependency : `nodemon`.

3. **Dossier `client/`**
   - Bootstrap avec Vite (`npm create vite@latest client -- --template react`) — cohérent avec une SPA React moderne et rapide en dev.
   - Créer l'arborescence indicative du §9.4 : `src/api/`, `src/components/`, `src/layouts/`, `src/pages/{public,student,admin}/`, `src/context/`, `src/hooks/`, `src/routes/`, `src/theme/`, `src/utils/`.
   - Installer les dépendances de base listées au §9.2 (frontend) : `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `axios`. Les libs plus spécifiques (`@mui/x-data-grid`, `@mui/x-charts`, `dnd-kit`, `FullCalendar`, `Monaco Editor`, `react-hook-form`, `zod`) seront installées dans les tâches qui en ont besoin, pour ne pas alourdir inutilement cette étape.

4. **Outillage qualité**
   - Configurer ESLint + Prettier dans `client/` et `server/` (configs cohérentes, éventuellement un `.editorconfig` racine).
   - Ajouter un script racine (`package.json` racine optionnel, ou simple doc dans le README) expliquant comment lancer les deux apps en parallèle (deux terminaux, ou `concurrently` si l'équipe préfère un seul script).

## Fichiers à créer / modifier

```
projet/
├── .gitignore
├── README.md
├── client/                # généré par Vite + structure src/ ci-dessus
│   └── package.json
└── server/
    ├── src/{config,models,controllers,routes,middlewares,services}/
    ├── uploads/.gitkeep
    └── package.json
```

## Règles métier / cas limites

- Ne pas committer `.env` ni `node_modules/`.
- `uploads/` doit exister dans le dépôt (via `.gitkeep`) même vide, car la Phase 3 (upload avatar) en dépend.

## Critères d'acceptation

- [ ] `cd server && npm install` puis un `console.log` de test dans `src/app.js` s'exécute sans erreur.
- [ ] `cd client && npm install && npm run dev` affiche la page Vite/React par défaut.
- [ ] Structure de dossiers conforme au §9.4 créée (même si vide) dans les deux projets.
- [ ] `.gitignore` en place, aucun secret ni `node_modules` ne sera commité.
