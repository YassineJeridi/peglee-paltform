# Phase 3 — Outils personnels

**Réfs cahier des charges :** §16 (Phase 3), §6.3, §6.4, §6.5, §6.6, §10.9, §10.10, §10.11, §11.5.

## Objectif de la phase

Livrer les outils d'organisation personnelle de l'élève — Kanban, notes autocollantes, calendrier — ainsi que la gestion de son profil (photo, username, e-mail, mot de passe). Ces quatre modules sont fonctionnellement indépendants les uns des autres (aucune dépendance métier croisée), donc peuvent être développés en parallèle par plusieurs personnes.

## Prérequis

Phase 1 terminée (auth, layouts). La Phase 2 n'est **pas** un prérequis strict, sauf pour le composant « Prochaines échéances » de l'overview étudiant (tâche 2.9) qui consomme `GET /api/events` créé ici (tâche 3.3) — coordonner si les deux phases sont menées en parallèle.

## Tâches de la phase

Chaque tâche ci-dessous regroupe backend + frontend d'un même outil (contrairement à la Phase 2, la logique métier ici est simple CRUD, donc pas besoin de séparer aussi finement) :

1. [01-kanban.md](01-kanban.md) — Tableau Kanban (colonnes, cartes, drag & drop).
2. [02-notes-autocollantes.md](02-notes-autocollantes.md) — Notes autocollantes (mur de post-it).
3. [03-calendrier.md](03-calendrier.md) — Calendrier (vues Mois/Semaine/Jour, événements).
4. [04-profil-utilisateur.md](04-profil-utilisateur.md) — Profil (photo, username, e-mail, mot de passe).

Ces 4 tâches sont indépendantes entre elles et peuvent toutes être menées en parallèle.

## Definition of done de la phase

- [ ] Un élève peut créer, éditer, déplacer (drag & drop) et supprimer des tâches Kanban ; il ne voit que les siennes.
- [ ] Un élève peut créer, éditer et supprimer des notes autocollantes colorées ; il ne voit que les siennes.
- [ ] Un élève peut créer, éditer et supprimer des événements de calendrier, avec vues Mois/Semaine/Jour ; il ne voit que les siens.
- [ ] Un élève peut modifier sa photo de profil, son nom d'utilisateur, son e-mail et son mot de passe, avec validations appropriées.
- [ ] Toutes les données de ces modules sont strictement filtrées par `userId` côté serveur (isolation des données, §15).
