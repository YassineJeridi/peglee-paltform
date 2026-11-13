# Tâche 0.3 — Modèles Mongoose

**Phase :** 0 — Fondations
**Dépendances :** [02-configuration-backend-express.md](02-configuration-backend-express.md)
**Réfs cahier des charges :** §10 (Modèle de données MongoDB), §10.12 (relations)

## Objectif

Créer les 11 schémas Mongoose définis au §10, avec les bonnes contraintes (`required`, `unique`, `enum`, `ref`), `timestamps: true`, et les index nécessaires aux requêtes fréquentes.

## Contexte

Ce modèle de données sous-tend l'intégralité de la plateforme (pédagogie, progression, outils personnels). Le créer correctement dès maintenant évite des migrations douloureuses plus tard. Chaque modèle correspond à une sous-section du §10 du cahier des charges — s'y référer pour les champs exacts.

## Étapes détaillées

Créer un fichier par modèle dans `server/src/models/`, chacun exportant un modèle Mongoose (`mongoose.model('Nom', schema)`). Pour chacun, appliquer `{ timestamps: true }` dans les options de schéma.

1. **`User.js`** (§10.1) — `username` (String, unique, required, trim), `email` (String, unique, required, lowercase, match regex email), `passwordHash` (String, required, `select: false` recommandé pour ne jamais le renvoyer par défaut), `role` (String, enum `['student','admin']`, default `'student'`), `profilePicture` (String), `isActive` (Boolean, default `true`), `xp` (Number, default `0`), `level` (Number, default `1`), `lastLoginAt` (Date).
2. **`Module.js`** (§10.2) — `title`, `slug` (unique, index), `description`, `icon`, `color`, `order` (Number).
3. **`SubModule.js`** (§10.3) — `moduleId` (ObjectId, ref `Module`, required, index), `title`, `description`, `order`, `estimatedDuration` (Number, optionnel).
4. **`Lesson.js`** (§10.4) — `subModuleId` (ObjectId, ref `SubModule`, required, **unique** car 1 leçon par sous-module), `title`, `content` (String, riche), `videoUrl`, `attachments` ([String]).
5. **`Quiz.js`** (§10.5) — `subModuleId` (ObjectId, ref `SubModule`, required, unique), `title`, `passingScore` (Number, default 60), `maxAttempts` (Number, default 0 = illimité), `questions` : sous-document array avec `text`, `type` (enum `['single','multiple','boolean','short']`), `options` ([String]), `correctAnswers` (Mixed/array — indices pour QCM, chaîne pour réponse courte), `explanation`, `points` (Number, default 1).
6. **`Exercise.js`** (§10.6) — `subModuleId` (ObjectId, ref `SubModule`, required, index — **plusieurs** exercices par sous-module, donc pas unique), `title`, `statement`, `type` (enum `['algorithme','python']`), `starterCode`, `solution`, `difficulty` (enum `['facile','moyen','difficile']`), `order`, `tests` (array `{ input, expectedOutput }`, optionnel V2).
7. **`Progress.js`** (§10.7) — `userId` (ObjectId, ref `User`, required, index), `subModuleId` (ObjectId, ref `SubModule`, required, index), `lessonCompleted` (Boolean, default false), `quizPassed` (Boolean, default false), `quizBestScore` (Number, default 0), `exercisesCompleted` ([ObjectId], ref `Exercise`), `status` (enum `['locked','in_progress','completed']`, default `'locked'`), `completedAt` (Date). **Index composé unique** sur `{ userId, subModuleId }` (un seul document de progression par élève/sous-module).
8. **`QuizAttempt.js`** (§10.8) — `userId` (ObjectId, ref `User`, required, index), `quizId` (ObjectId, ref `Quiz`, required, index), `answers` ([Mixed]), `score` (Number), `passed` (Boolean), `attemptedAt` (Date, default `Date.now`).
9. **`Task.js`** (Kanban, §10.9) — `userId` (ObjectId, ref `User`, required, index), `title`, `description`, `status` (enum `['todo','doing','done']`, default `'todo'`), `priority` (enum `['low','medium','high']`, default `'medium'`), `dueDate`, `color`, `order` (Number).
10. **`Note.js`** (§10.10) — `userId` (ObjectId, ref `User`, required, index), `content`, `color`, `pinned` (Boolean, default false).
11. **`Event.js`** (Calendrier, §10.11) — `userId` (ObjectId, ref `User`, required, index), `title`, `description`, `start` (Date, required), `end` (Date, required), `type` (enum `['revision','quiz','examen','personnel']`), `color`.

Créer aussi un `server/src/models/index.js` optionnel qui réexporte tous les modèles pour des imports plus courts ailleurs.

## Fichiers à créer / modifier

```
server/src/models/
├── User.js
├── Module.js
├── SubModule.js
├── Lesson.js
├── Quiz.js
├── Exercise.js
├── Progress.js
├── QuizAttempt.js
├── Task.js
├── Note.js
├── Event.js
└── index.js
```

## Modèles de données concernés

Tous (§10.1 à §10.11). Relations résumées au §10.12 :
```
User 1─* Progress *─1 SubModule
Module 1─* SubModule 1─1 Lesson
SubModule 1─1 Quiz
SubModule 1─* Exercise
User 1─* Task / Note / Event / QuizAttempt
```

## Règles métier / cas limites

- `passwordHash` ne doit **jamais** être renvoyé dans une réponse API par défaut (`select: false` + `.select('+passwordHash')` explicite uniquement pour la vérification de connexion).
- Les index `unique` sur `email`, `username`, `slug` doivent être testés (tentative de doublon → erreur Mongoose `E11000` à transformer en message utilisateur clair par le contrôleur, cf. Phase 1).
- L'index composé `{ userId, subModuleId }` unique sur `Progress` est essentiel pour éviter les doublons de progression.
- Prévoir des index simples sur les champs `userId` de `Task`, `Note`, `Event`, `QuizAttempt` pour les requêtes filtrées (performance, §14).

## Critères d'acceptation

- [ ] Les 11 modèles se chargent sans erreur (`require`/`import` de chacun dans un script de test rapide).
- [ ] Une tentative de création de deux `User` avec le même `email` échoue avec une erreur de duplication.
- [ ] Une tentative de création de deux `Progress` avec le même couple `(userId, subModuleId)` échoue.
- [ ] Une tentative de création de deux `Lesson` ou deux `Quiz` pour le même `subModuleId` échoue (contrainte 1-1).
- [ ] Les enums (`role`, `status`, `priority`, `type`, `difficulty`) rejettent une valeur hors liste.
