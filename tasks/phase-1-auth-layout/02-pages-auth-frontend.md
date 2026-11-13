# Tâche 1.2 — Pages Inscription / Connexion (frontend)

**Phase :** 1 — Authentification & layout
**Dépendances :** [01-api-authentification.md](01-api-authentification.md), [phase-0-fondations/05-setup-frontend-theme-mui.md](../phase-0-fondations/05-setup-frontend-theme-mui.md)
**Réfs cahier des charges :** §5.2, §5.3, §5.4, §9.2 (react-hook-form/zod)

## Objectif

Construire les pages `/inscription` et `/connexion` avec formulaires validés, appels API, gestion des erreurs affichées en français, et redirections post-authentification correctes selon le rôle.

## Contexte

Ces pages sont la première interaction concrète de l'utilisateur avec la plateforme. Le cahier des charges impose une validation double (client + serveur, §5.2) et des messages d'erreur clairs en français.

## Étapes détaillées

1. **Installer** `react-hook-form` et `zod` (+ `@hookform/resolvers`) si pas déjà fait.

2. **Page Inscription** (`pages/public/Register.jsx`, route `/inscription`)
   - Champs : `username`, `email`, `password`, `confirmPassword` (§5.2).
   - Schéma `zod` : username requis, email valide, password ≥ 8 caractères, confirmPassword === password (`.refine`).
   - Soumission : appel `POST /api/auth/register` via le service API (créer `api/authApi.js`).
   - Gestion des erreurs serveur (ex. email déjà utilisé) affichées sous le champ concerné ou en bandeau, en français.
   - Succès : connexion automatique + redirection vers `/app/overview` (§5.2) — utiliser `AuthContext` (tâche 1.3) pour stocker l'état connecté.
   - Lien vers `/connexion` pour un utilisateur déjà inscrit.

3. **Page Connexion** (`pages/public/Login.jsx`, route `/connexion`)
   - Champs : `email`, `password`.
   - Soumission : appel `POST /api/auth/login`.
   - Message d'erreur générique en cas d'échec (« E-mail ou mot de passe incorrect ») — reprendre tel quel le message renvoyé par le serveur (tâche 1.1), ne pas le réinterpréter côté client.
   - Succès : redirection selon `role` renvoyé par l'API — `student` → `/app/overview`, `admin` → `/admin/overview` (§5.3).
   - Lien « Mot de passe oublié ? » visible mais menant à un état « fonctionnalité à venir » (reporté en Phase 6, §5.3) — ne pas le cacher, mais ne pas l'implémenter ici.
   - Lien vers `/inscription`.

4. **UX des formulaires**
   - États de chargement (bouton en `loading` pendant la requête, désactivé pour éviter double-soumission).
   - Affichage des erreurs de validation par champ, en français, sous le champ concerné.
   - Snackbar ou alerte MUI pour les erreurs globales (ex. erreur réseau).

5. **Design**
   - Suivre la charte du §12 : cartes, coins arrondis, espace blanc, cohérent avec le thème centralisé (tâche 0.5).

## Fichiers à créer / modifier

```
client/src/
├── pages/public/Register.jsx
├── pages/public/Login.jsx
├── api/authApi.js              # register(), login(), logout(), me()
└── (composants de formulaire partagés si utile, ex. FormTextField.jsx)
```

## Endpoints API concernés

`POST /api/auth/register`, `POST /api/auth/login` (§11.1).

## Règles métier / cas limites

- La validation client ne remplace jamais la validation serveur — elle sert seulement à donner un retour immédiat à l'utilisateur.
- Ne jamais afficher un message qui distingue « email inconnu » de « mot de passe incorrect ».
- Le formulaire d'inscription ne doit exposer aucun moyen de choisir un rôle.

## Critères d'acceptation

- [ ] Soumettre le formulaire d'inscription avec des mots de passe non identiques affiche une erreur claire sans appeler l'API.
- [ ] Une inscription réussie connecte automatiquement l'utilisateur et l'amène sur `/app/overview`.
- [ ] Une inscription avec un email déjà pris affiche le message renvoyé par le serveur.
- [ ] Une connexion réussie redirige vers `/app/overview` (student) ou `/admin/overview` (admin) selon le compte utilisé.
- [ ] Une connexion échouée affiche « E-mail ou mot de passe incorrect » sans préciser lequel.
- [ ] Les deux pages sont responsives (mobile/desktop) et suivent la charte graphique.
