# Tâche 4.8 — Paramètres généraux (`/admin/parametres`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md), [phase-3-outils-personnels/04-profil-utilisateur.md](../phase-3-outils-personnels/04-profil-utilisateur.md) (réutilise la logique de gestion de profil pour la partie « profil admin »)
**Réfs cahier des charges :** §7.7, points-a-confirmer.md #2/#3

## Objectif

Page de paramètres généraux de la plateforme (seuil de réussite par défaut, nombre de tentatives par défaut, activation/désactivation de fonctionnalités) et gestion du profil personnel de l'administrateur.

## Contexte

Le §7.7 regroupe deux préoccupations distinctes : des **réglages globaux de la plateforme** (qui servent de valeurs par défaut proposées lors de la création d'un nouveau quiz, tâche 4.6) et la **gestion du propre profil** de l'admin connecté (équivalent admin de la tâche 3.4).

## Étapes détaillées — Backend

1. **Modèle de configuration** — le cahier des charges ne définit pas explicitement de schéma pour ces paramètres globaux (absent du §10) ; créer un modèle simple `Settings` (singleton, un seul document en base) avec au minimum : `defaultPassingScore` (Number, défaut 60), `defaultMaxAttempts` (Number, défaut 0), et des flags de fonctionnalités (`Boolean`) si des fonctionnalités optionnelles doivent pouvoir être activées/désactivées (ex. plus tard : exécution de code, badges — Phase 6).
2. **`GET /api/admin/settings`** 👑 — renvoie le document de configuration (le créer avec des valeurs par défaut s'il n'existe pas encore, upsert transparent).
3. **`PUT /api/admin/settings`** 👑 — met à jour la configuration.
4. **Usage des valeurs par défaut** — au moment de la création d'un nouveau quiz sans `passingScore`/`maxAttempts` explicites (tâche 4.6), pré-remplir avec `defaultPassingScore`/`defaultMaxAttempts` lus depuis `Settings` plutôt que des constantes codées en dur — c'est ce qui rend ces réglages réellement utiles.
5. **Profil admin** : réutiliser directement les endpoints `PUT /api/users/me`, `PUT /api/users/me/password`, `POST /api/users/me/avatar` de la tâche 3.4 (déjà génériques par rôle, aucun endpoint dupliqué nécessaire).

## Étapes détaillées — Frontend

1. **Service API** (`api/adminSettingsApi.js`).
2. **Page `AdminParametres.jsx`** (`pages/admin/AdminParametres.jsx`, route `/admin/parametres`)
   - Section « Paramètres pédagogiques » : `defaultPassingScore` (slider/champ %), `defaultMaxAttempts`, toggles de fonctionnalités.
   - Section « Mon profil » : réutiliser le composant/la logique de `Profil.jsx` (tâche 3.4) — soit en l'importimportant directement, soit en extrayant un composant `ProfileForm` partagé entre `/app/profil` et `/admin/parametres` pour éviter la duplication de code.

## Fichiers à créer / modifier

```
server/src/
├── models/Settings.js
├── controllers/adminSettingsController.js
└── routes/adminSettingsRoutes.js

client/src/
├── api/adminSettingsApi.js
└── pages/admin/AdminParametres.jsx
```

## Modèles de données concernés

`Settings` (nouveau, non défini explicitement au §10 — extension raisonnable), `User` (pour la partie profil, §10.1).

## Endpoints API concernés

Non listés explicitement au §11 du cahier des charges (extension nécessaire) : `GET/PUT /api/admin/settings` 👑. Réutilise aussi `PUT /api/users/me`, `PUT /api/users/me/password`, `POST /api/users/me/avatar` (§11.2).

## Règles métier / cas limites

- `defaultPassingScore` doit rester entre 0 et 100 ; `defaultMaxAttempts` ≥ 0.
- Modifier les valeurs par défaut n'affecte **pas rétroactivement** les quiz déjà créés (chaque quiz garde son propre `passingScore`/`maxAttempts` explicite en base, cf. tâche 4.6) — seulement les nouveaux quiz créés sans valeur spécifiée.

## Critères d'acceptation

- [ ] Modifier `defaultPassingScore` change bien la valeur pré-remplie lors de la création d'un nouveau quiz, sans affecter les quiz existants.
- [ ] L'admin peut modifier son propre username/email/mot de passe/avatar depuis cette page.
- [ ] Toute tentative d'accès par un compte `student` échoue en `403`.
