# Tâche 4.3 — Gestion des utilisateurs (`/admin/utilisateurs`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md)
**Réfs cahier des charges :** §3.2, §7.2, §10.1, §10.7, §11.2

## Objectif

Donner à l'admin un contrôle complet sur les comptes utilisateurs : liste filtrable/triable, création, consultation détaillée (avec progression), modification, activation/désactivation, suppression, réinitialisation de mot de passe.

## Contexte

Le §7.2 exige un tableau MUI DataGrid complet avec de nombreuses actions. C'est aussi ici que se matérialise la garantie du §3.2 : « aucune interface publique ne permet de s'auto-attribuer le rôle admin » — la promotion d'un compte en `admin` ne peut se faire **que** depuis cette interface admin elle-même.

## Étapes détaillées — Backend

1. **`GET /api/users`** 👑 — liste paginée avec recherche (username/email), filtres (`role`, `isActive`), tri. Renvoyer `username`, `email`, `role`, `createdAt`, `isActive`, `profilePicture`, et un indicateur de progression synthétique (ex. `progressPercent` global, réutilisant le service de la tâche 2.1).
2. **`GET /api/users/:id`** 👑 — détail complet + progression détaillée (modules, quiz, exercices) — réutiliser/étendre `progressService` pour construire une vue par élève analogue à `GET /api/progress/me` (tâche 2.5) mais paramétrée par `userId` au lieu de `req.user.id`.
3. **`POST /api/users`** 👑 — création manuelle d'un utilisateur par l'admin (y compris, potentiellement, création directe d'un compte `admin` — **seul point d'entrée légitime pour créer un admin en dehors du seed**, §3.2). Hachage du mot de passe identique à l'inscription.
4. **`PUT /api/users/:id`** 👑 — modification (`username`, `email`, `role`, `isActive`). Empêcher qu'un admin se rétrograde lui-même par erreur s'il ne reste plus aucun autre admin (garde-fou recommandé, non explicitement demandé par le cahier des charges mais évite un verrouillage total de la plateforme — à discuter avec l'équipe si jugé hors scope MVP).
5. **`DELETE /api/users/:id`** 👑 — suppression. Décider et documenter le comportement en cascade : supprimer aussi les `Progress`/`Task`/`Note`/`Event`/`QuizAttempt` associés, ou les conserver orphelins — recommandé de nettoyer en cascade pour la cohérence de la base.
6. **Réinitialisation de mot de passe** — endpoint dédié, ex. `POST /api/users/:id/reset-password`, qui génère un nouveau mot de passe temporaire (ou permet à l'admin d'en saisir un) et le hache ; à défaut d'un système d'email (hors périmètre V1, §2.3), afficher le mot de passe temporaire une seule fois à l'admin dans l'interface pour transmission manuelle à l'élève.

## Étapes détaillées — Frontend

1. **Service API** (`api/adminUsersApi.js`).
2. **Page `AdminUtilisateurs.jsx`** (`pages/admin/AdminUtilisateurs.jsx`, route `/admin/utilisateurs`)
   - `@mui/x-data-grid` (§9.2, §7.2) : colonnes avatar, username, e-mail, rôle, date d'inscription, statut, progression.
   - Recherche, tri, filtres (rôle, statut) intégrés au DataGrid ou en barre au-dessus.
   - Actions par ligne : voir détail, modifier, activer/désactiver (toggle rapide), réinitialiser mot de passe, supprimer (avec confirmation, §12.4).
   - Bouton « Créer un utilisateur » → formulaire modale (tous champs, y compris le choix du rôle — c'est le seul endroit de toute l'interface où `role` est éditable).
3. **Page/modale de détail utilisateur** — affiche la progression détaillée (modules, quiz, exercices) façon mini-overview, réutilisant si possible des composants de la tâche 2.9 adaptés en lecture seule pour un `userId` arbitraire.

## Fichiers à créer / modifier

```
server/src/
├── controllers/adminUserController.js
└── routes/adminUserRoutes.js       # ou intégré à userRoutes.js avec préfixe/garde role('admin')

client/src/
├── api/adminUsersApi.js
├── pages/admin/AdminUtilisateurs.jsx
└── components/admin/
    ├── UserFormDialog.jsx
    └── UserDetailPanel.jsx
```

## Modèles de données concernés

`User`, `Progress`, `QuizAttempt` (pour le détail de progression) (§10.1, §10.7, §10.8).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users` 👑 | Liste des utilisateurs (recherche/filtre/pagination). |
| GET | `/api/users/:id` 👑 | Détail + progression. |
| POST | `/api/users` 👑 | Créer un utilisateur. |
| PUT | `/api/users/:id` 👑 | Modifier (rôle, statut…). |
| DELETE | `/api/users/:id` 👑 | Supprimer. |

## Règles métier / cas limites

- Toutes ces routes exigent `role('admin')` — aucune exception.
- Un compte désactivé (`isActive: false`) doit être immédiatement empêché de se connecter (déjà couvert côté login en tâche 1.1, vérifier la cohérence).
- La suppression d'un utilisateur doit être confirmée explicitement (action destructive et irréversible).

## Critères d'acceptation

- [ ] La liste des utilisateurs se filtre/trie/recherche correctement et gère la pagination sur un jeu de données de taille raisonnable.
- [ ] Créer un utilisateur avec le rôle `admin` fonctionne uniquement depuis cette interface.
- [ ] Désactiver un utilisateur l'empêche immédiatement de se connecter.
- [ ] Consulter le détail d'un élève affiche une progression fidèle à son activité réelle.
- [ ] Réinitialiser le mot de passe d'un utilisateur lui permet de se reconnecter avec le nouveau mot de passe.
- [ ] Toutes ces actions échouent avec `403` pour un compte `student` testé directement en API.
