# Tâche 5.2 — Responsive (mobile / tablette / desktop)

**Phase :** 5 — Finitions
**Dépendances :** l'ensemble des pages des phases 1 à 4
**Réfs cahier des charges :** §5.1, §12.1, §14

## Objectif

Auditer et corriger l'ensemble de la plateforme pour garantir une utilisation correcte sur mobile, tablette et desktop, avec une attention particulière à la sidebar (menu hamburger) et aux composants denses (DataGrid admin, calendrier, éditeur de code).

## Contexte

Le responsive a été posé de façon générale dès les premières phases (breakpoints MUI utilisés, sidebar rétractable amorcée en tâche 1.4), mais cette tâche est le passage systématique qui garantit qu'aucune page n'a été oubliée — en particulier les pages denses développées plus tard (admin, calendrier, éditeur de code) qui ont plus de risques de casser sur petit écran.

## Étapes détaillées

1. **Sidebar / navigation** (finalise tâche 1.4) — vérifier que le comportement hamburger fonctionne sur toutes les pages étudiant et admin, pas seulement celles testées initialement.
2. **Page par page**, tester aux breakpoints MUI standards (`xs`, `sm`, `md`, `lg`) :
   - Landing page (§5.1, déjà en partie couverte tâche 1.5) — revalidation.
   - Formulaires auth (tâche 1.2).
   - Overview étudiant et admin (tâches 2.9, 4.2) — les grilles de cartes/graphiques doivent se réempiler proprement en colonne unique sur mobile.
   - Liste des modules/sous-modules et unité d'apprentissage (tâches 2.6, 2.7) — attention particulière à l'éditeur de code (tâche 2.8) qui peut être peu utilisable sur très petit écran ; prévoir a minima un message ou un défilement horizontal propre plutôt qu'un rendu cassé.
   - Kanban (tâche 3.1) — le drag & drop entre colonnes sur mobile est notoirement difficile ; prévoir un défilement horizontal des colonnes ou une vue liste alternative sur petit écran si le drag & drop tactile s'avère peu fiable.
   - Notes (tâche 3.2) — grille de cartes, généralement simple à adapter.
   - Calendrier (tâche 3.3) — FullCalendar propose des options responsive à activer/configurer (vue Jour par défaut sur mobile plutôt que Mois, par exemple).
   - Profil (tâche 3.4).
   - Toutes les pages admin (tâches 4.2 à 4.8) — `@mui/x-data-grid` nécessite une attention particulière (colonnes à masquer/prioriser sur petit écran, ou confirmer que l'admin est un usage principalement desktop et documenter ce choix explicitement, cf. §12.1 « desktop prioritaire, mais utilisable sur tablette et mobile »).
3. **Correctifs transverses** — s'assurer que le thème centralisé (tâche 0.5) est bien utilisé partout pour les espacements responsives (`theme.breakpoints`, `Grid`/`Stack` MUI) plutôt que des media queries ad hoc dispersées.

## Fichiers à créer / modifier

Pas de nouveaux fichiers dédiés — corrections transverses dans les composants/pages déjà créés au fil des phases précédentes.

## Règles métier / cas limites

- « Desktop prioritaire, mais utilisable sur tablette et mobile » (§12.1) — l'objectif n'est pas une parité pixel-perfect sur tous les écrans, mais l'absence de blocage fonctionnel (rien d'inaccessible, rien de cassé visuellement).

## Critères d'acceptation

- [ ] Chaque page listée ci-dessus a été testée manuellement aux breakpoints `xs` (mobile), `sm`/`md` (tablette), `lg`+ (desktop), sans élément coupé, chevauchant ou inaccessible.
- [ ] La sidebar bascule correctement en menu hamburger sur mobile, sur toutes les pages connectées.
- [ ] Aucune action essentielle (créer une tâche Kanban, passer un quiz, etc.) n'est bloquée sur mobile, même si l'ergonomie desktop reste supérieure.
