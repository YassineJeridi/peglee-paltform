# Phase 4 — Espace administrateur

**Réfs cahier des charges :** §16 (Phase 4), §3.2, §7 (intégralement), §10, §11.

## Objectif de la phase

Donner à l'administrateur un contrôle total sur la plateforme : gestion des utilisateurs, gestion complète du contenu pédagogique (modules, sous-modules, leçons, quiz, exercices), statistiques globales, et paramètres généraux. C'est cette phase qui permet enfin de saisir le **contenu réel** des modules (au-delà des données de seed), condition pour que la plateforme soit réellement utilisable en production.

## Prérequis

- Phase 1 terminée (auth, layouts — `AdminLayout` notamment).
- Phase 2 terminée pour les modèles et endpoints de contenu pédagogique déjà créés côté élève (Module, SubModule, Lesson, Quiz, Exercise) — cette phase ajoute les opérations **d'écriture** (CRUD complet) sur ces mêmes modèles, les endpoints de lecture existant déjà.

## Tâches de la phase (ordre recommandé)

1. [01-api-statistiques-admin.md](01-api-statistiques-admin.md) — Endpoint `GET /api/admin/stats`.
2. [02-frontend-overview-admin.md](02-frontend-overview-admin.md) — Page `/admin/overview`.
3. [03-gestion-utilisateurs.md](03-gestion-utilisateurs.md) — CRUD utilisateurs + consultation de progression individuelle.
4. [04-gestion-modules-sous-modules.md](04-gestion-modules-sous-modules.md) — CRUD modules/sous-modules + réordonnancement.
5. [05-gestion-lecons.md](05-gestion-lecons.md) — CRUD leçons + éditeur de contenu riche.
6. [06-gestion-quiz.md](06-gestion-quiz.md) — CRUD quiz + questions.
7. [07-gestion-exercices.md](07-gestion-exercices.md) — CRUD exercices.
8. [08-parametres-generaux.md](08-parametres-generaux.md) — Page `/admin/parametres` (seuils par défaut, profil admin).

Les tâches 3 à 7 sont largement indépendantes entre elles une fois la tâche 1-2 (stats, qui donne une vue d'ensemble utile pour prioriser) posée — peuvent être réparties entre plusieurs développeurs. La tâche 4 doit toutefois précéder logiquement 5/6/7 dans l'usage réel (il faut un sous-module avant de lui attacher une leçon), même si le code peut être écrit dans n'importe quel ordre.

## Definition of done de la phase

- [ ] L'admin peut créer/modifier/désactiver/supprimer un utilisateur, réinitialiser son mot de passe, et consulter sa progression détaillée.
- [ ] L'admin peut créer/modifier/réordonner/supprimer des modules et sous-modules.
- [ ] L'admin peut créer/modifier/supprimer une leçon avec un éditeur de contenu riche supportant du code (algorithme + Python).
- [ ] L'admin peut créer/modifier/supprimer un quiz, ajouter/modifier/supprimer des questions, définir seuil de réussite et tentatives max.
- [ ] L'admin peut créer/modifier/supprimer des exercices (type algorithme/python, solution de référence, difficulté).
- [ ] `/admin/overview` affiche des statistiques réelles et à jour de la plateforme.
- [ ] Toutes les routes d'écriture de cette phase sont protégées par le rôle `admin` côté serveur, sans exception.
