# Tâche 2.6 — Frontend : liste des modules et sous-modules

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [05-api-progression-deverrouillage.md](05-api-progression-deverrouillage.md), [phase-1-auth-layout/04-layouts-sidebar-navbar.md](../phase-1-auth-layout/04-layouts-sidebar-navbar.md)
**Réfs cahier des charges :** §6.2.1, §6.2.2

## Objectif

Construire les pages `/app/cours` (liste des modules) et `/app/cours/:module` (liste des sous-modules d'un module), consommant les endpoints de la tâche 2.1.

## Contexte

Première étape visible du parcours pédagogique élève. Doit donner un aperçu clair de la progression avant même d'entrer dans le détail d'un sous-module.

## Étapes détaillées

1. **Service API** (`api/coursApi.js`) : `getModules()`, `getSubModules(moduleId)`.

2. **Page `Cours.jsx`** (`pages/student/Cours.jsx`, route `/app/cours`)
   - Récupère `GET /api/modules`, affiche une grille de **cartes** (§6.2.1) : icône, titre, description courte, barre de progression du module, bouton « Continuer / Ouvrir » → navigue vers `/app/cours/:module` (slug).
   - État de chargement (skeleton, §12.4) et état vide (si aucun module — cas admin n'ayant encore rien créé) via les composants génériques de la tâche 0.5.

3. **Page `ModuleDetail.jsx`** (`pages/student/ModuleDetail.jsx`, route `/app/cours/:module`)
   - Résout le module par son `slug` depuis l'URL (ou par `id` selon la convention retenue — recommandé : slug pour des URLs lisibles, cf. `Module.slug` au §10.2).
   - Récupère `GET /api/modules/:id/submodules`, affiche la liste des sous-modules avec :
     - **statut** visuel : verrouillé / en cours / terminé (§6.2.2) — icônes distinctes (cadenas, en cours, coche).
     - indicateurs : leçon lue ✔, quiz réussi ✔, exercices X/N.
   - Clic sur un sous-module (si non verrouillé) → navigue vers `/app/cours/:module/:sousModule`.
   - Fil d'ariane (breadcrumb) : Cours > [Nom du module].

## Fichiers à créer / modifier

```
client/src/
├── api/coursApi.js
├── pages/student/Cours.jsx
├── pages/student/ModuleDetail.jsx
└── components/student/
    ├── ModuleCard.jsx
    └── SubModuleListItem.jsx
```

## Endpoints API concernés

`GET /api/modules`, `GET /api/modules/:id/submodules` (§11.3).

## Règles métier / cas limites

- Rappel : selon la tâche 2.1, les sous-modules ne sont **pas** verrouillés entre eux par défaut dans ce MVP — le statut « verrouillé » concerne le triptyque interne (Leçon→Quiz→Exercices), pas l'accès au sous-module lui-même. Si le cahier des charges est réinterprété différemment par le client (séquence stricte entre sous-modules), ajuster ici et à la tâche 2.1 en cohérence.
- Le pourcentage de progression affiché doit toujours provenir de l'API, jamais recalculé de façon divergente côté client.

## Critères d'acceptation

- [ ] `/app/cours` affiche les modules du seed avec leur vraie progression (0 % pour un nouvel élève).
- [ ] Cliquer sur un module ouvre `/app/cours/:module` avec la liste correcte de ses sous-modules et leurs statuts.
- [ ] Les indicateurs (leçon ✔, quiz ✔, exercices X/N) correspondent à l'état réel renvoyé par l'API.
- [ ] Les états de chargement et vide sont gérés proprement (pas de flash de contenu vide avant chargement).
