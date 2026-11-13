# Tâche 3.3 — Calendrier (`/app/calendrier`)

**Phase :** 3 — Outils personnels
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md)
**Réfs cahier des charges :** §6.5, §10.11, §11.5, §15

## Objectif

Implémenter le CRUD des événements de calendrier côté API et l'interface de calendrier (vues Mois/Semaine/Jour) côté frontend, avec alimentation du widget « Prochaines échéances » de l'overview étudiant.

## Contexte

Outil d'organisation du temps d'étude (§6.5), lié à la Phase 2 (tâche 2.9) via le widget d'échéances — c'est le seul module de cette phase à avoir une dépendance sortante vers une autre phase.

## Étapes détaillées — Backend

1. **`GET /api/events`** 🔒 — événements de l'utilisateur courant, avec filtrage optionnel par plage de dates (`?start=&end=`) pour ne charger que la période affichée par le calendrier (performance, §14). Prévoir aussi un mode « prochains événements » (ex. `?upcoming=true&limit=5`) réutilisé par le widget de l'overview (tâche 2.9) — soit via un paramètre de requête, soit un endpoint dédié `GET /api/events/upcoming`, au choix de l'équipe.
2. **`POST /api/events`** 🔒 — création (`title`, `description`, `start`, `end`, `type`, `color`), `userId` forcé serveur. Valider `end >= start`.
3. **`PUT /api/events/:id`** 🔒 — édition, vérification de propriété.
4. **`DELETE /api/events/:id`** 🔒 — suppression, vérification de propriété.

## Étapes détaillées — Frontend

1. **Service API** (`api/eventsApi.js`).
2. **Page `Calendrier.jsx`** (`pages/student/Calendrier.jsx`, route `/app/calendrier`)
   - Intégrer **FullCalendar** (`@fullcalendar/react`) tel que suggéré au §6.5, avec les vues Mois/Semaine/Jour et un sélecteur pour basculer entre elles.
   - Clic sur une plage horaire vide → ouvre un formulaire de création rapide.
   - Clic sur un événement existant → ouvre l'édition (modale) avec suppression possible.
   - Formulaire : `title`, `description`, `start`/`end` (date + heure), `type` (revision/quiz/examen/personnel) avec couleur associée par défaut selon le type, `color` personnalisable.
   - Chargement des événements par plage visible (mois affiché) pour limiter la charge réseau.

## Fichiers à créer / modifier

```
server/src/
├── controllers/eventController.js
└── routes/eventRoutes.js

client/src/
├── api/eventsApi.js
├── pages/student/Calendrier.jsx
└── components/student/
    └── EventFormDialog.jsx
```

## Modèles de données concernés

`Event` (§10.11).

## Endpoints API concernés

`GET/POST/PUT/DELETE /api/events` 🔒 (§11.5).

## Règles métier / cas limites

- `end` doit toujours être postérieur ou égal à `start` — valider côté serveur, pas seulement dans le composant de sélection de date.
- Isolation stricte par `userId`.
- Le widget « Prochaines échéances » de l'overview (tâche 2.9) doit être coordonné avec cette tâche — si développées en parallèle, convenir tôt du contrat de l'endpoint « upcoming ».

## Critères d'acceptation

- [ ] Créer, éditer et supprimer un événement fonctionnent dans les 3 vues du calendrier.
- [ ] Les couleurs/types d'événements sont visuellement distincts dans le calendrier.
- [ ] Un second compte élève ne voit aucun événement du premier.
- [ ] Le widget « Prochaines échéances » de l'overview étudiant affiche les bons événements une fois les deux tâches connectées.
