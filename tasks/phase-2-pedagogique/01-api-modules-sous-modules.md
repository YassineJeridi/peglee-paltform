# Tâche 2.1 — API Modules & Sous-modules (lecture élève)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md) (middleware `auth`), [phase-0-fondations/04-seed-donnees-demo.md](../phase-0-fondations/04-seed-donnees-demo.md) (données à lire)
**Réfs cahier des charges :** §6.2.1, §6.2.2, §8.1, §10.2, §10.3, §11.3

## Objectif

Implémenter `GET /api/modules` et `GET /api/modules/:id/submodules`, qui renvoient respectivement la liste des modules et la liste des sous-modules d'un module, **enrichis pour l'élève connecté** avec son statut de progression sur chacun.

## Contexte

Ces endpoints alimentent les pages `/app/cours` (liste des modules avec barre de progression, §6.2.1) et `/app/cours/:module` (liste des sous-modules avec statut verrouillé/en cours/terminé, §6.2.2). Le calcul de progression doit croiser les données statiques (Module, SubModule) avec les données dynamiques propres à l'utilisateur (Progress).

## Étapes détaillées

1. **`GET /api/modules`** 🔒
   - Renvoie tous les modules, triés par `order`.
   - Pour chaque module, calculer la **progression globale du module pour l'élève courant** : nombre de sous-modules avec `status: 'completed'` (dans `Progress`, filtré par `userId = req.user.id`) / nombre total de sous-modules du module. Exposer ce pourcentage dans la réponse (ex. `{ ...module, progressPercent }`).
   - Utiliser une agrégation Mongoose (`aggregate` avec `$lookup`) ou plusieurs requêtes simples selon la complexité acceptable pour l'équipe — privilégier la lisibilité pour un MVP, optimiser seulement si nécessaire (§14 performance).

2. **`GET /api/modules/:id/submodules`** 🔒
   - Vérifie que le module existe (404 sinon).
   - Renvoie les sous-modules du module, triés par `order`.
   - Pour chaque sous-module, joindre le document `Progress` de l'élève courant (s'il existe) et exposer : `lessonCompleted`, `quizPassed`, `quizBestScore`, nombre d'exercices résolus / total, et surtout le champ `status` (`locked` | `in_progress` | `completed`).
   - **Règle de déverrouillage à appliquer ici pour l'affichage** (la vérité d'accès reste imposée aux endpoints de contenu eux-mêmes, tâches 2.2-2.4, mais cette liste doit refléter le bon statut visuel) : un sous-module sans `Progress` existant est considéré `locked` seulement si l'admin a défini une dépendance d'ordre (voir note ci-dessous) — **par défaut, tous les sous-modules d'un module sont accessibles indépendamment les uns des autres** ; c'est le triptyque **interne** Leçon→Quiz→Exercices qui est verrouillé progressivement, pas l'accès entre sous-modules. Documenter ce choix clairement dans le code (le cahier des charges ne spécifie pas de dépendance séquentielle explicite entre sous-modules, seulement à l'intérieur d'un sous-module, §6.2.3).
   - Si aucun `Progress` n'existe encore pour un couple `(userId, subModuleId)`, le considérer comme `status: 'in_progress'` avec tous les booléens à `false` (pas encore commencé mais accessible) plutôt que de forcer la création d'un document vide à chaque lecture — le document `Progress` réel est créé au premier événement de progression (tâche 2.5).

3. **Sécurité**
   - Les deux endpoints sont protégés par `auth` uniquement (pas de restriction de rôle particulière — un `admin` doit aussi pouvoir consulter en lecture s'il navigue dans l'espace étudiant à des fins de test, même si ce n'est pas son usage principal).

## Fichiers à créer / modifier

```
server/src/
├── controllers/moduleController.js
├── routes/moduleRoutes.js
└── services/progressService.js     # helpers de calcul de progression, réutilisés en tâche 2.5 et 2.9
```

## Modèles de données concernés

`Module`, `SubModule`, `Progress` (§10.2, §10.3, §10.7).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/modules` 🔒 | Liste des modules (+ progression pour l'élève). |
| GET | `/api/modules/:id/submodules` 🔒 | Sous-modules d'un module (+ statut). |

## Règles métier / cas limites

- Ne jamais faire confiance à un statut envoyé par le client — tout est recalculé côté serveur à partir de `Progress`.
- Un module sans sous-module doit renvoyer `progressPercent: 0` sans diviser par zéro.
- Un `moduleId` invalide (mauvais format ObjectId) doit renvoyer une erreur `400`, pas un crash serveur.

## Critères d'acceptation

- [ ] `GET /api/modules` renvoie les modules du seed avec un `progressPercent` cohérent (0 % pour un élève qui vient de s'inscrire).
- [ ] `GET /api/modules/:id/submodules` renvoie le bon nombre de sous-modules, triés par `order`, avec un `status` par défaut cohérent pour un élève sans progression.
- [ ] Après qu'un élève ait complété manuellement un `Progress` (test via script ou via la Phase 2 complète), le `status` et `progressPercent` reflètent le changement.
- [ ] Un `moduleId` inexistant renvoie `404` proprement.
