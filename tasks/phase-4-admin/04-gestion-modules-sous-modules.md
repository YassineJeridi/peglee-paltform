# Tâche 4.4 — Gestion des modules & sous-modules (`/admin/modules`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md), [phase-2-pedagogique/01-api-modules-sous-modules.md](../phase-2-pedagogique/01-api-modules-sous-modules.md) (étend les mêmes modèles avec les opérations d'écriture)
**Réfs cahier des charges :** §7.3, §10.2, §10.3, §11.3

## Objectif

CRUD complet des modules et sous-modules côté API, et interface d'administration permettant de les créer, modifier, réordonner et supprimer.

## Contexte

C'est le point d'entrée de la hiérarchie de contenu (§8.1 : `Module → Sous-module → Leçon/Quiz/Exercices`). Sans cette tâche, aucun contenu réel au-delà du seed ne peut être ajouté.

## Étapes détaillées — Backend

1. **`POST /api/modules`** 👑 — création (`title`, `slug` — généré depuis `title` si non fourni, en vérifiant l'unicité —, `description`, `icon`, `color`, `order`).
2. **`PUT /api/modules/:id`** 👑 — édition.
3. **`DELETE /api/modules/:id`** 👑 — suppression. **Décision à documenter** : bloquer la suppression si des sous-modules existent encore (forcer une suppression explicite en cascade ou un message d'erreur demandant de vider le module d'abord) — évite la suppression accidentelle d'un module entier de contenu.
4. **`POST /api/submodules`** 👑 — création (`moduleId`, `title`, `description`, `order`, `estimatedDuration`).
5. **`PUT /api/submodules/:id`** 👑 — édition.
6. **`DELETE /api/submodules/:id`** 👑 — suppression. Même logique de garde-fou si une leçon/quiz/exercices y sont déjà rattachés, ou suppression en cascade assumée et documentée.
7. **Réordonnancement** — endpoint dédié acceptant un tableau `{ id, order }[]` pour mettre à jour l'ordre de plusieurs modules ou sous-modules en un seul appel (utile pour un drag & drop de réorganisation côté frontend), ex. `PUT /api/modules/reorder` et `PUT /api/submodules/reorder`.

## Étapes détaillées — Frontend

1. **Service API** (`api/adminModulesApi.js`).
2. **Page `AdminModules.jsx`** (`pages/admin/AdminModules.jsx`, route `/admin/modules`)
   - Liste des modules (cartes ou tableau) avec actions créer/modifier/supprimer.
   - Formulaire modale : `title`, `description`, sélecteur d'icône (`@mui/icons-material`), sélecteur de couleur, `order`.
   - Réordonnancement par glisser-déposer (ou simples flèches haut/bas si le drag & drop est jugé superflu pour cette liste généralement courte) — §7.3 « Réordonnancement (drag & drop ou champ "ordre") » laisse le choix.
3. **Vue sous-modules d'un module** (peut être une section dépliable dans la même page, ou une sous-route `/admin/modules/:id`) :
   - Liste des sous-modules du module sélectionné, mêmes actions CRUD + réordonnancement.
   - Depuis chaque sous-module, lien rapide vers sa leçon/son quiz/ses exercices dans les interfaces dédiées (tâches 4.5-4.7) pour fluidifier le flux de saisie de contenu.

## Fichiers à créer / modifier

```
server/src/
├── controllers/moduleController.js     # étendu (CRUD complet, en plus de la lecture Phase 2)
├── controllers/subModuleController.js
└── routes/moduleRoutes.js / subModuleRoutes.js  # étendus avec role('admin')

client/src/
├── api/adminModulesApi.js
├── pages/admin/AdminModules.jsx
└── components/admin/
    ├── ModuleFormDialog.jsx
    └── SubModuleFormDialog.jsx
```

## Modèles de données concernés

`Module`, `SubModule` (§10.2, §10.3).

## Endpoints API concernés

`POST/PUT/DELETE /api/modules`, `POST/PUT/DELETE /api/submodules` 👑 (§11.3).

## Règles métier / cas limites

- Le `slug` d'un module doit rester unique — gérer le cas d'un titre dupliqué (suffixe automatique ou refus explicite).
- Toute route d'écriture ici exige `role('admin')`.
- Documenter clairement le comportement de suppression choisi (garde-fou vs cascade) pour que l'équipe frontend affiche le bon message de confirmation.

## Critères d'acceptation

- [ ] Créer un module puis un sous-module qui lui est rattaché fonctionne de bout en bout et apparaît immédiatement côté élève (`/app/cours`).
- [ ] Modifier l'ordre des modules/sous-modules se reflète dans l'ordre d'affichage côté élève.
- [ ] Supprimer un module contenant des sous-modules se comporte selon la règle documentée (bloqué ou cascade), sans jamais laisser la base dans un état incohérent (sous-module orphelin pointant vers un module supprimé).
- [ ] Toutes les actions d'écriture échouent en `403` pour un compte `student`.
