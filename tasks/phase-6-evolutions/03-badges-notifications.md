# Tâche 6.3 — Badges/récompenses et notifications

**Phase :** 6 — Évolutions
**Dépendances :** [phase-5-finitions/01-systeme-xp-niveaux.md](../phase-5-finitions/01-systeme-xp-niveaux.md)
**Réfs cahier des charges :** §13.3, §16 (Phase 6)

## Objectif

Ajouter un système de badges/récompenses attribués par jalons (en complément du système XP/niveaux) et un système de notifications (la cloche déjà présente visuellement dans la barre supérieure depuis la tâche 1.4, jusqu'ici sans contenu réel).

## Contexte

Le §13.3 mentionne explicitement « (Évolution) badges / récompenses par jalons » comme extension du système de niveaux. La cloche de notifications de la barre supérieure (§6, §12.2) est posée visuellement dès la Phase 1 mais son contenu réel est implicitement différé — cette tâche lui donne un sens fonctionnel.

## Étapes détaillées

1. **Modèle `Badge`** (nouveau, non défini au §10 — extension) — `title`, `description`, `icon`, `criteria` (structure décrivant la condition d'obtention, ex. `{ type: 'module_completed', moduleSlug: 'algorithmique' }` ou `{ type: 'streak', days: 7 }` ou `{ type: 'level_reached', level: 5 }`).
2. **Modèle `UserBadge`** — `userId`, `badgeId`, `earnedAt` (jointure many-to-many avec date d'obtention).
3. **Service d'attribution** (`services/badgeService.js`) — évalué en même temps que les événements de progression/XP (tâche 2.5/5.1) : après chaque gain de progression significatif, vérifier si un nouveau badge est débloqué (comparer l'état courant aux critères de tous les badges non encore obtenus par l'utilisateur).
4. **Modèle `Notification`** (nouveau) — `userId`, `type` (`badge_earned`, `level_up`, `deadline_reminder`, …), `message`, `read` (Boolean), `createdAt`. Créée automatiquement par le backend lors d'événements pertinents (badge obtenu, niveau supérieur, échéance de calendrier proche — cette dernière nécessitant une tâche planifiée/cron, à évaluer selon l'infrastructure disponible).
5. **Endpoints** : `GET /api/notifications` 🔒 (liste, non lues en premier), `PUT /api/notifications/:id/read` 🔒, `PUT /api/notifications/read-all` 🔒 ; `GET /api/badges/me` 🔒 (badges obtenus par l'élève courant).
6. **Frontend** :
   - Cloche de la `TopBar` (tâche 1.4) : badge de compteur non lues, menu déroulant listant les notifications récentes, marquage comme lues.
   - Section « Badges » à ajouter sur l'overview étudiant (tâche 2.9) ou une page dédiée, affichant les badges obtenus (et éventuellement les badges non obtenus en grisé, façon « à débloquer »).
   - Interface admin (extension de tâche 4.4-4.8) pour créer/modifier les badges disponibles et leurs critères.

## Fichiers à créer / modifier

```
server/src/
├── models/Badge.js
├── models/UserBadge.js
├── models/Notification.js
├── services/badgeService.js
├── controllers/notificationController.js
├── controllers/badgeController.js
└── routes/notificationRoutes.js / badgeRoutes.js

client/src/
├── api/notificationsApi.js
├── api/badgesApi.js
├── components/TopBar.jsx              # étendu avec contenu réel de la cloche
└── components/student/BadgesSection.jsx
```

## Modèles de données concernés

Nouveaux modèles `Badge`, `UserBadge`, `Notification` (extensions raisonnables au-delà du §10, qui ne les définit pas explicitement).

## Règles métier / cas limites

- Un badge ne doit jamais être attribué deux fois au même utilisateur (contrainte d'unicité `{ userId, badgeId }`).
- Les notifications temps réel (push instantané) sont explicitement hors périmètre initial (§2.3 « Messagerie temps réel… peut être une évolution future ») — un simple rafraîchissement périodique ou au chargement de page suffit pour cette V2 ; un vrai push (WebSocket/SSE) serait une extension ultérieure encore.

## Critères d'acceptation

- [ ] Compléter un module entier attribue le badge correspondant (si défini par l'admin) une seule fois.
- [ ] La cloche de notifications affiche le bon compteur de non-lues et permet de les marquer comme lues.
- [ ] L'admin peut créer un nouveau badge avec ses critères depuis l'interface d'administration.
- [ ] Les badges obtenus sont visibles sur l'overview étudiant.
