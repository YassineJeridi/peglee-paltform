# Phase 0 — Fondations

**Réfs cahier des charges :** §16 (Phase 0), §9 (Spécifications techniques), §10 (Modèle de données).

## Objectif de la phase

Poser les fondations techniques du projet : structure du monorepo, configuration du serveur Express, connexion MongoDB, tous les schémas Mongoose, script de seed (admin + données de démo), et l'ossature React + thème MUI. À la fin de cette phase, le projet doit démarrer (`client` + `server`) sans fonctionnalité métier visible, mais avec une base saine sur laquelle brancher l'authentification (Phase 1).

## Prérequis

Aucun — c'est le point de départ du projet. Décisions à prendre en amont : voir [points-a-confirmer.md](../points-a-confirmer.md) (surtout #4 palette et #6 stockage photos, qui influencent respectivement la tâche 05 et une tâche de la Phase 3).

## Tâches de la phase (ordre recommandé)

1. [01-initialisation-projet.md](01-initialisation-projet.md) — Monorepo `client/` + `server/`, outillage (git, ESLint/Prettier, scripts npm).
2. [02-configuration-backend-express.md](02-configuration-backend-express.md) — App Express, variables d'environnement, connexion MongoDB, middlewares globaux, gestion d'erreurs.
3. [03-modeles-mongoose.md](03-modeles-mongoose.md) — Les 11 schémas Mongoose du §10.
4. [04-seed-donnees-demo.md](04-seed-donnees-demo.md) — Script de seed : premier admin + jeu de données de démonstration (module Algorithmique).
5. [05-setup-frontend-theme-mui.md](05-setup-frontend-theme-mui.md) — Ossature React (Vite), React Router, thème MUI centralisé, structure de dossiers `client/src`.

Les tâches 1→2→3→4 sont séquentielles (chacune dépend de la précédente). La tâche 5 (frontend) peut être menée **en parallèle** des tâches 2-4 par un second développeur, puisqu'elle ne dépend que de la tâche 1.

## Definition of done de la phase

- [ ] `npm run dev` (ou équivalent) démarre `server` sans erreur et se connecte à MongoDB.
- [ ] `npm run dev` démarre `client` (Vite) et affiche une page MUI thémée (même vide).
- [ ] Les 11 modèles Mongoose sont définis et exportés, sans erreur au chargement.
- [ ] Le script de seed crée un compte admin (via `ADMIN_EMAIL`/`ADMIN_PASSWORD`) et au moins un module « Algorithmique » avec 2-3 sous-modules complets (leçon + quiz + 2 exercices).
- [ ] `.env.example` présent et documenté pour `client` et `server`.
- [ ] README racine du projet (pas celui de `tasks/`) décrit l'installation et le lancement — préparer ce contenu ici, il sera formalisé en Phase 5 (§17 Livrables).
