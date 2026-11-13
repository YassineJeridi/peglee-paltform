# Tâche 1.3 — Contexte d'authentification et routes protégées

**Phase :** 1 — Authentification & layout
**Dépendances :** [01-api-authentification.md](01-api-authentification.md)
**Réfs cahier des charges :** §9.6, §5.4

## Objectif

Créer un `AuthContext` React global qui expose l'utilisateur courant, l'état de chargement initial, et les fonctions `login`/`register`/`logout` ; créer les composants `ProtectedRoute` (nécessite d'être connecté) et `RoleRoute` (nécessite un rôle précis) qui encapsulent les sous-arbres de routes `/app/*` et `/admin/*`.

## Contexte

Le §9.6 est explicite : « Côté React : composant `ProtectedRoute` (redirige vers `/connexion` si non connecté) et `RoleRoute` (redirige si le rôle ne correspond pas) ». C'est le pendant frontend des middlewares `auth`/`role` créés côté serveur (tâche 1.1) — **rappel de sécurité** : ces protections côté client sont un confort UX, la sécurité réelle reste imposée par le serveur.

## Étapes détaillées

1. **`AuthContext`** (`context/AuthContext.jsx`)
   - État : `user` (objet ou `null`), `isLoading` (vrai pendant la vérification initiale), `isAuthenticated` (dérivé).
   - Au montage de l'app : appeler `GET /api/auth/me` pour restaurer la session (si cookie httpOnly valide, ou token en mémoire perdu au refresh — comportement à documenter selon la stratégie retenue en tâche 1.1).
   - Fonctions exposées : `login(credentials)`, `register(data)`, `logout()` — appellent `api/authApi.js` et mettent à jour `user`.
   - Hook `useAuth()` pour consommer le contexte facilement.

2. **Intercepteurs Axios** (`api/axiosInstance.js`, complète la tâche 0.5)
   - Si stratégie cookie httpOnly : `withCredentials: true` sur l'instance.
   - Si stratégie token en mémoire : intercepteur de requête qui ajoute `Authorization: Bearer <token>`.
   - Intercepteur de réponse : sur `401`, forcer la déconnexion locale (`user = null`) et rediriger vers `/connexion`.

3. **`ProtectedRoute`** (`routes/ProtectedRoute.jsx`)
   - Consomme `useAuth()`. Pendant `isLoading`, afficher un spinner plein écran (pas de flash de redirection prématurée).
   - Si non authentifié : `<Navigate to="/connexion" replace />`.
   - Sinon : rend les routes enfants (`<Outlet />`).

4. **`RoleRoute`** (`routes/RoleRoute.jsx`)
   - Prend une prop `allowedRoles` (ex. `['admin']`).
   - Si le rôle de `user` n'est pas autorisé : rediriger vers le dashboard correspondant à son vrai rôle (pas une simple page d'erreur générique — évite de perdre l'utilisateur) ou vers une page « Accès refusé » explicite.

5. **Câblage dans le routeur** (`routes/AppRouter.jsx`, créé en tâche 0.5)
   - `/app/*` → `ProtectedRoute` → `RoleRoute allowedRoles={['student']}` → `StudentLayout` (tâche 1.4) → pages étudiant.
   - `/admin/*` → `ProtectedRoute` → `RoleRoute allowedRoles={['admin']}` → `AdminLayout` (tâche 1.4) → pages admin.
   - `/`, `/connexion`, `/inscription` : si déjà authentifié, rediriger automatiquement vers le dashboard du rôle (§5.1 : « Si un utilisateur déjà connecté ouvre `/`, il est redirigé vers son dashboard »).

## Fichiers à créer / modifier

```
client/src/
├── context/AuthContext.jsx
├── hooks/useAuth.js               # ou exporté directement depuis AuthContext.jsx
├── routes/ProtectedRoute.jsx
├── routes/RoleRoute.jsx
├── routes/AppRouter.jsx           # mise à jour avec la logique de garde
└── api/axiosInstance.js           # mise à jour (intercepteurs)
```

## Règles métier / cas limites

- Ne jamais considérer la protection côté client comme suffisante — chaque appel API sensible doit être protégé côté serveur indépendamment (déjà couvert tâche 1.1, mais à rappeler pour chaque nouvelle route créée dans les phases suivantes).
- Éviter le flash de contenu protégé avant vérification (toujours attendre la résolution de `isLoading` avant de décider de rediriger).
- La redirection post-login doit tenir compte d'une éventuelle page initialement demandée (ex. lien profond partagé) si le temps le permet — sinon, redirection simple vers l'overview du rôle est acceptable pour le MVP.

## Critères d'acceptation

- [ ] Accéder à `/app/overview` sans être connecté redirige vers `/connexion`.
- [ ] Accéder à `/admin/overview` avec un compte `student` redirige (pas de page blanche, pas d'erreur JS).
- [ ] Rafraîchir la page (`F5`) sur une route protégée alors qu'on est connecté ne déconnecte pas l'utilisateur.
- [ ] Ouvrir `/` en étant déjà connecté redirige automatiquement vers `/app/overview` ou `/admin/overview` selon le rôle.
- [ ] Une réponse `401` d'un appel API quelconque force une déconnexion propre et une redirection vers `/connexion`.
