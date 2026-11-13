# Tâche 2.9 — Frontend : Vue d'ensemble étudiant (`/app/overview`)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [05-api-progression-deverrouillage.md](05-api-progression-deverrouillage.md) (`GET /api/progress/me`)
**Réfs cahier des charges :** §6.1, §13.1, §13.3

## Objectif

Construire le tableau de bord d'accueil de l'élève avec les 6 groupes de composants décrits au §6.1, alimentés par des données réelles.

## Contexte

C'est la première page vue par un élève après connexion — elle doit donner un aperçu synthétique et motivant de sa progression, à la manière des maquettes de référence citées au §1.3.

## Étapes détaillées

Chaque numéro correspond à un composant du §6.1 :

1. **Cartes de KPI** (4 cartes en haut) — `components/student/KpiCard.jsx`, réutilisé 4 fois :
   - Progression globale (%).
   - Sous-modules terminés / total.
   - Quiz réussis + score moyen.
   - Exercices résolus.
   - Données issues de `GET /api/progress/me` (tâche 2.5).

2. **Graphique de performance** — évolution du score/activité dans le temps, avec sélecteur de période (hebdomadaire/mensuel). Utiliser `@mui/x-charts` ou `recharts` (§9.2). **Note d'implémentation** : le modèle `QuizAttempt` (§10.8, avec `attemptedAt`) est la source la plus naturelle pour une série temporelle de scores ; si l'API `progress/me` ne renvoie pas encore cette série, étendre l'endpoint (ou en créer un dédié `GET /api/progress/me/activity?period=week|month`) plutôt que d'agréger côté client des données non prévues pour ça.

3. **Niveau d'amélioration** — niveau actuel + barre de progression vers le niveau suivant, basé sur `User.xp`/`User.level` (§13.3, détaillé en Phase 5 tâche 5.1 pour le calcul exact des paliers ; ici, consommer les champs déjà exposés par `/api/auth/me` ou `/api/progress/me`).

4. **Progression par module** — barres de progression par module (ex. Algorithmique 60 %, STI 30 %), issues du tableau `progressPerModule` de `GET /api/progress/me` (tâche 2.5).

5. **Prochaines échéances / planning** — extrait du calendrier (prochains événements). **Dépendance croisée avec la Phase 3** (`GET /api/events`, tâche 3.3) — si la Phase 3 n'est pas encore développée, prévoir ce composant avec un état vide gracieux, à brancher réellement une fois `/api/events` disponible.

6. **Activité récente** — dernières leçons vues, quiz passés, exercices résolus. Peut être dérivé de `Progress.completedAt`, `QuizAttempt.attemptedAt`, ou nécessiter un petit flux d'événements dédié côté serveur si la vue agrégée devient trop complexe à requêter à la volée — décision d'implémentation à prendre selon la complexité réelle constatée (commencer simple : trier les `QuizAttempt` récents + `Progress` récemment mis à jour).

## Fichiers à créer / modifier

```
client/src/
├── pages/student/Overview.jsx
├── components/student/
│   ├── KpiCard.jsx
│   ├── PerformanceChart.jsx
│   ├── LevelProgress.jsx
│   ├── ModuleProgressList.jsx
│   ├── UpcomingEvents.jsx
│   └── RecentActivity.jsx
└── api/progressApi.js
```

## Endpoints API concernés

`GET /api/progress/me` (§11.4), `GET /api/events` (§11.5, dépendance Phase 3 pour les échéances), `GET /api/auth/me` (§11.1, pour XP/niveau).

## Règles métier / cas limites

- Un élève tout juste inscrit (aucune progression) doit voir une page cohérente avec des états à 0 %, pas des erreurs ou des graphiques cassés — tester explicitement ce cas.
- Les états de chargement (skeletons) sont importants ici car plusieurs appels réseau composent la page (§12.4).

## Critères d'acceptation

- [ ] Les 4 KPI affichent des valeurs cohérentes avec l'état réel de la base pour un élève de test.
- [ ] Le graphique de performance change bien de granularité selon le sélecteur de période.
- [ ] La progression par module reflète fidèlement les modules réellement présents (pas hardcodés Algorithmique/STI si d'autres modules existent).
- [ ] Un élève sans aucune activité voit une page propre (0 %, états vides), sans erreur console.
- [ ] Le niveau/XP affiché correspond à `User.xp`/`User.level`.
