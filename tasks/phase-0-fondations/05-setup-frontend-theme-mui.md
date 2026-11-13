# Tâche 0.5 — Ossature React et thème MUI

**Phase :** 0 — Fondations
**Dépendances :** [01-initialisation-projet.md](01-initialisation-projet.md) (peut être menée en parallèle des tâches 0.2-0.4)
**Réfs cahier des charges :** §1.3, §9.1, §9.2, §9.4, §12.1, §12.3

## Objectif

Mettre en place le routage React de base, un thème MUI centralisé conforme à la charte graphique du §12.3, et la structure de dossiers frontend, sans encore de pages fonctionnelles (elles arrivent en Phase 1).

## Contexte

Le principe directeur (§1.3) demande une interface moderne, épurée, cohérente. Centraliser le thème dès maintenant (plutôt que de coder des couleurs/espacements en dur page par page) est ce qui rend cette cohérence possible sur toute la plateforme.

## Étapes détaillées

1. **Thème MUI** (`client/src/theme/`)
   - `palette.js` (ou intégré dans `theme.js`) : reprendre la palette du §12.3 —
     - primaire `#2F5BFF`, secondaire `#22C55E`, erreur `#EF4444`, warning `#F59E0B`, fond `#F7F8FA`, surface `#FFFFFF`, texte principal `#0F172A`, texte secondaire `#64748B`, bordures `#E5E7EB`.
     - **Note :** palette « à valider » côté client (voir [points-a-confirmer.md](../../points-a-confirmer.md) #4) — l'implémenter comme un objet de config isolé et facilement remplaçable.
   - Typographie : police **Inter** ou **Poppins** (l'importer via `@fontsource` ou Google Fonts), titres en semi-bold, corps en regular.
   - `shape.borderRadius` entre 8 et 16 px (cartes, boutons, champs).
   - Exporter un thème MUI unique via `createTheme()` dans `client/src/theme/index.js`.
   - Envelopper l'app dans `<ThemeProvider theme={theme}><CssBaseline />…</ThemeProvider>` au niveau racine (`main.jsx`).

2. **Routage** (`client/src/routes/`)
   - Installer et configurer `react-router-dom`.
   - Définir le squelette des routes (sans pages réelles pour l'instant, des placeholders suffisent) reprenant le sitemap du §4 : `/`, `/connexion`, `/inscription`, `/app/*`, `/admin/*`.
   - Prévoir dès maintenant les emplacements pour `ProtectedRoute` et `RoleRoute` (fichiers créés vides ou avec TODO, implémentés en Phase 1).

3. **Structure de dossiers** (`client/src/`)
   - Créer/consolider : `api/` (service axios de base, `axiosInstance.js` avec `baseURL` pointant sur l'API), `components/`, `layouts/`, `pages/{public,student,admin}/`, `context/`, `hooks/`, `utils/`.
   - `api/axiosInstance.js` : instance Axios centralisée avec `baseURL` (variable d'env `VITE_API_URL`), prête à recevoir un intercepteur JWT en Phase 1.

4. **Variables d'environnement front**
   - `client/.env.example` avec `VITE_API_URL=http://localhost:5000/api`.

5. **Composants de base réutilisables** (amorce seulement, seront enrichis plus tard)
   - Un composant `LoadingSpinner` / `Skeleton` générique et un composant `EmptyState` générique (texte + illustration/icône + action), car requis par de nombreuses pages ultérieures (§12.4) — les créer maintenant évite la duplication plus tard.

## Fichiers à créer / modifier

```
client/src/
├── theme/
│   ├── palette.js
│   ├── typography.js
│   └── index.js
├── routes/
│   └── AppRouter.jsx      (squelette)
├── api/
│   └── axiosInstance.js
├── components/
│   ├── LoadingSpinner.jsx
│   └── EmptyState.jsx
├── layouts/                (vide, peuplé en Phase 1)
├── pages/{public,student,admin}/  (vide, peuplé progressivement)
├── context/
├── hooks/
├── utils/
└── main.jsx                (ThemeProvider + CssBaseline + RouterProvider)
client/.env.example
```

## Règles métier / cas limites

- Toute couleur/espacement utilisé dans l'app doit provenir du thème (`theme.palette...`, `theme.spacing(...)`), pas de valeurs codées en dur dispersées — condition de la cohérence exigée au §12.1.
- Le thème doit rester modifiable en un seul endroit (un seul fichier source de vérité) pour absorber facilement un changement de palette côté client.

## Critères d'acceptation

- [ ] `npm run dev` (client) affiche une page avec la police et les couleurs du thème appliquées (vérifiable sur un composant MUI simple, ex. un `Button`).
- [ ] Naviguer vers `/`, `/connexion`, `/inscription`, `/app`, `/admin` (URLs brutes) affiche des placeholders sans erreur de routage.
- [ ] `axiosInstance` pointe vers `VITE_API_URL` et un appel test vers `GET /api/health` (créé en tâche 0.2) réussit en dev.
- [ ] `LoadingSpinner` et `EmptyState` sont importables et rendus correctement dans une page de test.
