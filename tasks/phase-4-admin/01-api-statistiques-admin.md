# Tâche 4.1 — API Statistiques admin

**Phase :** 4 — Espace administrateur
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md) (middleware `role('admin')`)
**Réfs cahier des charges :** §7.1, §11.6, §13.2

## Objectif

Implémenter `GET /api/admin/stats`, qui renvoie l'ensemble des indicateurs globaux listés au §7.1/§13.2 pour alimenter l'overview admin.

## Contexte

Cet endpoint agrège des données de plusieurs collections (`User`, `Module`, `SubModule`, `Lesson`, `Quiz`, `Exercise`, `Progress`, `QuizAttempt`) — le développer tôt dans la phase permet de valider la disponibilité des données avant de construire les autres écrans d'administration.

## Étapes détaillées

1. **`GET /api/admin/stats`** 👑
   - Nombre total d'utilisateurs, et nouveaux ce mois-ci (`createdAt >= début du mois courant`).
   - Nombre de modules / sous-modules / leçons / quiz / exercices (simples `countDocuments`).
   - Taux de complétion global des quiz : proportion de `Progress` avec `quizPassed: true` sur le total de `Progress` existants (ou sur le total théorique élèves × sous-modules avec quiz — clarifier la définition retenue et la documenter dans le code, car plusieurs interprétations sont possibles).
   - Élèves actifs (connexions récentes, ex. `lastLoginAt` dans les 7 ou 30 derniers jours — seuil à choisir et documenter).
   - Progression moyenne des élèves (moyenne des `progressPercent` calculés en tâche 2.1, agrégée sur tous les élèves).
   - Séries temporelles pour graphiques : inscriptions dans le temps (`User.createdAt` groupé par jour/semaine), activité dans le temps (ex. `QuizAttempt.attemptedAt` groupé), répartition des élèves par module (compter les `Progress` actifs par `moduleId` via `$lookup` sur `SubModule`).

2. **Performance** (§14) : privilégier les pipelines d'agrégation Mongoose (`aggregate`) pour les comptages/regroupements plutôt que de charger toutes les données en mémoire et calculer en JS, surtout à mesure que la base grossit.

3. **Structure de réponse** : regrouper logiquement (`{ totals: {...}, rates: {...}, timeSeries: {...} }`) pour que le frontend (tâche 4.2) consomme une structure stable et prévisible.

## Fichiers à créer / modifier

```
server/src/
├── controllers/adminStatsController.js
├── routes/adminRoutes.js
└── services/statsService.js      # agrégations réutilisables
```

## Modèles de données concernés

`User`, `Module`, `SubModule`, `Lesson`, `Quiz`, `Exercise`, `Progress`, `QuizAttempt` (§10, toutes sections).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` 👑 | KPIs globaux de la plateforme. |

## Règles métier / cas limites

- Accessible **exclusivement** au rôle `admin` — vérifier que `role('admin')` est bien appliqué, pas seulement `auth`.
- Une base vide (aucun utilisateur, aucun contenu) ne doit pas faire planter l'endpoint — tous les taux/moyennes doivent gérer la division par zéro proprement (renvoyer 0, pas `NaN`/erreur).

## Critères d'acceptation

- [ ] `GET /api/admin/stats` avec un compte `student` renvoie `403`.
- [ ] `GET /api/admin/stats` avec un compte `admin` renvoie une structure complète et cohérente avec les données du seed.
- [ ] Les séries temporelles sont correctement groupées (vérifiable en ajoutant quelques utilisateurs de test à des dates différentes).
- [ ] Aucune erreur ni `NaN` sur une base fraîchement seedée avec peu de données.
