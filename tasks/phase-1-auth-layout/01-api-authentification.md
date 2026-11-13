# Tâche 1.1 — API d'authentification

**Phase :** 1 — Authentification & layout
**Dépendances :** [phase-0-fondations/03-modeles-mongoose.md](../phase-0-fondations/03-modeles-mongoose.md), [phase-0-fondations/02-configuration-backend-express.md](../phase-0-fondations/02-configuration-backend-express.md)
**Réfs cahier des charges :** §5.2, §5.3, §5.4, §9.6, §11.1, §15

## Objectif

Implémenter les endpoints `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, ainsi que les middlewares `auth` (vérification JWT) et `role(...)` (autorisation par rôle) réutilisés par toutes les routes protégées du reste du projet.

## Contexte

C'est la pierre angulaire de sécurité de toute la plateforme : toutes les routes des phases suivantes (2 à 4) s'appuient sur le middleware `auth` créé ici. Le cahier des charges est explicite : le mot de passe est haché avec bcrypt (§5.2), le rôle est toujours `student` à l'inscription (§5.2), et l'accès admin ne peut jamais être auto-attribué (§3.2).

## Étapes détaillées

1. **Validation des entrées** (`express-validator`)
   - `register` : `username` requis, `email` requis + format valide, `password` requis + min 8 caractères, `confirmPassword` doit correspondre à `password` (validation possible côté client aussi, mais **obligatoire côté serveur**, §5.2).
   - `login` : `email` + `password` requis.
   - Messages d'erreur en français, agrégés proprement (ex. `{ errors: [{ field, message }] }`).

2. **Contrôleur `authController.js`**
   - `register(req, res)` :
     - Vérifier unicité `email` et `username` (retourner message clair « Cet e-mail est déjà utilisé » / « Ce nom d'utilisateur est déjà pris », pas une erreur Mongo brute).
     - Hacher le mot de passe avec `bcrypt.hash(password, saltRounds)` (saltRounds ≥ 10).
     - Créer le `User` avec `role: 'student'` forcé côté serveur (ignorer tout `role` envoyé dans le body, même si absent du formulaire — défense en profondeur).
     - Générer un JWT (voir étape 3) et le renvoyer (connexion automatique après inscription, cf. §5.2) avec les infos utilisateur (sans `passwordHash`).
   - `login(req, res)` :
     - Chercher l'utilisateur par `email` (`.select('+passwordHash')`).
     - Comparer avec `bcrypt.compare`.
     - **Message d'erreur générique** en cas d'échec (« E-mail ou mot de passe incorrect »), qu'il s'agisse d'un email inconnu ou d'un mauvais mot de passe — ne jamais révéler lequel des deux est faux (§5.3, sécurité anti-énumération).
     - Vérifier `isActive` (un compte désactivé par l'admin ne peut pas se connecter — message dédié).
     - Mettre à jour `lastLoginAt`.
     - Générer et renvoyer le JWT.
   - `logout(req, res)` : selon la stratégie de stockage choisie (voir étape 4), invalider côté serveur si liste de révocation utilisée, sinon simple `200 OK` (le client supprime son token).
   - `me(req, res)` : renvoie l'utilisateur courant (`req.user`, déjà injecté par le middleware `auth`), sans `passwordHash`.

3. **Génération / vérification JWT** (`services/tokenService.js` ou dans le contrôleur)
   - Payload minimal : `{ id, role }` (pas de données sensibles dans le token).
   - Signé avec `JWT_SECRET`, expiration `JWT_EXPIRES_IN` (§9.5).

4. **Stratégie de stockage du token côté client** — décision à prendre explicitement (le cahier des charges recommande httpOnly cookie ou en mémoire, §15) :
   - **Option recommandée** : cookie `httpOnly`, `secure` en prod, `sameSite: 'lax'|'strict'`, posé par le serveur à la connexion/inscription. `logout` efface le cookie (`res.clearCookie`). Nécessite `cors({ credentials: true })` (déjà en place, tâche 0.2) et le client configuré pour envoyer les cookies (`withCredentials: true` dans Axios).
   - **Option alternative** (plus simple à démarrer, moins sécurisée) : token renvoyé dans le corps de la réponse JSON, stocké en mémoire côté client (pas de `localStorage`, vulnérable au XSS).
   - Documenter le choix retenu dans le README technique — il conditionne la tâche 1.3 (Axios/AuthContext).

5. **Middleware `auth`** (`middlewares/auth.js`)
   - Lit le token (cookie ou header `Authorization: Bearer <token>` selon la stratégie choisie), vérifie sa validité (`jwt.verify`), charge l'utilisateur (`User.findById`), l'attache à `req.user`.
   - Renvoie `401` avec message français si token absent/invalide/expiré, ou si l'utilisateur associé n'existe plus / est désactivé.

6. **Middleware `role(...roles)`** (`middlewares/role.js`)
   - Factory : `role('admin')` ou `role('student', 'admin')`.
   - Renvoie `403` si `req.user.role` n'est pas dans la liste autorisée.

7. **Rate limiting dédié** (§15)
   - Appliquer un limiteur plus strict que le global (tâche 0.2) spécifiquement sur `/api/auth/login` et `/api/auth/register` pour limiter le brute-force.

8. **Montage des routes** (`routes/authRoutes.js`), montées sous `/api/auth` dans `app.js`.

## Fichiers à créer / modifier

```
server/src/
├── controllers/authController.js
├── routes/authRoutes.js
├── middlewares/auth.js
├── middlewares/role.js
├── services/tokenService.js       (génération/vérification JWT)
└── validators/authValidators.js   (règles express-validator)
```

## Modèles de données concernés

`User` (§10.1).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription (rôle `student` forcé). |
| POST | `/api/auth/login` | Connexion, renvoie JWT + infos user. |
| POST | `/api/auth/logout` | Déconnexion. |
| GET | `/api/auth/me` 🔒 | Utilisateur courant. |

## Règles métier / cas limites

- Le champ `role` envoyé par le client dans `register` doit être **ignoré**, jamais fait confiance.
- Message d'erreur de login toujours générique (pas de fuite d'info sur l'existence d'un compte).
- Un compte `isActive: false` ne peut pas se connecter, même avec le bon mot de passe.
- `passwordHash` ne doit jamais apparaître dans une réponse JSON, à aucun endpoint.
- Emails traités de façon insensible à la casse (`lowercase` sur le schéma, comparer en minuscule).

## Critères d'acceptation

- [ ] `POST /api/auth/register` avec des données valides crée un `student`, hache le mot de passe, renvoie un token/session valide.
- [ ] `POST /api/auth/register` avec un email déjà utilisé renvoie une erreur 4xx claire en français, sans créer de doublon.
- [ ] `POST /api/auth/login` avec un mauvais mot de passe et avec un email inconnu renvoient exactement le même message d'erreur.
- [ ] `POST /api/auth/login` sur un compte désactivé échoue avec un message dédié.
- [ ] `GET /api/auth/me` sans token renvoie `401` ; avec token valide renvoie l'utilisateur sans `passwordHash`.
- [ ] Une requête vers une route protégée par `role('admin')` avec un compte `student` renvoie `403`.
- [ ] Un token expiré est rejeté avec `401`.
- [ ] Les endpoints `login`/`register` sont soumis à un rate limit vérifiable (dépassement → `429`).
