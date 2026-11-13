# Tâche 4.2 — Frontend : Vue d'ensemble admin (`/admin/overview`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [01-api-statistiques-admin.md](01-api-statistiques-admin.md)
**Réfs cahier des charges :** §7.1, §13.2

## Objectif

Construire le tableau de bord d'accueil de l'administrateur, affichant les statistiques globales de la plateforme sous forme de cartes KPI et de graphiques.

## Contexte

Point d'entrée de l'espace admin (`/admin` redirige ici, §4). Doit donner en un coup d'œil la santé et l'usage de la plateforme.

## Étapes détaillées

1. **Service API** (`api/adminApi.js`) : `getStats()`.
2. **Page `AdminOverview.jsx`** (`pages/admin/AdminOverview.jsx`, route `/admin/overview`)
   - Cartes KPI (réutiliser/adapter `KpiCard` de la tâche 2.9 si le design le permet) :
     - Total utilisateurs (+ nouveaux ce mois).
     - Total modules / sous-modules / leçons / quiz / exercices (peut être une carte multi-valeurs ou plusieurs petites cartes).
     - Taux moyen de réussite aux quiz.
     - Progression moyenne des élèves.
     - Élèves actifs récemment.
   - Graphiques (`@mui/x-charts` ou `recharts`, §9.2) :
     - Évolution des inscriptions dans le temps.
     - Évolution de l'activité dans le temps.
     - Répartition des élèves par module.
   - États de chargement (skeletons) le temps que `GET /api/admin/stats` réponde (§12.4).

## Fichiers à créer / modifier

```
client/src/
├── api/adminApi.js
├── pages/admin/AdminOverview.jsx
└── components/admin/
    ├── AdminKpiCard.jsx
    ├── SignupsChart.jsx
    ├── ActivityChart.jsx
    └── ModuleDistributionChart.jsx
```

## Endpoints API concernés

`GET /api/admin/stats` 👑 (§11.6).

## Règles métier / cas limites

- Cette page n'est accessible qu'aux comptes `admin` — protégée par `RoleRoute` (tâche 1.3) côté client et par `role('admin')` côté serveur (tâche 4.1).

## Critères d'acceptation

- [ ] La page affiche des chiffres cohérents avec l'état réel de la base (comparables à une requête manuelle en base ou via le seed).
- [ ] Les graphiques se rendent sans erreur, y compris avec peu de données (base de démo).
- [ ] La page est inaccessible à un compte `student` (redirection, pas de fuite de données dans le réseau avant redirection).
