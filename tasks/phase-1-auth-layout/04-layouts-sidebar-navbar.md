# Tâche 1.4 — Layouts partagés (sidebar + barre supérieure)

**Phase :** 1 — Authentification & layout
**Dépendances :** [03-routes-protegees-contexte-auth.md](03-routes-protegees-contexte-auth.md)
**Réfs cahier des charges :** §4 (menu profil), §6 (structure commune), §12.1, §12.2

## Objectif

Construire `StudentLayout` et `AdminLayout` : panneau latéral gauche fixe (Drawer MUI) avec navigation, barre supérieure (AppBar) avec recherche/notifications/avatar et menu déroulant, et zone de contenu principale — réutilisés par toutes les pages des espaces étudiant et admin.

## Contexte

Le §6 décrit une mise en page commune à toutes les pages connectées : « Panneau latéral gauche (Drawer MUI) fixe », « Barre supérieure (AppBar) : barre de recherche, cloche de notifications, avatar de profil […] avec menu déroulant ». Les maquettes de référence du client (§1.3, §12.2) servent d'inspiration directe pour cette disposition.

## Étapes détaillées

1. **Composant `Sidebar`** (`components/Sidebar.jsx`, paramétrable par une liste d'items)
   - Logo en haut.
   - Items de navigation avec icônes (`@mui/icons-material`), item actif mis en évidence (utiliser `useLocation` / `NavLink` pour détecter la route active).
   - Items étudiant (§4) : Vue d'ensemble, Cours, Kanban, Notes, Calendrier, Profil.
   - Items admin (§4) : Vue d'ensemble, Utilisateurs, Modules, Leçons, Quiz, Exercices, Paramètres.
   - Encart optionnel en bas avec nom/avatar de l'utilisateur (§12.2).
   - Sur mobile/tablette : sidebar rétractable en menu « hamburger » (Drawer temporaire MUI) — cf. aussi tâche 5.2 (responsive), poser la structure ici, peaufiner ensuite.

2. **Composant `TopBar`** (`components/TopBar.jsx`)
   - Titre de la page courante (peut être passé en prop ou dérivé de la route).
   - Barre de recherche (peut être un simple champ non fonctionnel en Phase 1, branché plus tard si une recherche transverse est décidée — non spécifiée précisément par le cahier des charges au-delà de sa présence visuelle).
   - Icône cloche de notifications (badge, contenu réel optionnel/reporté en Phase 6 §16 « notifications »).
   - **Avatar de profil** avec menu déroulant (`Menu` MUI) :
     - Mon tableau de bord → `/app/overview` ou `/admin/overview` selon le rôle.
     - Mon profil → `/app/profil` (étudiant) — côté admin, gérer son profil se fait via `/admin/parametres` (§7.7).
     - Se déconnecter → appelle `logout()` du `AuthContext` puis redirige vers `/` ou `/connexion` (§5.4).

3. **`StudentLayout`** (`layouts/StudentLayout.jsx`)
   - Compose `Sidebar` (items étudiant) + `TopBar` + zone de contenu (`<Outlet />`).

4. **`AdminLayout`** (`layouts/AdminLayout.jsx`)
   - Compose `Sidebar` (items admin) + `TopBar` + zone de contenu (`<Outlet />`).

5. **Câblage** dans `AppRouter.jsx` : `StudentLayout` comme layout parent des routes `/app/*`, `AdminLayout` pour `/admin/*` (à l'intérieur des gardes `ProtectedRoute`/`RoleRoute` de la tâche 1.3).

6. **Pages placeholders** pour chaque route du sitemap (§4) qui n'existe pas encore (ex. `/app/kanban`, `/admin/utilisateurs`…) — un simple composant « Page à venir » par route, remplacé au fil des phases suivantes. Cela permet de valider toute la navigation dès la fin de la Phase 1.

## Fichiers à créer / modifier

```
client/src/
├── components/Sidebar.jsx
├── components/TopBar.jsx
├── components/ProfileMenu.jsx        # extrait du TopBar si utile
├── layouts/StudentLayout.jsx
├── layouts/AdminLayout.jsx
└── pages/{student,admin}/*.jsx       # placeholders pour chaque route du §4
```

## Règles métier / cas limites

- Le menu déroulant du profil est présent « sur toutes les pages connectées » (§4) — s'assurer qu'il est bien dans le layout partagé, pas dupliqué page par page.
- L'item de navigation actif doit refléter fidèlement l'URL courante, y compris sur les sous-routes (ex. `/app/cours/algorithmique/les-boucles` doit garder « Cours » actif dans la sidebar).

## Critères d'acceptation

- [ ] Toutes les routes du sitemap étudiant et admin (§4) sont navigables depuis la sidebar correspondante, sans 404.
- [ ] Le menu déroulant du profil fonctionne sur toutes les pages connectées et propose bien les 3 actions attendues.
- [ ] Se déconnecter depuis n'importe quelle page connectée ramène vers `/` ou `/connexion` et empêche un retour arrière navigateur vers une page protégée sans se reconnecter.
- [ ] L'item de sidebar correspondant à la page affichée est visuellement mis en évidence.
- [ ] Sur une largeur mobile, la sidebar se transforme en menu hamburger accessible.
