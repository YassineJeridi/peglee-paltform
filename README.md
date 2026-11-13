# Plateforme « Bac Informatique »

Plateforme d'apprentissage en ligne dédiée aux élèves tunisiens préparant le Baccalauréat Informatique (section Sciences de l'informatique).

Cahier des charges complet : [Cahier_des_Charges_Plateforme_Bac_Informatique.md](Cahier_des_Charges_Plateforme_Bac_Informatique.md)
Découpage en tâches de développement : [tasks/](tasks/README.md)

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React (Vite) + MUI (Material UI) |
| Back-end | Node.js + Express |
| Base de données | MongoDB (via Mongoose) |
| Authentification | JWT + bcrypt |

## Structure du dépôt

```
projet/
├── client/     # Application React (SPA)
└── server/     # API Node.js / Express
```

## Authentification — stratégie JWT

La plateforme utilise un **JWT porté dans l'en-tête `Authorization: Bearer <token>`**
(et non un cookie httpOnly). Ce choix, retenu en tâche 1.1, conditionne le front-end
(tâche 1.3) :

- **Émission** : `POST /api/auth/register` et `POST /api/auth/login` renvoient
  `{ token, user }`. Le payload du token est volontairement minimal : `{ id, role }`.
- **Stockage client** : le token est conservé dans `localStorage` (`bi_token`).
  Un intercepteur de requête Axios l'ajoute automatiquement à chaque appel.
- **Restauration de session** : au démarrage, `AuthContext` lit le token stocké et
  appelle `GET /api/auth/me` pour réhydrater l'utilisateur — un rafraîchissement (F5)
  ne déconnecte donc pas l'utilisateur.
- **Expiration / rejet** : tout `401` renvoyé par l'API déclenche une déconnexion
  locale propre (purge du token) et une redirection vers `/connexion`.
- **Déconnexion** : `POST /api/auth/logout` répond `200` mais l'invalidation réelle
  est côté client (suppression du token), la stratégie Bearer étant *stateless*.

> ⚠️ Compromis assumé : `localStorage` est lisible en JS (exposition XSS théorique).
> La surface est réduite par `helmet`, la validation stricte des entrées et l'absence
> de contenu tiers non maîtrisé. Une migration vers un cookie httpOnly + refresh token
> est envisageable en Phase 6 sans changer les contrats d'API.

## Installation & lancement

### Prérequis

- Node.js ≥ 18
- MongoDB (local ou distant) — pour lancer l'API en développement/production. La
  suite de tests backend n'en a pas besoin (voir plus bas).

### Backend

```bash
cd server
cp .env.example .env   # renseigner les variables d'environnement (voir le tableau ci-dessous)
npm install
npm run seed            # crée l'admin et les données de démonstration
npm run dev             # démarre l'API en développement (nodemon), http://localhost:5001
```

Variables d'environnement (`server/.env`, voir [server/.env.example](server/.env.example)) :

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute de l'API (défaut `5001`). |
| `MONGODB_URI` | URI de connexion MongoDB. |
| `JWT_SECRET` | Secret de signature des JWT — à changer avant toute mise en production. |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex. `7d`). |
| `CLIENT_URL` | Origine autorisée par CORS (URL du frontend). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Identifiants du compte admin créé par `npm run seed`. |

Autres commandes utiles côté `server/` :

```bash
npm run seed:reset   # vide la base puis reseed (élèves/modules/leçons/quiz/exercices de démo)
npm run seed:users   # ajoute des élèves de démonstration supplémentaires (données aléatoires)
npm start            # démarre l'API en mode production (sans nodemon)
```

### Frontend

```bash
cd client
cp .env.example .env   # VITE_API_URL doit pointer vers l'API (http://localhost:5001/api en local)
npm install
npm run dev             # http://localhost:5183
npm run build            # build de production dans client/dist/
```

### Tests

La suite de tests backend (Jest + Supertest) couvre la logique métier critique :
correction de quiz, déverrouillage progressif leçon → quiz → exercices, rôles
admin/élève, isolation des données entre élèves. Elle démarre automatiquement une
instance MongoDB éphémère dédiée (via `mongodb-memory-server`) — elle n'utilise
jamais la base configurée dans `.env` et ne requiert donc pas MongoDB à lancer au
préalable. Si un `mongod` est déjà installé sur la machine (ex. `brew install
mongodb-community`), il est réutilisé directement ; sinon un binaire est téléchargé
automatiquement (nécessite un accès réseau).

```bash
cd server
npm test
```

### Documentation des endpoints

La liste complète des routes de l'API (méthode, protection 🔒/👑, description, format
du body) est maintenue dans [server/API.md](server/API.md).


## Fonctionnalités V2 (Phase 6)

- **Mot de passe oublié** : `/mot-de-passe-oublie` → e-mail avec lien à usage unique (1 h). Sans SMTP configuré en développement, le lien est affiché dans la console du serveur.
- **Badges & notifications** : cloche de la barre supérieure, badges sur la vue d'ensemble élève, gestion des badges dans Admin → Badges.
- **Exécution Python** : bouton « Exécuter » sur les exercices Python munis de cas de test (voir [DEPLOYMENT.md](DEPLOYMENT.md)).
- **Import de contenu** : Admin → Import, fichier JSON — voir [docs/IMPORT_FORMAT.md](docs/IMPORT_FORMAT.md) et le modèle [docs/templates/content-template.json](docs/templates/content-template.json).

## Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) (Docker + check-list de mise en production).
