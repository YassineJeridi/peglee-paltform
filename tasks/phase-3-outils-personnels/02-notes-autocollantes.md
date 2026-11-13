# Tâche 3.2 — Notes autocollantes (`/app/notes`)

**Phase :** 3 — Outils personnels
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md)
**Réfs cahier des charges :** §6.4, §10.10, §11.5, §15

## Objectif

Implémenter le CRUD des notes autocollantes côté API et l'interface « mur de post-it » côté frontend.

## Contexte

Outil de prise de notes rapides, strictement personnel (§6.4). Fonctionnalité volontairement simple par rapport au Kanban — pas de statut, juste contenu + couleur + épinglage optionnel.

## Étapes détaillées — Backend

1. **`GET /api/notes`** 🔒 — notes de l'utilisateur courant, triées par `pinned` (épinglées en premier) puis par date de création décroissante.
2. **`POST /api/notes`** 🔒 — création (`content`, `color`), `userId` forcé serveur.
3. **`PUT /api/notes/:id`** 🔒 — édition (`content`, `color`, `pinned`), vérification de propriété.
4. **`DELETE /api/notes/:id`** 🔒 — suppression, vérification de propriété.

## Étapes détaillées — Frontend

1. **Service API** (`api/notesApi.js`).
2. **Page `Notes.jsx`** (`pages/student/Notes.jsx`, route `/app/notes`)
   - Grille de cartes façon post-it (§6.4 « mur de post-it »), chaque note colorée selon `color`.
   - Bouton flottant ou carte « + Nouvelle note » pour créer.
   - Édition en place (clic sur une note → mode édition inline ou modale) et suppression (icône sur la carte, avec confirmation légère — une note étant peu critique, une confirmation discrète suffit, à la différence du Kanban).
   - Sélecteur de couleur simple (palette de 5-6 couleurs prédéfinies) à la création/édition.
   - Bouton d'épinglage (icône punaise) qui remonte la note en tête de liste.
   - État vide : « Aucune note pour l'instant » (§12.4).

## Fichiers à créer / modifier

```
server/src/
├── controllers/noteController.js
└── routes/noteRoutes.js

client/src/
├── api/notesApi.js
├── pages/student/Notes.jsx
└── components/student/
    ├── StickyNoteCard.jsx
    └── NoteColorPicker.jsx
```

## Modèles de données concernés

`Note` (§10.10).

## Endpoints API concernés

`GET/POST/PUT/DELETE /api/notes` 🔒 (§11.5).

## Règles métier / cas limites

- Isolation stricte par `userId`, comme pour le Kanban.
- Le repositionnement libre des notes (drag) est explicitement marqué **optionnel** au §6.4 — ne pas le développer en priorité si le temps manque ; l'épinglage et le tri par défaut suffisent pour le MVP.

## Critères d'acceptation

- [ ] Créer, éditer, épingler et supprimer une note fonctionnent de bout en bout.
- [ ] Les notes épinglées apparaissent en premier.
- [ ] Un second compte élève ne voit aucune note du premier.
- [ ] L'état vide s'affiche correctement pour un nouvel élève.
