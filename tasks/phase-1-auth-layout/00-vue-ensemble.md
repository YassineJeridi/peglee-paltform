# Phase 1 — Authentification & layout

**Réfs cahier des charges :** §16 (Phase 1), §3 (Acteurs et rôles), §4 (Sitemap), §5 (Espace public), §6 (structure commune), §9.6.

## Objectif de la phase

Construire le parcours complet non-connecté (landing, inscription, connexion), le système d'authentification JWT de bout en bout, les routes protégées par rôle, et les layouts partagés (sidebar + barre supérieure) utilisés par tout l'espace étudiant et tout l'espace admin. À la fin de cette phase, un visiteur peut s'inscrire, se connecter, atterrir sur un dashboard vide mais structuré (sidebar + navbar + menu profil), et se déconnecter.

## Prérequis

Phase 0 terminée : modèles Mongoose (`User`), serveur Express configuré, seed admin disponible, thème MUI et routage de base en place.

## Tâches de la phase (ordre recommandé)

1. [01-api-authentification.md](01-api-authentification.md) — Endpoints `register`/`login`/`logout`/`me`, hachage bcrypt, JWT.
2. [02-pages-auth-frontend.md](02-pages-auth-frontend.md) — Pages Inscription / Connexion (formulaires, validation, appels API).
3. [03-routes-protegees-contexte-auth.md](03-routes-protegees-contexte-auth.md) — `AuthContext`, `ProtectedRoute`, `RoleRoute`, intercepteurs Axios.
4. [04-layouts-sidebar-navbar.md](04-layouts-sidebar-navbar.md) — `StudentLayout` / `AdminLayout` : sidebar gauche, barre supérieure, menu profil déroulant.
5. [05-landing-page.md](05-landing-page.md) — Page vitrine publique (`/`).

Ordre de dépendance : 1 → (2 et 3 en parallèle, 3 a besoin des endpoints de 1) → 4 (a besoin de 3) → 5 (indépendante, peut être faite à tout moment après la tâche 1, y compris en parallèle des autres).

## Definition of done de la phase

- [ ] Un visiteur peut s'inscrire depuis `/inscription`, est automatiquement `student`, et atterrit sur `/app/overview` (même vide/placeholder).
- [ ] Un utilisateur peut se connecter depuis `/connexion` et est redirigé selon son rôle (`student` → `/app/overview`, `admin` → `/admin/overview`).
- [ ] Se déconnecter invalide la session côté client et redirige vers `/` ou `/connexion`.
- [ ] Toute tentative d'accès direct à une URL `/app/*` sans être connecté redirige vers `/connexion`.
- [ ] Toute tentative d'accès à `/admin/*` par un compte `student` (ou l'inverse) est bloquée, côté client **et** côté serveur.
- [ ] Les layouts étudiant et admin affichent la sidebar, la barre supérieure avec recherche/notifications/avatar, et le menu déroulant (Tableau de bord / Profil / Déconnexion).
- [ ] La landing page est publique, responsive, et redirige un utilisateur déjà connecté vers son dashboard.
