# Tâche 0.2 — Configuration du serveur Express

**Phase :** 0 — Fondations
**Dépendances :** [01-initialisation-projet.md](01-initialisation-projet.md)
**Réfs cahier des charges :** §9.2 (back-end), §9.3, §9.5, §15 (Sécurité)

## Objectif

Mettre en place le point d'entrée `server/src/app.js`, la connexion MongoDB, la gestion centralisée des variables d'environnement, et les middlewares globaux de sécurité/logs, avec une gestion d'erreurs centralisée.

## Contexte

C'est le socle sur lequel toutes les routes API des phases suivantes viendront se greffer. Les règles de sécurité de base (§15) doivent être actives dès le premier jour, pas ajoutées après coup.

## Étapes détaillées

1. **Variables d'environnement** (`server/src/config/env.js` ou usage direct de `dotenv`)
   - Charger `.env` via `dotenv` au tout début de `app.js`.
   - Créer `server/.env.example` avec les clés du §9.5 : `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
   - Prévoir un module central qui lit et valide la présence des variables critiques au démarrage (fail-fast si `JWT_SECRET` absent, par exemple).

2. **Connexion MongoDB** (`server/src/config/db.js`)
   - Fonction `connectDB()` utilisant `mongoose.connect(process.env.MONGODB_URI)`.
   - Log de succès/échec de connexion, `process.exit(1)` en cas d'échec critique au démarrage.
   - Écouter les événements `mongoose.connection.on('error', …)` pour logguer les erreurs runtime.

3. **App Express** (`server/src/app.js`)
   - Middlewares globaux, dans un ordre cohérent :
     - `helmet()` — en-têtes de sécurité.
     - `cors({ origin: process.env.CLIENT_URL, credentials: true })` — restreint au domaine client (§15).
     - `express.json()` / `express.urlencoded()`.
     - `morgan('dev')` (ou `combined` en prod) — logs des requêtes.
   - Monter les routeurs sous `/api` (les routeurs eux-mêmes seront créés au fil des phases, prévoir juste le point de montage `app.use('/api/...', router)`).
   - Route de santé `GET /api/health` retournant `{ status: 'ok' }` — utile pour vérifier que tout est câblé.

4. **Rate limiting** (§15)
   - Configurer `express-rate-limit` de façon générale, et prévoir un limiteur plus strict dédié aux routes `login`/`register` (sera branché en Phase 1, mais le middleware générique peut être créé ici dans `middlewares/rateLimiter.js`).

5. **Middleware de gestion d'erreurs centralisée** (`server/src/middlewares/errorHandler.js`)
   - Middleware Express à 4 arguments `(err, req, res, next)` monté en dernier.
   - Format de réponse d'erreur JSON cohérent, ex. `{ message, errors? }`, en français.
   - Distinguer erreurs connues (validation, 404, 401/403) des erreurs serveur inattendues (log complet côté serveur, message générique côté client en production).
   - Middleware `notFound` (404) pour les routes non matchées, monté juste avant `errorHandler`.

6. **Point d'entrée** (`server/src/server.js` ou directement dans `app.js`)
   - `connectDB()` puis `app.listen(PORT, …)`.
   - `nodemon` pointé dessus pour le dev (`npm run dev`).

## Fichiers à créer / modifier

```
server/src/
├── config/
│   ├── env.js
│   └── db.js
├── middlewares/
│   ├── errorHandler.js
│   ├── notFound.js
│   └── rateLimiter.js
├── app.js
└── server.js
server/.env.example
```

## Règles métier / cas limites

- Ne jamais renvoyer la stack trace complète au client en production.
- `cors` ne doit pas être ouvert (`*`) — restreint à `CLIENT_URL` (§15).
- Le serveur ne doit pas démarrer si `MONGODB_URI` est absent ou si la connexion échoue.

## Critères d'acceptation

- [ ] `GET /api/health` répond `200 { status: 'ok' }` une fois le serveur lancé.
- [ ] Le serveur refuse de démarrer (message clair) si une variable d'environnement critique manque.
- [ ] Une requête depuis une origine différente de `CLIENT_URL` est bloquée par CORS.
- [ ] Une erreur lancée dans un contrôleur (test avec une route factice) est interceptée par `errorHandler` et renvoie un JSON structuré, pas une page HTML de stack trace.
- [ ] `helmet` et `morgan` actifs (vérifiables via les en-têtes de réponse et les logs console).
