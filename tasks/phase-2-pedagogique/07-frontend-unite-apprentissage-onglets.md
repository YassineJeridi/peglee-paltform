# Tâche 2.7 — Frontend : unité d'apprentissage (onglets Leçon / Quiz / Exercices)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [06-frontend-liste-modules-sous-modules.md](06-frontend-liste-modules-sous-modules.md), [phase-2-pedagogique/08-editeur-code-algorithme-python.md](08-editeur-code-algorithme-python.md) pour l'onglet Exercices (peut être développée en parallèle avec un éditeur texte simple en attendant, puis branchée)
**Réfs cahier des charges :** §6.2.3 (intégralement), §8.2, §8.3

## Objectif

Construire la page `/app/cours/:module/:sousModule` avec ses trois onglets (Tabs MUI) — Leçon, Quiz, Exercices — et toute la logique de déverrouillage visuel/fonctionnel côté client, synchronisée avec les règles serveur des tâches 2.2 à 2.5.

## Contexte

C'est la page la plus riche fonctionnellement du parcours élève. Elle doit gérer trois sous-vues avec des états très différents (contenu statique, questionnaire interactif, éditeur de code) tout en restant cohérente visuellement.

## Étapes détaillées

1. **Page conteneur** (`pages/student/SubModuleDetail.jsx`, route `/app/cours/:module/:sousModule`)
   - Récupère l'état de progression du sous-module (via `GET /api/modules/:id/submodules` déjà chargé, ou un appel dédié) pour savoir quels onglets activer.
   - `Tabs` MUI : « Leçon », « Quiz », « Exercices ».
   - L'onglet **Exercices** est désactivé visuellement (grisé + icône cadenas + tooltip explicatif, §12.4 « Éléments verrouillés clairement signalés ») tant que `quizPassed` est faux — **mais rappel : la vraie protection est côté serveur (tâche 2.4), ceci n'est qu'une aide UX**.
   - Fil d'ariane : Cours > [Module] > [Sous-module].

2. **Onglet Leçon** (`components/student/LessonTab.jsx`)
   - Récupère `GET /api/lessons/:subModuleId`.
   - Rend le contenu (Markdown/HTML selon le choix de la tâche 2.2) avec coloration syntaxique distincte pour les blocs de code **algorithme** (notation tunisienne, §8.3) et **Python**.
   - Bouton **« J'ai terminé la leçon »** → `POST /api/progress/lesson/:subModuleId/complete` → à la réussite, débloque visuellement l'onglet Quiz (mise à jour de l'état local de progression) et affiche une confirmation (snackbar, §12.4).
   - Si la leçon est déjà marquée lue, afficher le bouton dans un état « désactivé/déjà fait » plutôt que de permettre un nouveau clic sans effet.

3. **Onglet Quiz** (`components/student/QuizTab.jsx`)
   - Récupère `GET /api/quiz/:subModuleId`.
   - Affiche les questions selon leur `type` (QCM simple = radio, QCM multiple = checkboxes, vrai/faux = toggle, réponse courte = champ texte).
   - Bouton de soumission → `POST /api/quiz/:quizId/submit` avec les réponses de l'élève.
   - Affiche le résultat : score, réussi/échoué, **correction avec explications** (renvoyées seulement après soumission, cf. tâche 2.5).
   - Si `maxAttempts` atteint sans réussite : désactiver le bouton de nouvelle tentative avec message explicite.
   - Si déjà réussi précédemment : afficher le meilleur score et proposer « Repasser le quiz » (optionnel) plutôt que de forcer un nouvel essai.
   - À la réussite, débloque visuellement l'onglet Exercices.

4. **Onglet Exercices** (`components/student/ExercisesTab.jsx`)
   - Si `quizPassed` faux : afficher un état verrouillé explicite (pas d'appel API, ou appel qui échouera proprement en `403` avec message affiché).
   - Si débloqué : `GET /api/exercises/:subModuleId`, liste des exercices (≥2) avec énoncé, éditeur de code (tâche 2.8) préconfiguré selon `type` (`algorithme`/`python`), starter code si fourni.
   - Bouton **« Valider »** → `POST /api/exercises/:exerciseId/complete` (marquage manuel de résolution, MVP tel que défini §8.4).
   - Bouton **« Voir la solution »** → récupère et affiche la solution de référence (endpoint dédié, tâche 2.4) dans un panneau comparatif ou une modale.
   - Une fois tous les exercices résolus, afficher un état de félicitations / sous-module terminé (cohérent avec `Progress.status === 'completed'`).

## Fichiers à créer / modifier

```
client/src/
├── pages/student/SubModuleDetail.jsx
├── components/student/
│   ├── LessonTab.jsx
│   ├── QuizTab.jsx
│   ├── ExercisesTab.jsx
│   ├── QuizQuestion.jsx        # rendu d'une question selon son type
│   └── ExerciseCard.jsx
└── api/
    ├── lessonsApi.js
    ├── quizApi.js
    └── exercisesApi.js
```

## Endpoints API concernés

`GET /api/lessons/:subModuleId`, `GET /api/quiz/:subModuleId`, `POST /api/quiz/:quizId/submit`, `GET /api/exercises/:subModuleId`, `POST /api/exercises/:exerciseId/complete` (§11.3, §11.4).

## Règles métier / cas limites

- Ne jamais précharger les données de l'onglet Exercices tant que le quiz n'est pas réussi (évite un appel réseau inutile qui échouera systématiquement, et évite une fuite d'information sur la structure de la réponse d'erreur).
- Gérer explicitement le cas où l'appel à l'onglet Exercices échoue en `403` malgré l'affichage local « débloqué » (désynchronisation possible) — afficher le message serveur plutôt qu'un crash.
- Les réponses au quiz doivent être conservées localement pendant la saisie (état de formulaire) sans être envoyées avant clic explicite sur « Soumettre ».

## Critères d'acceptation

- [ ] Ouvrir un sous-module dont le quiz n'est pas réussi affiche l'onglet Exercices verrouillé avec explication.
- [ ] Terminer la leçon débloque immédiatement (sans rechargement de page) l'onglet Quiz.
- [ ] Réussir le quiz débloque immédiatement l'onglet Exercices et affiche la correction complète.
- [ ] Échouer le quiz affiche le score et la correction, mais garde les Exercices verrouillés.
- [ ] Résoudre tous les exercices d'un sous-module affiche un état de complétion cohérent avec le backend.
- [ ] « Voir la solution » n'est disponible qu'après déverrouillage des exercices.
