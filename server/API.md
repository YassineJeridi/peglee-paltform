# API — Plateforme « Bac Informatique »

Base URL : `http://localhost:5001/api` (configurable via `PORT`, voir [.env.example](.env.example)).

Légende :
- 🔒 requiert un JWT valide (en-tête `Authorization: Bearer <token>`).
- 👑 requiert en plus le rôle `admin`.
- Sans pictogramme : route publique.

Toutes les routes sous `/api` (hors `/api/health`) passent par un rate-limiter global
(300 req / 15 min / IP) ; `/api/auth/register` et `/api/auth/login` ont en plus une
limite dédiée plus stricte (10 req / 15 min / IP). Ces limites sont désactivées quand
`NODE_ENV=test` (voir [tests/](tests)).

Les erreurs suivent toutes le même format :
```json
{ "message": "Description lisible.", "errors": [{ "field": "email", "message": "..." }] }
```
(`errors` n'est présent que pour les erreurs de validation, HTTP 400/409/422.)

---

## Santé

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérifie que l'API répond (`{ status: 'ok' }`). |

## Authentification

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription (toujours rôle `student`). Body : `{ username, email, password, confirmPassword }`. |
| POST | `/api/auth/login` | Connexion. Body : `{ email, password }`. Renvoie `{ token, user }`. |
| POST | `/api/auth/logout` | Déconnexion côté client uniquement (stratégie stateless, voir [README](../README.md)). |
| GET | `/api/auth/me` 🔒 | Utilisateur courant. |

## Profil (utilisateur courant)

| Méthode | Route | Description |
|---|---|---|
| PUT | `/api/users/me` 🔒 | Modifie `username` et/ou `email` (vérifie l'unicité). |
| PUT | `/api/users/me/password` 🔒 | Change le mot de passe. Body : `{ currentPassword, newPassword, confirmNewPassword }`. |
| POST | `/api/users/me/avatar` 🔒 | Upload d'un avatar (`multipart/form-data`, champ `avatar`). Signature binaire du fichier vérifiée côté serveur (JPG/PNG/WEBP). |

## Gestion des utilisateurs (admin)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users` 👑 | Liste paginée. Query : `search, role, isActive, page, pageSize, sortBy, sortOrder`. |
| GET | `/api/users/:id` 👑 | Détail d'un utilisateur + progression s'il est `student`. |
| POST | `/api/users` 👑 | Crée un utilisateur (élève ou admin). Body : `{ username, email, password, role?, isActive? }`. |
| PUT | `/api/users/:id` 👑 | Modifie `username/email/role/isActive`. Refuse de rétrograder le dernier admin restant. |
| DELETE | `/api/users/:id` 👑 | Supprime l'utilisateur et ses données associées (tâches, notes, événements, progressions, tentatives de quiz). |
| POST | `/api/users/:id/reset-password` 👑 | Génère un mot de passe temporaire et le renvoie une seule fois dans la réponse (`{ temporaryPassword }`). |

## Contenu pédagogique — Modules & sous-modules

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/modules` 🔒 | Liste des modules, avec `progressPercent` pour l'élève courant. |
| GET | `/api/modules/:id/submodules` 🔒 | Sous-modules d'un module, avec statut de progression (`locked/in_progress/completed`, `lessonCompleted`, `quizPassed`, `exercisesCompleted/Total`). |
| POST | `/api/modules` 👑 | Crée un module. Body : `{ title, slug?, description?, icon?, color?, order? }` (slug auto-généré si omis). |
| PUT | `/api/modules/reorder` 👑 | Réordonne plusieurs modules. Body : `{ items: [{ id, order }] }`. |
| PUT | `/api/modules/:id` 👑 | Modifie un module. |
| DELETE | `/api/modules/:id` 👑 | Supprime un module (refusé s'il contient encore des sous-modules). |
| POST | `/api/submodules` 👑 | Crée un sous-module. Body : `{ moduleId, title, description?, order?, estimatedDuration? }`. |
| PUT | `/api/submodules/reorder` 👑 | Réordonne plusieurs sous-modules. Body : `{ items: [{ id, order }] }`. |
| PUT | `/api/submodules/:id` 👑 | Modifie un sous-module (peut le déplacer vers un autre module). |
| DELETE | `/api/submodules/:id` 👑 | Supprime un sous-module (refusé s'il a encore une leçon, un quiz ou des exercices). |

## Contenu pédagogique — Leçons

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/lessons/:subModuleId` 🔒 | Leçon d'un sous-module. |
| POST | `/api/lessons` 👑 | Crée la leçon d'un sous-module (relation 1-1). Body : `{ subModuleId, title, content?, videoUrl?, attachments? }`. |
| PUT | `/api/lessons/:id` 👑 | Modifie une leçon. |
| DELETE | `/api/lessons/:id` 👑 | Supprime une leçon. |

## Contenu pédagogique — Quiz

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/quiz/:subModuleId` 🔒 | Quiz d'un sous-module côté élève — **ne renvoie jamais** `correctAnswers`/`explanation`. Inclut `attemptsCount`, `attemptsRemaining`, `bestScore`. |
| GET | `/api/quiz/manage/:subModuleId` 👑 | Quiz complet (avec réponses) pour l'édition admin. |
| POST | `/api/quiz/:quizId/submit` 🔒 | Soumet des réponses. Body : `{ answers: [{ questionId, answer }] }`. Correction calculée côté serveur ; renvoie score, `passed`, correction détaillée, `leveledUp`. `403` si le nombre maximal de tentatives est atteint. |
| POST | `/api/quiz` 👑 | Crée le quiz d'un sous-module (relation 1-1). Body : `{ subModuleId, title, passingScore?, maxAttempts?, questions }`. |
| PUT | `/api/quiz/:id` 👑 | Modifie un quiz (remplace entièrement `questions` si fourni). |
| DELETE | `/api/quiz/:id` 👑 | Supprime un quiz (conserve l'historique des tentatives déjà enregistrées). |

## Contenu pédagogique — Exercices

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/exercises/:subModuleId` 🔒 | Exercices d'un sous-module — `403` si le quiz du sous-module n'est pas encore réussi. Ne renvoie jamais `solution`. |
| GET | `/api/exercises/manage/:subModuleId` 👑 | Exercices complets (avec `solution`) pour l'édition admin. |
| GET | `/api/exercises/:exerciseId/solution` 🔒 | Solution d'un exercice — même garde `quizPassed` que ci-dessus. |
| POST | `/api/exercises/:exerciseId/complete` 🔒 | Marque un exercice comme résolu ; complète le sous-module (et attribue le bonus XP correspondant) si c'était le dernier. |
| POST | `/api/exercises` 👑 | Crée un exercice. Body : `{ subModuleId, title, statement, type: 'algorithme'|'python', starterCode?, solution?, difficulty?, order? }`. |
| PUT | `/api/exercises/:id` 👑 | Modifie un exercice. |
| DELETE | `/api/exercises/:id` 👑 | Supprime un exercice (retire la référence chez les élèves l'ayant déjà résolu, recalcule leur statut de complétion). |

## Progression & XP

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/progress/lesson/:subModuleId/complete` 🔒 | Marque la leçon d'un sous-module comme lue (débloque le quiz) et attribue l'XP correspondant. |
| GET | `/api/progress/me` 🔒 | Vue d'ensemble de la progression de l'élève courant (modules, quiz, exercices, XP/niveau, activité récente) — alimente `/app/overview`. |
| GET | `/api/progress/me/activity` 🔒 | Série temporelle de l'activité de quiz. Query : `period=week\|month` (défaut `week`). |

## Outils personnels (élève courant, isolation stricte par `userId`)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/tasks` 🔒 | Liste des tâches Kanban de l'élève. |
| POST | `/api/tasks` 🔒 | Crée une tâche. Body : `{ title, description?, status?, priority?, dueDate?, color?, order? }`. |
| PUT | `/api/tasks/:id` 🔒 | Modifie une tâche (`404` si elle n'appartient pas à l'élève). |
| DELETE | `/api/tasks/:id` 🔒 | Supprime une tâche (`404` si elle n'appartient pas à l'élève). |
| GET | `/api/notes` 🔒 | Liste des notes autocollantes de l'élève. |
| POST | `/api/notes` 🔒 | Crée une note. Body : `{ content?, color? }`. |
| PUT | `/api/notes/:id` 🔒 | Modifie une note (`404` si elle n'appartient pas à l'élève). |
| DELETE | `/api/notes/:id` 🔒 | Supprime une note (`404` si elle n'appartient pas à l'élève). |
| GET | `/api/events` 🔒 | Liste des événements du calendrier. Query : `start & end` (chevauchement de plage) ou `upcoming=true&limit=` (prochains événements). |
| POST | `/api/events` 🔒 | Crée un événement. Body : `{ title, description?, start, end, type?, color? }`. |
| PUT | `/api/events/:id` 🔒 | Modifie un événement (`404` si il n'appartient pas à l'élève). |
| DELETE | `/api/events/:id` 🔒 | Supprime un événement (`404` si il n'appartient pas à l'élève). |

## Administration — Statistiques & paramètres

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` 👑 | KPIs globaux (totaux, taux de réussite, élèves actifs, séries temporelles, répartition par module) pour `/admin/overview`. |
| GET | `/api/admin/settings` 👑 | Réglages généraux de la plateforme (seuil de réussite et tentatives par défaut, feature flags). |
| PUT | `/api/admin/settings` 👑 | Modifie les réglages généraux. Body : `{ defaultPassingScore?, defaultMaxAttempts?, features? }`. |

---

## Fichiers statiques

| Route | Description |
|---|---|
| GET | `/uploads/avatars/:filename` | Sert les avatars uploadés (fichiers statiques, pas de JSON). |

## Notes de sécurité (voir [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md))

- Les endpoints élève (`getQuiz`, `getExercises`) ne renvoient jamais les bonnes
  réponses / solutions ; ces champs ne sont exposés que par les endpoints `manage/*`
  et `getExerciseSolution` (elle-même protégée par `quizPassed`).
- Les endpoints de tâches/notes/événements renvoient `404` (pas `403`) quand la
  ressource appartient à un autre utilisateur, pour ne pas révéler son existence.
- `userId` n'est jamais lu depuis le corps de la requête pour ces ressources
  personnelles : toujours pris de `req.user.id` (issu du JWT vérifié).

---

## Évolutions V2 (Phase 6) et import

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/forgot-password` | public (limité 5/h) | `{ email }` → réponse identique que le compte existe ou non. Envoie un lien à usage unique (1 h). |
| POST | `/api/auth/reset-password` | public | `{ token, newPassword, confirmNewPassword }` → 400 si jeton invalide/expiré/déjà utilisé. |
| POST | `/api/exercises/:exerciseId/run` | élève (quiz réussi) | `{ code }` → `{ allPassed, results: [{ input, expected, actual, passed, timedOut, error }] }`. Exercices Python avec `tests` uniquement. 503 si `CODE_ENGINE=disabled`. |
| POST | `/api/exercises/:id/run-solution` | admin | Exécute la solution de référence contre les tests (contrôle qualité). |
| GET | `/api/notifications` | auth | `{ unreadCount, items }` (non lues d'abord). Génère les rappels d'événements < 24 h. |
| PUT | `/api/notifications/:id/read` | auth | Marque une notification comme lue. |
| PUT | `/api/notifications/read-all` | auth | Tout marquer comme lu. |
| GET | `/api/badges/me` | auth | Catalogue des badges actifs avec `earned` / `earnedAt`. |
| GET | `/api/badges/manage` | admin | Tous les badges. |
| POST / PUT / DELETE | `/api/badges[/:id]` | admin | CRUD badges (`criteria: { type, value, moduleSlug }`). |
| GET | `/api/admin/import/template` | admin | Télécharge le modèle JSON d'import. |
| POST | `/api/admin/import?dryRun=true\|false` | admin | `multipart/form-data`, champ `file` (.json ≤ 2 Mo). `dryRun=true` : validation seule. 422 + `errors[{path,message}]` si invalide (rien n'est écrit). Format : [../docs/IMPORT_FORMAT.md](../docs/IMPORT_FORMAT.md). |

Les exercices admin (`POST/PUT /api/exercises`) acceptent désormais `tests: [{ input, expectedOutput }]` (20 max).
