# Tâches — Plateforme « Bac Informatique »

Ce dossier découpe le [cahier des charges](../Cahier_des_Charges_Plateforme_Bac_Informatique.md) en tâches de développement concrètes, ordonnées et détaillées. Chaque tâche est un fichier Markdown autonome que l'équipe (ou un développeur seul) peut prendre en charge sans avoir à relire tout le cahier des charges.

## Comment utiliser ce dossier

- Les tâches sont regroupées en **7 phases** (`phase-0-fondations` → `phase-6-evolutions`), qui reprennent la roadmap indicative du §16 du cahier des charges.
- Chaque dossier de phase contient un fichier `00-vue-ensemble.md` qui résume l'objectif de la phase, ses prérequis et la liste ordonnée de ses tâches.
- Les tâches sont numérotées **dans l'ordre recommandé d'exécution** au sein d'une phase, mais certaines peuvent être menées en parallèle (précisé dans chaque fichier via « Dépendances »).
- Chaque fichier de tâche suit la même structure :
  - **Objectif** — ce que la tâche doit produire.
  - **Contexte** — pourquoi, et ce qu'il faut comprendre du cahier des charges.
  - **Dépendances** — tâches qui doivent être terminées avant.
  - **Étapes détaillées** — le déroulé concret, backend puis frontend si pertinent.
  - **Fichiers à créer / modifier** — arborescence indicative (voir §9.4 du cahier des charges).
  - **Modèles de données concernés** — schémas Mongoose impliqués (voir §10).
  - **Endpoints API concernés** — routes REST impliquées (voir §11).
  - **Règles métier / cas limites** — points de vigilance, sécurité, validations.
  - **Critères d'acceptation** — checklist de definition of done.
  - **Réfs cahier des charges** — sections précises à relire en cas de doute.

## Ordre global des phases

| Phase | Dossier | Contenu |
|---|---|---|
| 0 | [phase-0-fondations](phase-0-fondations/00-vue-ensemble.md) | Initialisation du monorepo, config backend, modèles Mongoose, seed, thème MUI. |
| 1 | [phase-1-auth-layout](phase-1-auth-layout/00-vue-ensemble.md) | Authentification (JWT), landing page, layouts étudiant/admin, routes protégées. |
| 2 | [phase-2-pedagogique](phase-2-pedagogique/00-vue-ensemble.md) | Cœur pédagogique : modules → sous-modules → leçon/quiz/exercices, déverrouillage, progression, overview élève. |
| 3 | [phase-3-outils-personnels](phase-3-outils-personnels/00-vue-ensemble.md) | Kanban, notes autocollantes, calendrier, profil utilisateur. |
| 4 | [phase-4-admin](phase-4-admin/00-vue-ensemble.md) | Espace administrateur complet : utilisateurs, contenu pédagogique, statistiques, paramètres. |
| 5 | [phase-5-finitions](phase-5-finitions/00-vue-ensemble.md) | Système XP/niveaux, responsive, états UX, sécurité renforcée, tests. |
| 6 | [phase-6-evolutions](phase-6-evolutions/00-vue-ensemble.md) | Évolutions V2 (hors périmètre initial) : exécution de code, mot de passe oublié, badges/notifications. |

## Principes transverses à respecter dans toutes les tâches

Ces règles, définies dans le cahier des charges, s'appliquent à **toutes** les tâches ci-dessous et ne sont pas répétées à chaque fois :

- **Langue** : toute l'interface, tous les messages (y compris erreurs) sont en **français** (§1.2, §14).
- **Rôles** : uniquement `student` et `admin`. Aucune interface ne permet de s'auto-attribuer `admin` (§3, §115).
- **Sécurité serveur d'abord** : toute règle de déverrouillage, de rôle ou de propriété des données doit être vérifiée **côté serveur**, jamais seulement côté client (§11.6, §15).
- **Isolation des données** : un élève n'accède jamais aux tâches/notes/événements/progression d'un autre élève — filtrage systématique par `userId` (§15).
- **Stack imposée** : React + MUI (front), Node.js/Express + MongoDB/Mongoose (back), JWT + bcrypt (auth) — voir [phase-0-fondations/01-initialisation-projet.md](phase-0-fondations/01-initialisation-projet.md) et §9.
- **UI** : moderne, épurée, cartes, coins arrondis, beaucoup d'espace blanc, sidebar gauche + barre supérieure (§1.3, §12).

## Points encore ouverts

Voir [points-a-confirmer.md](points-a-confirmer.md) : questions client (§18.2 du cahier des charges) qui influencent certaines tâches (seuils par défaut, palette définitive, stockage des photos, etc.). À trancher idéalement avant ou pendant la Phase 0 / Phase 2.
