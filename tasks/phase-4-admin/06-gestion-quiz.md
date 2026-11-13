# Tâche 4.6 — Gestion des quiz (`/admin/quiz`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [04-gestion-modules-sous-modules.md](04-gestion-modules-sous-modules.md), [phase-2-pedagogique/03-api-quiz.md](../phase-2-pedagogique/03-api-quiz.md)
**Réfs cahier des charges :** §7.5, §10.5, §11.3, points-a-confirmer.md #2/#3

## Objectif

CRUD complet des quiz et de leurs questions côté API, et interface d'administration permettant de définir le quiz d'un sous-module, ses questions (avec bonnes réponses et explications), son seuil de réussite et son nombre de tentatives autorisées.

## Contexte

Le §7.5 précise : « un quiz par sous-module », questions avec « énoncé, type (QCM à choix unique/multiple, vrai-faux, réponse courte), options de réponse, bonne(s) réponse(s), explication, points ». C'est ici, et seulement ici, que les bonnes réponses sont saisies et modifiables — elles ne doivent jamais transiter vers un contexte élève (cf. tâche 2.3).

## Étapes détaillées — Backend

1. **`POST /api/quiz`** 👑 — création (`subModuleId`, `title`, `passingScore`, `maxAttempts`, `questions` initiales ou vide). Contrainte 1-1 avec `subModuleId` (comme les leçons) — proposer la modification si un quiz existe déjà.
2. **`PUT /api/quiz/:id`** 👑 — édition globale (titre, `passingScore`, `maxAttempts`) et gestion des questions : soit un remplacement complet du tableau `questions` à chaque sauvegarde (plus simple), soit des sous-endpoints dédiés pour ajouter/modifier/supprimer une question individuellement (`POST/PUT/DELETE /api/quiz/:id/questions/:questionId`) — choisir selon la complexité de l'UI retenue ; le remplacement complet du tableau à la sauvegarde du formulaire est suffisant pour un MVP et plus simple à raisonner.
3. **`DELETE /api/quiz/:id`** 👑 — suppression. Réfléchir à l'impact sur les `QuizAttempt` existants (les conserver comme historique même après suppression du quiz, ou les supprimer en cascade — la conservation est recommandée pour ne pas perdre l'historique de progression des élèves).
4. **Validation métier à la sauvegarde** :
   - Pour les questions `single`/`boolean` : exactement une bonne réponse.
   - Pour les questions `multiple` : au moins une bonne réponse.
   - `passingScore` entre 0 et 100.
   - `maxAttempts` ≥ 0.
   - Chaque question doit avoir au moins une option pour les types QCM.

## Étapes détaillées — Frontend

1. **Service API** (`api/adminQuizApi.js`).
2. **Page `AdminQuiz.jsx`** (`pages/admin/AdminQuiz.jsx`, route `/admin/quiz`)
   - Sélection du sous-module concerné.
   - Champs globaux : `title`, `passingScore` (slider ou champ numérique %, valeur par défaut 60 — cf. [points-a-confirmer.md](../points-a-confirmer.md) #2), `maxAttempts` (0 = illimité par défaut, cf. #3).
   - **Éditeur de questions** : liste réordonnable de questions, chacune avec :
     - `text` (énoncé), `type` (sélecteur), `options` (liste éditable pour les types QCM), sélection de la/des bonne(s) réponse(s) (radio pour `single`/`boolean`, checkboxes pour `multiple`, champ texte attendu pour `short`), `explanation`, `points`.
     - Ajout/suppression de questions dynamique.
   - Bouton de prévisualisation (rendu tel que vu par l'élève, **sans** les bonnes réponses visibles, pour vérifier l'expérience réelle — réutiliser `QuizTab` de la tâche 2.7 en mode aperçu).

## Fichiers à créer / modifier

```
server/src/
├── controllers/quizController.js     # étendu (CRUD complet, en plus de getQuiz/submitQuiz de la Phase 2)
├── routes/quizRoutes.js              # étendu avec role('admin') sur les routes d'écriture
└── validators/quizValidators.js      # règles de validation métier des questions

client/src/
├── api/adminQuizApi.js
├── pages/admin/AdminQuiz.jsx
└── components/admin/
    └── QuestionEditor.jsx
```

## Modèles de données concernés

`Quiz`, `QuizAttempt` (§10.5, §10.8).

## Endpoints API concernés

`POST/PUT/DELETE /api/quiz` 👑 (§11.3).

## Règles métier / cas limites

- Un sous-module ne peut avoir qu'un seul quiz.
- Les bonnes réponses saisies ici ne doivent **jamais** transiter par l'endpoint de lecture élève (`GET /api/quiz/:subModuleId`, tâche 2.3) — vérifier qu'aucune régression n'est introduite en réutilisant par erreur le même sérialiseur des deux côtés.
- Modifier un quiz déjà tenté par des élèves ne doit pas corrompre l'historique des `QuizAttempt` passés (ils gardent le score obtenu au moment de la tentative, même si les questions changent après coup).

## Critères d'acceptation

- [ ] Créer un quiz avec plusieurs types de questions fonctionne et le quiz devient immédiatement jouable côté élève.
- [ ] Modifier le seuil de réussite ou le nombre de tentatives se reflète dans le comportement de soumission côté élève (tâche 2.5).
- [ ] La validation refuse une question QCM sans bonne réponse définie.
- [ ] La prévisualisation admin n'affiche jamais les bonnes réponses avant soumission simulée.
- [ ] Toute tentative d'écriture par un compte `student` échoue en `403`.
