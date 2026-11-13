# Phase 2 — Cœur pédagogique (espace étudiant)

**Réfs cahier des charges :** §16 (Phase 2), §6.1, §6.2, §8, §10, §11.3, §11.4, §13.1.

## Objectif de la phase

C'est le cœur fonctionnel de la plateforme : le parcours **Module → Sous-module → (Leçon → Quiz → Exercices)** avec la logique de déverrouillage progressif, la notation algorithmique tunisienne, l'éditeur de code, le suivi de progression, et l'overview étudiant avec ses KPIs. À la fin de cette phase, un élève peut suivre un module de bout en bout et voir sa progression se refléter dans son tableau de bord.

## Prérequis

Phase 1 terminée (authentification, layouts, routes protégées). Le seed de la Phase 0 doit fournir au moins un module avec des sous-modules complets pour pouvoir tester.

## Tâches de la phase (ordre recommandé)

**Backend d'abord (1 → 5), frontend ensuite (6 → 9), car le frontend consomme ces API :**

1. [01-api-modules-sous-modules.md](01-api-modules-sous-modules.md) — Lecture des modules/sous-modules (+ statut de progression pour l'élève).
2. [02-api-lecons.md](02-api-lecons.md) — Lecture d'une leçon.
3. [03-api-quiz.md](03-api-quiz.md) — Lecture d'un quiz (sans les réponses) + logique de correction serveur.
4. [04-api-exercices.md](04-api-exercices.md) — Lecture des exercices (verrouillés côté serveur si quiz non réussi).
5. [05-api-progression-deverrouillage.md](05-api-progression-deverrouillage.md) — Endpoints de progression : leçon terminée, soumission de quiz, exercice résolu, `progress/me`. **C'est le cœur de la logique métier de la plateforme.**
6. [06-frontend-liste-modules-sous-modules.md](06-frontend-liste-modules-sous-modules.md) — Pages `/app/cours` et `/app/cours/:module`.
7. [07-frontend-unite-apprentissage-onglets.md](07-frontend-unite-apprentissage-onglets.md) — Page `/app/cours/:module/:sousModule` avec les 3 onglets et la logique de verrouillage visuel.
8. [08-editeur-code-algorithme-python.md](08-editeur-code-algorithme-python.md) — Éditeur de code intégré (Monaco/CodeMirror), mode Algorithme + mode Python.
9. [09-frontend-overview-etudiant.md](09-frontend-overview-etudiant.md) — Page `/app/overview` (KPIs, graphiques, niveau, progression par module, échéances, activité récente).

## Definition of done de la phase

- [ ] Un élève voit la liste des modules avec leur progression réelle, ouvre un module et voit ses sous-modules avec leur statut (verrouillé/en cours/terminé).
- [ ] Dans une unité d'apprentissage, l'onglet Exercices est visuellement et **fonctionnellement** verrouillé (refusé côté serveur) tant que le quiz n'est pas réussi.
- [ ] Terminer la leçon débloque le quiz ; réussir le quiz (score ≥ seuil) débloque les exercices ; résoudre tous les exercices marque le sous-module « terminé ».
- [ ] Le quiz ne renvoie jamais les bonnes réponses au client avant soumission ; la correction est calculée côté serveur.
- [ ] L'éditeur de code propose un mode adapté à la notation algorithmique tunisienne et un mode Python.
- [ ] L'overview étudiant affiche des données réelles issues de `/api/progress/me`, pas des données statiques.
