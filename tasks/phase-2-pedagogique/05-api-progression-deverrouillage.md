# Tâche 2.5 — API Progression & logique de déverrouillage

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [01](01-api-modules-sous-modules.md), [02](02-api-lecons.md), [03](03-api-quiz.md), [04](04-api-exercices.md)
**Réfs cahier des charges :** §6.2.3 (logique de déverrouillage), §10.7, §10.8, §11.4, §13.3, §18.1

## Objectif

Implémenter les quatre endpoints qui font évoluer la progression d'un élève : marquer une leçon comme lue, soumettre un quiz (avec correction serveur), marquer un exercice comme résolu, et récupérer la progression globale de l'élève. C'est ici que vit la logique métier centrale de la plateforme.

## Contexte

Résumé exact de la logique attendue (§18.1 et §6.2.3) :
```
Leçon lue ──(clic « J'ai terminé »)──► Quiz débloqué
Quiz ──(score ≥ seuil)──────────────► Exercices débloqués
Exercices tous résolus ─────────────► Sous-module « terminé » (+ XP)
```

## Étapes détaillées

1. **`POST /api/progress/lesson/:subModuleId/complete`** 🔒
   - `upsert` du document `Progress` pour `(userId, subModuleId)` : créer s'il n'existe pas, sinon mettre à jour.
   - Positionner `lessonCompleted = true`.
   - Si `status` était `locked`, le passer à `in_progress` (le concept `locked` s'applique ici seulement si l'admin introduit plus tard une dépendance entre sous-modules — pour le MVP, voir la note de la tâche 2.1 : les sous-modules sont accessibles indépendamment, donc `status` part typiquement d'`in_progress` dès la première interaction).
   - Attribuer de l'XP (barème configurable, voir tâche 5.1 pour le détail du système) — appeler un service `xpService.award(userId, 'lesson_completed')`.
   - Idempotent : appeler deux fois ne doit pas dupliquer l'XP ni planter (vérifier l'état actuel avant d'attribuer l'XP une seconde fois).

2. **`POST /api/quiz/:quizId/submit`** 🔒
   - Charger le `Quiz` complet (avec `correctAnswers`, côté serveur uniquement).
   - Vérifier la limite de tentatives : si `maxAttempts > 0` et que le nombre de tentatives existantes ≥ `maxAttempts`, refuser (`403`) — **sauf** si on autorise de continuer à consulter mais pas resoumettre (comportement à clarifier avec le client si besoin, cf. [points-a-confirmer.md](../points-a-confirmer.md)).
   - Utiliser `gradeQuiz(quiz, answers)` (service créé en tâche 2.3) pour calculer `score` et `passed`.
   - Créer un `QuizAttempt` avec les réponses, le score, `passed`, `attemptedAt`.
   - Mettre à jour `Progress` : `quizBestScore = max(quizBestScore existant, score)` (« le meilleur score est conservé », §6.2.3). Si `passed`, positionner `quizPassed = true` (une fois vrai, ne jamais repasser à faux même si une tentative ultérieure échoue).
   - Si c'est la première fois que `quizPassed` passe à `true`, attribuer l'XP correspondant.
   - Renvoyer au client : `score`, `passed`, et la correction complète (bonnes réponses + explications) **maintenant que la tentative est soumise** — c'est le seul moment où ces informations peuvent être renvoyées (§6.2.3 : « À la fin : score affiché + correction »).

3. **`POST /api/exercises/:exerciseId/complete`** 🔒
   - Vérifier que le quiz du sous-module parent est bien réussi (même garde que tâche 2.4) avant d'accepter le marquage — un élève ne doit pas pouvoir marquer un exercice résolu sans y avoir légitimement accès.
   - Ajouter `exerciseId` à `Progress.exercisesCompleted` (éviter les doublons, ex. `$addToSet`).
   - **Recalculer si le sous-module est « terminé »** : comparer le nombre d'exercices dans `exercisesCompleted` au nombre total d'exercices du sous-module (`Exercise.countDocuments({ subModuleId })`). Si tous résolus **et** `lessonCompleted` **et** `quizPassed` : positionner `status = 'completed'`, `completedAt = now`, attribuer l'XP de complétion du sous-module (§18.1 « + XP »).
   - Attribuer aussi l'XP par exercice résolu (barème, tâche 5.1), une seule fois par exercice (idempotence via la vérification `$addToSet` — si déjà présent, ne pas réattribuer).

4. **`GET /api/progress/me`** 🔒
   - Renvoie une vue agrégée de la progression de l'élève courant, pensée pour alimenter directement l'overview (tâche 2.9) : progression globale (%), sous-modules terminés/total, quiz réussis + score moyen, exercices résolus (total), progression par module (liste `{ moduleId, title, progressPercent }`).
   - Réutiliser/étendre `services/progressService.js` créé en tâche 2.1 pour ne pas dupliquer les calculs.

## Fichiers à créer / modifier

```
server/src/
├── controllers/progressController.js
├── controllers/quizController.js       # ajout de submitQuiz (complète tâche 2.3)
├── controllers/exerciseController.js   # ajout de completeExercise (complète tâche 2.4)
├── routes/progressRoutes.js
├── services/progressService.js         # étendu
└── services/xpService.js               # award(userId, eventType)
```

## Modèles de données concernés

`Progress`, `QuizAttempt`, `Exercise`, `User` (champ `xp`) (§10.7, §10.8, §10.6, §10.1).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/progress/lesson/:subModuleId/complete` 🔒 | Marque la leçon comme lue (débloque le quiz). |
| POST | `/api/quiz/:quizId/submit` 🔒 | Soumet le quiz, calcule le score, débloque les exercices si réussi. |
| POST | `/api/exercises/:exerciseId/complete` 🔒 | Marque un exercice comme résolu. |
| GET | `/api/progress/me` 🔒 | Progression globale de l'élève. |

## Règles métier / cas limites

- `quizPassed`, une fois vrai, ne redevient jamais faux (même si l'élève repasse le quiz et échoue).
- `quizBestScore` ne peut que croître.
- Toutes ces routes doivent être **idempotentes ou tolérantes à la répétition** — un double-clic ou un retry réseau ne doit pas corrompre l'état ni dupliquer l'XP.
- La complétion d'un exercice sans quiz réussi préalable doit être refusée même si l'élève connaît directement l'`exerciseId` (sécurité, pas juste UX).
- Le calcul de `status: 'completed'` doit être **recalculé**, jamais mis à jour de façon incrémentale fragile (recalculer les 3 conditions à chaque changement pertinent évite les états incohérents).

## Critères d'acceptation

- [ ] Le parcours complet (compléter la leçon → soumettre le quiz avec succès → résoudre tous les exercices) amène `Progress.status` à `'completed'` et incrémente l'XP de l'utilisateur à chaque étape.
- [ ] Soumettre un quiz échoué ne débloque pas les exercices, et un appel direct à `complete` d'un exercice échoue tant que le quiz n'est pas réussi.
- [ ] Repasser un quiz déjà réussi avec un score plus faible garde `quizBestScore` inchangé et ne repasse pas `quizPassed` à faux.
- [ ] Dépasser `maxAttempts` (si non nul) bloque une nouvelle soumission avec un message clair.
- [ ] `GET /api/progress/me` renvoie des chiffres cohérents avec l'état réel de la base après plusieurs actions de test.
- [ ] Appeler deux fois `POST /api/progress/lesson/:subModuleId/complete` de suite n'attribue l'XP qu'une seule fois.
