# Tâche 2.4 — API Exercices (lecture élève, verrouillage serveur)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [03-api-quiz.md](03-api-quiz.md)
**Réfs cahier des charges :** §6.2.3 (onglet Exercices), §8.4, §10.6, §11.3, §11.6

## Objectif

Implémenter `GET /api/exercises/:subModuleId`, qui renvoie les exercices d'un sous-module, en **refusant l'accès côté serveur** si le quiz du sous-module n'a pas encore été réussi par l'élève — pas seulement un verrouillage visuel.

## Contexte

Rappel explicite du cahier des charges (§11.6) : « l'accès aux exercices est refusé côté serveur si `quizPassed` est faux (ne pas se fier uniquement au verrouillage visuel) ». C'est la règle de sécurité la plus spécifique à cette plateforme (au-delà des règles d'auth génériques) — elle mérite un test dédié.

## Étapes détaillées

1. **`GET /api/exercises/:subModuleId`** 🔒
   - Charger le `Progress` de l'élève courant pour ce `subModuleId`.
   - Si absent, ou si `quizPassed !== true` : renvoyer `403` avec un message clair (« Vous devez réussir le quiz avant d'accéder aux exercices »), **pas** la liste des exercices, même partielle.
   - Si `quizPassed === true` : renvoyer la liste des `Exercise` du sous-module, triés par `order`, avec pour chacun : `title`, `statement`, `type`, `starterCode`, `difficulty`, `order`. **Exclure le champ `solution`** de cette réponse — la solution de référence n'est révélée qu'à la demande explicite de l'élève via un endpoint ou paramètre séparé (« Voir la solution », §6.2.3), pour éviter qu'elle apparaisse dans la réponse réseau dès l'ouverture de l'onglet.
   - Joindre également, pour chaque exercice, s'il est déjà marqué résolu par l'élève (`Progress.exercisesCompleted`).

2. **Endpoint séparé pour la solution** (à documenter ici, implémenté avec la tâche 2.4 ou 2.5 selon préférence d'organisation) : ex. `GET /api/exercises/:exerciseId/solution` 🔒, qui applique la **même vérification** `quizPassed` avant de renvoyer `solution`. Alternative plus simple : inclure `solution` dans la réponse de l'exercice une fois `quizPassed` vrai, mais seulement à la demande explicite (paramètre `?includeSolution=true`) — à trancher selon la préférence de l'équipe, l'important étant que la solution ne soit jamais visible avant que l'élève ait explicitement cliqué sur « Voir la solution » **et** réussi le quiz.

## Fichiers à créer / modifier

```
server/src/
├── controllers/exerciseController.js
└── routes/exerciseRoutes.js
```

## Modèles de données concernés

`Exercise`, `Progress` (§10.6, §10.7).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/exercises/:subModuleId` 🔒 | Exercices (verrouillés si quiz non réussi). |

## Règles métier / cas limites

- Un appel direct à cet endpoint via un outil externe (Postman/curl) avec un token d'élève n'ayant pas réussi le quiz **doit** échouer avec `403`, quel que soit l'état de l'interface. C'est le test de sécurité le plus important de la phase.
- Le champ `solution` ne doit jamais apparaître dans la réponse de liste, même pour un élève ayant réussi le quiz — seulement via l'action explicite « Voir la solution ».

## Critères d'acceptation

- [ ] Requête `GET /api/exercises/:subModuleId` avec un token d'élève n'ayant pas réussi le quiz → `403`, corps de réponse sans données d'exercices.
- [ ] Même requête après réussite du quiz → `200` avec la liste des exercices, sans le champ `solution`.
- [ ] Vérification explicite (inspection réseau) que `solution` n'apparaît jamais dans la réponse de liste.
- [ ] La récupération de la solution d'un exercice précis applique la même règle de verrouillage `quizPassed`.
