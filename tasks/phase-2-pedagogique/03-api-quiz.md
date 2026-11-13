# Tâche 2.3 — API Quiz (lecture élève, sans les réponses)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [02-api-lecons.md](02-api-lecons.md)
**Réfs cahier des charges :** §6.2.3 (onglet Quiz), §10.5, §10.8, §11.3, §11.4, §11.6 (note de sécurité), §15

## Objectif

Implémenter `GET /api/quiz/:subModuleId`, qui renvoie les questions du quiz **sans jamais exposer les bonnes réponses**. La soumission et la correction (`POST /api/quiz/:quizId/submit`) sont traitées dans la tâche 2.5 (logique de progression), mais la structure de lecture est posée ici.

## Contexte

Le cahier des charges insiste à deux reprises (§11.6 et §15) : « l'endpoint de récupération du quiz côté élève ne renvoie jamais les bonnes réponses ; la correction est calculée côté serveur à la soumission ». C'est une exigence de sécurité non négociable — la contourner rendrait triviale la triche côté client (lire les réponses dans les DevTools réseau).

## Étapes détaillées

1. **`GET /api/quiz/:subModuleId`** 🔒
   - Cherche le `Quiz` par `subModuleId`. `404` si absent.
   - Construit une version **filtrée** de la réponse : pour chaque question, exclure `correctAnswers` et `explanation` (l'explication ne doit être visible qu'**après** soumission, cf. §6.2.3 « À la fin : score affiché + correction (explications) »).
   - Champs renvoyés par question : `_id`, `text`, `type`, `options`, `points`.
   - Renvoyer aussi `passingScore` et `maxAttempts` (utiles pour l'affichage côté client : « seuil de réussite : 60 % », « tentatives restantes »).
   - Renvoyer également le nombre de tentatives déjà effectuées par l'élève courant (`QuizAttempt.countDocuments({ userId, quizId })`) et le meilleur score déjà obtenu (via `Progress.quizBestScore`), pour permettre au frontend d'afficher l'historique et de désactiver le bouton si `maxAttempts` est atteint.

2. **Helper de correction** (`services/quizService.js`) — **créé ici mais utilisé par la tâche 2.5** :
   - Fonction pure `gradeQuiz(quiz, answers)` qui, pour chaque question, compare la réponse de l'élève à `correctAnswers` selon le `type` (`single`, `multiple`, `boolean`, `short` — pour `short`, comparaison insensible à la casse/espaces en trop, éventuellement normalisation), calcule les points obtenus, le score total en %, et si `score >= passingScore`.
   - Isoler cette logique dans un service pur (sans accès DB direct) la rend testable unitairement — important puisqu'elle porte la règle métier la plus critique du produit (§6.2.3, §18.1).

## Fichiers à créer / modifier

```
server/src/
├── controllers/quizController.js    # getQuiz (lecture) ici ; submitQuiz ajouté en tâche 2.5
├── routes/quizRoutes.js
└── services/quizService.js          # gradeQuiz(quiz, answers)
```

## Modèles de données concernés

`Quiz`, `QuizAttempt`, `Progress` (§10.5, §10.8, §10.7).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/quiz/:subModuleId` 🔒 | Quiz (sans les bonnes réponses côté élève). |

## Règles métier / cas limites

- **Aucun champ `correctAnswers` ni `explanation` ne doit apparaître dans la réponse JSON de cet endpoint** — vérifier explicitement en inspectant la réponse réseau, pas seulement en relisant le code.
- Si `maxAttempts > 0` et que l'élève l'a atteint sans avoir réussi, l'information doit être renvoyée pour que le frontend désactive le bouton « Repasser le quiz » — mais l'endpoint de lecture reste accessible (l'élève doit pouvoir revoir les questions même sans pouvoir soumettre).

## Critères d'acceptation

- [ ] La réponse JSON de `GET /api/quiz/:subModuleId` ne contient, sous aucun champ, ni les bonnes réponses ni les explications.
- [ ] Le seuil de réussite et le nombre de tentatives sont bien exposés.
- [ ] `gradeQuiz` correctement testé (manuellement ou via test unitaire) sur au moins un cas de chaque type de question (`single`, `multiple`, `boolean`, `short`).
- [ ] Un `subModuleId` sans quiz associé renvoie `404`.
