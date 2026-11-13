# Tâche 4.7 — Gestion des exercices (`/admin/exercices`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [04-gestion-modules-sous-modules.md](04-gestion-modules-sous-modules.md), [phase-2-pedagogique/04-api-exercices.md](../phase-2-pedagogique/04-api-exercices.md), [phase-2-pedagogique/08-editeur-code-algorithme-python.md](../phase-2-pedagogique/08-editeur-code-algorithme-python.md)
**Réfs cahier des charges :** §7.6, §8.4, §10.6, §11.3

## Objectif

CRUD complet des exercices côté API, et interface d'administration permettant de créer au moins 2 exercices par sous-module (type algorithme ou Python), avec code de départ optionnel et solution de référence.

## Contexte

Le §7.6 précise les champs attendus : « titre, énoncé, type (algorithme ou Python), code de départ (optionnel), solution de référence, difficulté (facile/moyen/difficile), ordre ». La configuration de tests automatiques est explicitement une évolution (V2, §7.6/§8.4/Phase 6).

## Étapes détaillées — Backend

1. **`POST /api/exercises`** 👑 — création (`subModuleId`, `title`, `statement`, `type`, `starterCode`, `solution`, `difficulty`, `order`). Pas de contrainte d'unicité ici (plusieurs exercices par sous-module).
2. **`PUT /api/exercises/:id`** 👑 — édition.
3. **`DELETE /api/exercises/:id`** 👑 — suppression. Vérifier l'impact sur `Progress.exercisesCompleted` des élèves qui l'auraient déjà résolu (retirer la référence orpheline ou accepter de la conserver comme historique — recommandé : retirer la référence pour garder les comptages cohérents, ou au minimum s'assurer que les comptages `exercisesCompleted.length / totalExercises` de la tâche 2.5 restent corrects après suppression).
4. **Avertissement UX à prévoir côté frontend** (pas une contrainte serveur bloquante forcément) : signaler si un sous-module se retrouve avec moins de 2 exercices après une suppression, car le cahier des charges demande « 2 exercices ou plus » par sous-module (§6.2.3, §7.6) — décision d'équipe : bloquer strictement côté serveur, ou seulement avertir côté interface admin. Recommandé pour un MVP : avertir sans bloquer (le contenu est en cours de rédaction, un état transitoire à 0 ou 1 exercice doit rester possible pendant que l'admin travaille).

## Étapes détaillées — Frontend

1. **Service API** (`api/adminExercisesApi.js`).
2. **Page `AdminExercices.jsx`** (`pages/admin/AdminExercices.jsx`, route `/admin/exercices`)
   - Sélection du sous-module concerné, liste réordonnable de ses exercices.
   - Formulaire par exercice : `title`, `statement` (éditeur riche simple, texte + éventuel formatage basique), `type` (algorithme/python — bascule le langage de l'éditeur de code associé), `starterCode` (éditeur de code, tâche 2.8, optionnel), `solution` (éditeur de code, obligatoire), `difficulty` (sélecteur), `order`.
   - Indicateur visuel si le sous-module a moins de 2 exercices (rappel du minimum recommandé par le cahier des charges).

## Fichiers à créer / modifier

```
server/src/
├── controllers/exerciseController.js   # étendu (CRUD complet, en plus de la lecture Phase 2)
└── routes/exerciseRoutes.js            # étendu avec role('admin') sur les routes d'écriture

client/src/
├── api/adminExercisesApi.js
├── pages/admin/AdminExercices.jsx
└── components/admin/
    └── ExerciseFormDialog.jsx
```

## Modèles de données concernés

`Exercise`, `Progress` (§10.6, §10.7).

## Endpoints API concernés

`POST/PUT/DELETE /api/exercises` 👑 (§11.3).

## Règles métier / cas limites

- `solution` reste un champ sensible : il ne doit jamais fuiter vers un contexte élève avant déverrouillage (déjà couvert tâche 2.4, mais rappel car cette tâche l'écrit).
- La suppression d'un exercice déjà marqué résolu par des élèves ne doit pas casser le calcul de complétion du sous-module (tâche 2.5).

## Critères d'acceptation

- [ ] Créer un exercice de type `algorithme` et un de type `python` pour le même sous-module fonctionne, et les deux apparaissent (une fois le quiz réussi) côté élève.
- [ ] Modifier la solution de référence d'un exercice se reflète dans « Voir la solution » côté élève.
- [ ] Supprimer un exercice ne casse pas le calcul de progression des élèves qui l'avaient déjà résolu (vérifier `Progress.status` recalculé correctement).
- [ ] Toute tentative d'écriture par un compte `student` échoue en `403`.
