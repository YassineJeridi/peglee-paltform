# Checklist de sécurité — Plateforme « Bac Informatique »

Audit croisé de la tâche 5.4, réalisé le 2026-08-24. Reprend point par point le §15 du cahier des charges. Chaque point a été vérifié en relisant le code **et**, quand c'était possible, en le retestant réellement contre l'API en cours d'exécution (comptes de test réels, pas seulement une relecture).

## 1. Mots de passe

**Statut : vérifié, corrigé.**

- `passwordHash` a `select: false` dans le modèle `User` — jamais renvoyé par défaut.
- Grep exhaustif de tous les sérialiseurs de réponse (`authController`, `userController`, `adminUserController`) : chacun construit sa réponse en listant explicitement les champs à renvoyer (`toUserSummary`/`toUserResponse`), jamais `res.json(user)` brut. Aucune fuite trouvée.
- **Correction appliquée** : le middleware `auth.js` faisait `User.findById(decoded.id).select('+passwordHash')`, attachant le hash à `req.user` pour **toutes** les routes authentifiées de l'app (~40 endpoints), alors que seul `changePassword` en a réellement besoin (et le re-sélectionne déjà lui-même explicitement). Retiré ce `.select('+passwordHash')` de `auth.js` : `req.user` ne porte plus jamais le hash, ce qui supprime une classe entière de risque de fuite accidentelle future (ex. un futur `res.json(req.user)` par erreur).

## 2. JWT

**Statut : vérifié, conforme.**

- Expiration appliquée via `JWT_EXPIRES_IN` (`env.jwtExpiresIn`, défaut `7d`) ; `auth.js` intercepte explicitement `TokenExpiredError` → 401 avec message clair.
- `JWT_SECRET` est **requis** au démarrage (`config/env.js` fait `process.exit(1)` s'il manque) — aucune valeur par défaut faible n'est committée. `.env.example` documente qu'il faut le changer.
- `.env` est bien dans `.gitignore` (vérifié : `git check-ignore -v .env` le confirme).
- Stratégie client cohérente avec la tâche 1.1 : Bearer token stocké en `localStorage` (`api/tokenStorage.js`), attaché via un intercepteur Axios (`api/axiosInstance.js`), jamais de cookie — cohérent des deux côtés (le serveur n'attend jamais de cookie de session).

## 3. Middlewares d'autorisation

**Statut : vérifié en code ET en conditions réelles, aucun écart trouvé.**

Chaque fichier de `server/src/routes/` a été relu intégralement. Toutes les routes d'écriture et toutes les routes admin ont `auth` + `role('admin')` là où requis — y compris les 4 méthodes HTTP de `userRoutes.js` (piège classique mentionné par la tâche : un développeur oublie le middleware sur une seule des 4). Aucun écart trouvé.

Retesté en direct contre l'API (serveur réel + comptes de test) :

| Test | Résultat attendu | Résultat obtenu |
|---|---|---|
| Token élève → `GET /api/admin/stats` | 403 | ✅ 403 |
| Token élève → `GET /api/users` (liste admin) | 403 | ✅ 403 |
| Token élève → `POST /api/modules` | 403 | ✅ 403 |
| Token élève → `GET /api/quiz/manage/:id` | 403 | ✅ 403 |
| Aucun token → `GET /api/tasks` | 401 | ✅ 401 |
| Aucun token → `GET /api/modules` | 401 | ✅ 401 |
| Token invalide/garbage → `GET /api/tasks` | 401 | ✅ 401 |

## 4. Validation / assainissement des entrées

**Statut : vérifié, complété.**

- `express-validator` est utilisé sur `/api/auth/*` (register/login) et pour les quiz (`quizValidators.js`, validation manuelle mais équivalente : bornes de `passingScore`/`maxAttempts`, structure des questions).
- Les autres contrôleurs (Task/Note/Event/Module/Lesson/Exercise) n'utilisent pas la librairie mais s'appuient sur la validation de schéma Mongoose (`required`, `enum`, `trim`) + des gardes manuelles (`if (!title) throw ApiError(400, ...)`) + `mongoose.isValidObjectId()` systématique sur tous les paramètres `:id` — équivalent fonctionnel raisonnable pour des champs simples.
- Recherché une éventuelle injection NoSQL (body JSON envoyant un objet `{"$ne": null}` au lieu d'une chaîne) : les endpoints à plus fort enjeu (login/register) sont protégés car `express-validator` (`.trim()`) force une coercition en chaîne. Ailleurs, le typage Mongoose sur `.create()`/`.save()` fournit une protection équivalente. Rien d'exploitable trouvé.
- Aucun `dangerouslySetInnerHTML` (ni `rehype-raw`, ni `innerHTML`) nulle part côté client — grep exhaustif du dossier `client/src`. Le contenu utilisateur (notes, tâches, événements) et le contenu admin (leçons via `react-markdown`) sont donc rendus en texte échappé par défaut : le XSS stocké n'est **pas exploitable** via le rendu actuel de l'app, même sans sanitisation serveur dédiée.
- **Correction appliquée** (durcissement, pas une vulnérabilité active vu la limite globale de 100 Ko déjà imposée par `express.json()`) : ajout de `maxlength` sur les champs texte libres sans limite (`Note.content` 5000, `Task.title/description` 200/2000, `Event.title/description` 200/2000).

## 5. `helmet` / `cors` / `express-rate-limit`

**Statut : vérifié, conforme.**

- `helmet()` appliqué globalement, en tout premier middleware (`app.js`).
- `cors({ origin: env.clientUrl, credentials: true })` — restreint à l'URL du client configurée, **jamais** de wildcard `*`. À vérifier au déploiement que `CLIENT_URL` pointe bien vers le domaine de prod réel (`.env.example` documente la variable).
- `apiLimiter` (300 req/15 min) monté globalement sur `/api`. `authLimiter` (10 req/15 min, plus strict) monté spécifiquement sur `/auth/register` et `/auth/login` — protection anti-brute-force confirmée en place.

## 6. Upload d'images

**Statut : vérifié en conditions réelles.**

- `grep -rl multer server/src` confirme un seul point d'upload dans toute l'app (`middlewares/uploadAvatar.js`, avatar utilisateur) — rien d'autre à auditer.
- Retesté en direct : upload d'un fichier `.jpg` dont le contenu réel n'est pas une image (Content-Type déclaré usurpé) → rejeté (400, signature binaire invalide). Upload d'un fichier >5 Mo avec une signature JPEG valide → rejeté (400, taille dépassée). Les deux gardes-fous fonctionnent réellement, pas seulement sur le papier.
- Nom de fichier toujours généré côté serveur (`${userId}-${timestamp}${ext}`), jamais le nom original envoyé par le client — aucun risque de traversée de chemin.
- `server/uploads/avatars/` correctement exclu de git (`.gitignore` racine, vérifié avec `git check-ignore`) — aucune photo d'élève ne finira dans l'historique git.

## 7. Isolation des données

**Statut : vérifié en code ET en conditions réelles (test croisé deux comptes).**

- Grep systématique des contrôleurs `Task`/`Note`/`Event` : chaque `find`/`findOne`/`findOneAndDelete` filtre par `userId: req.user.id` ; `userId` n'est **jamais** pris du body (commenté explicitement à chaque endroit). Les mises à jour/suppressions renvoient 404 (pas 403) si la ressource appartient à un autre utilisateur, pour ne pas révéler son existence.
- `Progress`/`QuizAttempt` : toujours interrogés via `req.user.id` passé explicitement par le contrôleur, jamais un id pris du client.
- Retesté en direct avec deux comptes élève réels : le compte B ne voit pas la tâche du compte A dans sa liste, ne peut ni la modifier (404) ni la supprimer (404) en devinant son id ; le compte A la retrouve intacte ensuite.

## 8. Contenu quiz

**Statut : retesté en direct, conforme.**

- `GET /api/quiz/:subModuleId` (élève, avant toute soumission) retesté contre l'API réelle avec un compte élève réel : la réponse JSON brute a été inspectée intégralement — aucune trace de `correctAnswers` ni `explanation`. Confirmé aussi par un `grep` sur la réponse brute.
- `GET /api/quiz/manage/:subModuleId` (document complet avec réponses) reste bien réservé à `role('admin')`.

## 9. HTTPS en production

**Statut : documentation (hors code applicatif).**

L'application ne gère pas elle-même les certificats TLS — à la charge de l'infrastructure de déploiement :

- Terminer le TLS au niveau d'un reverse proxy (nginx, Caddy, ou le load balancer du fournisseur cloud) devant le serveur Node, jamais exposer Express directement en HTTP sur Internet.
- Rediriger tout trafic HTTP entrant vers HTTPS (301) au niveau du reverse proxy.
- `CLIENT_URL` (utilisé par `cors`) et l'URL appelée par le frontend (`VITE_API_URL`) doivent tous deux être en `https://` en production.
- `NODE_ENV=production` doit être positionné (contrôle le format des logs `morgan` et masque les détails d'erreur serveur dans les réponses, cf. `errorHandler.js`).

---

## Résumé des corrections apportées par cette tâche

| Fichier | Changement |
|---|---|
| `server/src/middlewares/auth.js` | Retiré `.select('+passwordHash')` — `req.user` ne porte plus jamais le hash |
| `server/src/models/Note.js` | Ajout `maxlength: 5000` sur `content` |
| `server/src/models/Task.js` | Ajout `maxlength` sur `title` (200) et `description` (2000) |
| `server/src/models/Event.js` | Ajout `maxlength` sur `title` (200) et `description` (2000) |

Tout le reste de la checklist (§15) a été vérifié conforme sans correction nécessaire.
