# Tâche 1.5 — Landing page publique

**Phase :** 1 — Authentification & layout
**Dépendances :** [phase-0-fondations/05-setup-frontend-theme-mui.md](../phase-0-fondations/05-setup-frontend-theme-mui.md) ; redirection utilisateur connecté nécessite [03-routes-protegees-contexte-auth.md](03-routes-protegees-contexte-auth.md)
**Réfs cahier des charges :** §5.1

## Objectif

Construire la page vitrine `/` : navbar publique, hero, sections fonctionnalités/modules/comment ça marche, pied de page — entièrement responsive, avec redirection automatique des utilisateurs déjà connectés vers leur dashboard.

## Contexte

Objectif métier explicite du §5.1 : « convaincre et diriger vers l'inscription ». C'est la seule page réellement « marketing » de la plateforme ; le reste de l'interface est utilitaire (dashboards).

## Étapes détaillées

Construire les sections dans l'ordre du §5.1, chacune comme composant dédié pour rester lisible :

1. **`Navbar` publique** (`components/public/PublicNavbar.jsx`) — logo, liens d'ancrage (Fonctionnalités, Modules, À propos) avec scroll fluide vers les sections, boutons **Se connecter** (→ `/connexion`) / **S'inscrire** (→ `/inscription`).
2. **`Hero`** (`components/public/Hero.jsx`) — titre accrocheur, sous-titre, illustration (SVG/image), bouton CTA « Commencer maintenant » → `/inscription`.
3. **`FeaturesSection`** — cartes : cours structurés, quiz & exercices, suivi de progression, organisation (kanban/notes/calendrier).
4. **`ModulesSection`** — présentation des modules disponibles (Algorithmique, STI…) ; peut être statique en V1 ou tirer les modules réels via `GET /api/modules` public si l'endpoint le permet (à valider — le cahier des charges classe `GET /api/modules` comme 🔒 au §11.3 ; pour la landing, un contenu statique/illustratif est suffisant et évite d'exposer un endpoint protégé publiquement).
5. **`HowItWorksSection`** — 3-4 étapes : S'inscrire → Étudier → S'entraîner → Progresser.
6. **`TestimonialsSection`** (optionnelle, §5.1) — peut être omise en V1 sans impact fonctionnel.
7. **`Footer`** — liens, mentions, contact.

8. **Page `Landing.jsx`** (`pages/public/Landing.jsx`, route `/`) assemblant toutes les sections.

9. **Redirection utilisateur connecté** : dans `Landing.jsx` ou au niveau du routeur, si `useAuth().isAuthenticated`, rediriger immédiatement vers `/app/overview` ou `/admin/overview` selon le rôle (§5.1, dernière ligne) — logique déjà posée en tâche 1.3, s'assurer qu'elle couvre bien la route `/`.

10. **Responsive** : tester explicitement mobile/tablette/desktop (§5.1 « Entièrement responsive »).

## Fichiers à créer / modifier

```
client/src/
├── pages/public/Landing.jsx
└── components/public/
    ├── PublicNavbar.jsx
    ├── Hero.jsx
    ├── FeaturesSection.jsx
    ├── ModulesSection.jsx
    ├── HowItWorksSection.jsx
    ├── TestimonialsSection.jsx    (optionnel)
    └── Footer.jsx
```

## Règles métier / cas limites

- Les boutons Se connecter/S'inscrire doivent être visibles sans scroll sur mobile (dans la navbar ou un menu hamburger dédié à la landing, distinct de celui des dashboards).
- Ne pas exposer de données réelles d'élèves ou de contenu pédagogique protégé sur cette page publique.

## Critères d'acceptation

- [ ] La page `/` s'affiche correctement sur mobile, tablette et desktop.
- [ ] Les liens d'ancrage (Fonctionnalités, Modules, À propos) scrollent vers la bonne section.
- [ ] Les boutons Se connecter/S'inscrire redirigent vers `/connexion`/`/inscription`.
- [ ] Le CTA du hero redirige vers `/inscription`.
- [ ] Un utilisateur connecté qui ouvre `/` est redirigé sans avoir à cliquer sur quoi que ce soit.
