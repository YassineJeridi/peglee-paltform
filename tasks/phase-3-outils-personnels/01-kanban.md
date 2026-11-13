# Tâche 3.1 — Kanban (`/app/kanban`)

**Phase :** 3 — Outils personnels
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md) (middleware `auth`), [phase-0-fondations/03-modeles-mongoose.md](../phase-0-fondations/03-modeles-mongoose.md) (modèle `Task`)
**Réfs cahier des charges :** §6.3, §10.9, §11.5, §15

## Objectif

Implémenter le CRUD complet des tâches Kanban côté API, et l'interface de tableau avec glisser-déposer côté frontend.

## Contexte

Outil d'organisation strictement personnel — « chaque élève ne voit que ses propres tâches » (§6.3). Les colonnes par défaut sont fixes en V1 (« À faire », « En cours », « Terminé »), la personnalisation des colonnes étant explicitement une évolution future.

## Étapes détaillées — Backend

1. **`GET /api/tasks`** 🔒 — liste des tâches de l'utilisateur courant uniquement (`filter: { userId: req.user.id }`), triées par `status` puis `order`.
2. **`POST /api/tasks`** 🔒 — création (`title`, `description`, `status` par défaut `'todo'`, `priority`, `dueDate`, `color`), `userId` forcé à `req.user.id` (jamais pris du body).
3. **`PUT /api/tasks/:id`** 🔒 — édition ; **vérifier que la tâche appartient bien à `req.user.id`** avant modification (404 sinon, pas 403, pour ne pas révéler l'existence de tâches d'autrui).
4. **`DELETE /api/tasks/:id`** 🔒 — suppression, même vérification de propriété.
5. Endpoint ou paramètre dédié pour la **réorganisation** (changement de `status` et `order` lors d'un drag & drop) — peut être le même `PUT /api/tasks/:id` avec `{ status, order }`, ou un `PATCH /api/tasks/reorder` prenant un tableau d'updates si l'on veut limiter les allers-retours réseau lors d'un déplacement multiple. Pour le MVP, un `PUT` par carte déplacée est suffisant.

## Étapes détaillées — Frontend

1. **Service API** (`api/tasksApi.js`) : `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`.
2. **Page `Kanban.jsx`** (`pages/student/Kanban.jsx`, route `/app/kanban`)
   - Trois colonnes fixes : À faire, En cours, Terminé.
   - Glisser-déposer entre colonnes avec `@hello-pangea/dnd` ou `dnd-kit` (§9.2) — au drop, appeler `updateTask(id, { status: nouvelleColonne, order })`, avec mise à jour optimiste de l'UI puis reconciliation si l'appel échoue.
3. **Carte de tâche** (`components/student/TaskCard.jsx`) — titre, description (tronquée), badge priorité (couleur basse/moyenne/haute), date d'échéance, étiquette/couleur.
4. **Formulaire création/édition** (`components/student/TaskFormDialog.jsx`) — modale MUI avec les champs `title`, `description`, `priority`, `dueDate`, `color`.
5. **Suppression** avec confirmation (dialogue, §12.4).
6. **État vide** : « Aucune tâche pour l'instant » avec action « Créer une tâche » si les 3 colonnes sont vides (§12.4).

## Fichiers à créer / modifier

```
server/src/
├── models/Task.js                # déjà créé en Phase 0, vérifié ici
├── controllers/taskController.js
└── routes/taskRoutes.js

client/src/
├── api/tasksApi.js
├── pages/student/Kanban.jsx
└── components/student/
    ├── KanbanColumn.jsx
    ├── TaskCard.jsx
    └── TaskFormDialog.jsx
```

## Modèles de données concernés

`Task` (§10.9).

## Endpoints API concernés

`GET/POST/PUT/DELETE /api/tasks` 🔒 (§11.5).

## Règles métier / cas limites

- Toute opération de lecture/modification/suppression doit être scoping par `userId` **côté serveur**, jamais seulement filtrée côté client.
- Une tentative de modifier/supprimer la tâche d'un autre utilisateur (ID deviné) doit échouer proprement, sans fuite d'information.

## Critères d'acceptation

- [ ] Créer, éditer, déplacer (drag & drop) et supprimer une tâche fonctionnent de bout en bout.
- [ ] Un second compte élève ne voit aucune tâche du premier.
- [ ] Requête directe (Postman) pour modifier/supprimer une tâche d'un autre utilisateur échoue.
- [ ] L'état vide s'affiche correctement pour un nouvel élève.
