# Suivi d'avancement — Plateforme « Bac Informatique »

Coche les tâches au fur et à mesure. Se référer à [tasks/README.md](tasks/README.md) pour le détail de chaque tâche.

> Dernière mise à jour : 2026-09-05 (tâche 5.5 terminée)

## Phase 0 — Fondations
- [x] 0.1 — Initialisation du monorepo
- [x] 0.2 — Configuration du serveur Express
- [x] 0.3 — Modèles Mongoose
- [x] 0.4 — Script de seed (admin + données de démonstration)
- [x] 0.5 — Ossature React et thème MUI

## Phase 1 — Authentification & layout
- [x] 1.1 — API d'authentification
- [x] 1.2 — Pages Inscription / Connexion (frontend)
- [x] 1.3 — Contexte d'authentification et routes protégées
- [x] 1.4 — Layouts partagés (sidebar + barre supérieure)
- [x] 1.5 — Landing page publique

## Phase 2 — Cœur pédagogique (espace étudiant)
- [x] 2.1 — API Modules & Sous-modules (lecture élève)
- [x] 2.2 — API Leçons (lecture élève)
- [x] 2.3 — API Quiz (lecture élève, sans les réponses)
- [x] 2.4 — API Exercices (lecture élève, verrouillage serveur)
- [x] 2.5 — API Progression & logique de déverrouillage
- [x] 2.6 — Frontend : liste des modules et sous-modules
- [x] 2.7 — Frontend : unité d'apprentissage (onglets Leçon / Quiz / Exercices)
- [x] 2.8 — Éditeur de code (mode Algorithme + mode Python)
- [x] 2.9 — Frontend : Vue d'ensemble étudiant (`/app/overview`)

## Phase 3 — Outils personnels
- [x] 3.1 — Kanban (`/app/kanban`)
- [x] 3.2 — Notes autocollantes (`/app/notes`)
- [x] 3.3 — Calendrier (`/app/calendrier`)
- [x] 3.4 — Profil utilisateur (`/app/profil`)

## Phase 4 — Espace administrateur
- [x] 4.1 — API Statistiques admin
- [x] 4.2 — Frontend : Vue d'ensemble admin (`/admin/overview`)
- [x] 4.3 — Gestion des utilisateurs (`/admin/utilisateurs`)
- [x] 4.4 — Gestion des modules & sous-modules (`/admin/modules`)
- [x] 4.5 — Gestion des leçons (`/admin/lecons`)
- [x] 4.6 — Gestion des quiz (`/admin/quiz`)
- [x] 4.7 — Gestion des exercices (`/admin/exercices`)
- [x] 4.8 — Paramètres généraux (`/admin/parametres`)

## Phase 5 — Finitions
- [x] 5.1 — Système de niveaux (XP)
- [x] 5.2 — Responsive (mobile / tablette / desktop) *(audit statique — voir note ci-dessous)*
- [x] 5.3 — États UX (chargement, vides, erreurs, confirmations)
- [x] 5.4 — Sécurité renforcée (audit)
- [x] 5.5 — Tests et livrables documentaires

## Phase 6 — Évolutions (V2, hors périmètre initial)
- [x] 6.1 — Exécution automatique du code Python (V2)
- [x] 6.2 — Mot de passe oublié
- [x] 6.3 — Badges/récompenses et notifications

---

## Ajouts hors plan
- [x] Import de contenu par fichier JSON (Admin → Import)
- [x] Contenu pédagogique complété (Algorithmique 9 sous-modules, STI 5)
- [x] Préparation production (Docker, validation de config, SPA servie par l'API)

## Prochaine étape
Phase 5 terminée. Il ne reste que la Phase 6 (évolutions V2, explicitement hors périmètre initial du cahier des charges) : 6.1 exécution automatique du code Python, 6.2 mot de passe oublié, 6.3 badges/récompenses.

> **Note sur la tâche 5.5** : suite de tests backend (Jest + Supertest, 39 tests) sur une instance MongoDB éphémère dédiée (`mongodb-memory-server`, réutilise un `mongod` système si disponible pour éviter tout téléchargement) — jamais la base de `.env`. Couvre `gradeQuiz` (les 4 types de question + seuil exact de `passingScore`), `computeLevel` (paliers XP), le déverrouillage progressif leçon → quiz → exercices (y compris `403` sur accès prématuré et sur tentatives de quiz épuisées), l'authentification (doublon e-mail, mauvais mot de passe, compte désactivé, token invalide/expiré), le middleware de rôle sur un représentant de chaque module admin, et l'isolation des données Tâches/Notes/Événements entre deux élèves réels. Le rate-limiter (`authLimiter`, 10 req/15 min) est désactivé quand `NODE_ENV=test` — sans ça la suite elle-même (qui crée largement plus de 10 comptes) se serait fait bloquer par la protection anti-brute-force qu'elle est censée vérifier ailleurs. Livrables documentaires : [server/API.md](server/API.md) (liste exhaustive des endpoints réellement implémentés, relue contre le code plutôt que recopiée du §11 du cahier des charges, qui omettait `manage/*`, le réordonnancement, les réglages et la réinitialisation de mot de passe) et [README.md](README.md) racine finalisé (installation, variables d'environnement, lancement, tests).

> **Note sur la tâche 5.4** : audit complet des 9 points du §15, avec retests réels contre l'API en cours d'exécution (pas seulement une relecture de code) — voir [server/SECURITY_CHECKLIST.md](server/SECURITY_CHECKLIST.md) pour le détail complet. Correctifs appliqués : `auth.js` ne sélectionne plus jamais `passwordHash` sur `req.user` (il ne servait qu'à un seul endpoint qui le re-sélectionne déjà lui-même) ; ajout de bornes `maxlength` sur les champs texte libres de `Note`/`Task`/`Event`. Tout le reste (middlewares d'autorisation sur chaque route, isolation des données par utilisateur, non-fuite des réponses de quiz, garde-fous d'upload d'avatar) a été vérifié conforme — y compris via des tests croisés à deux comptes réels et des tentatives d'escalade de rôle en direct.

> **Note sur la tâche 5.2** : aucun navigateur n'est disponible dans cet environnement d'exécution. Le travail effectué est un audit *statique* (relecture du code : usage de `theme.breakpoints`, grilles `xs/sm/md/lg`, `Stack` avec `flexWrap`) plutôt qu'un test manuel réel à chaque breakpoint comme le demandent les critères d'acceptation de la tâche. Corrections apportées : vue Jour + barre d'outils condensée sur mobile pour le calendrier (`Calendrier.jsx`), colonnes secondaires masquées sur mobile pour le DataGrid utilisateurs (`Utilisateurs.jsx`). Le reste des pages utilisait déjà des grilles responsives cohérentes (aucune anomalie statique trouvée). **Une vérification manuelle sur un vrai navigateur/appareil reste nécessaire avant de considérer cette tâche définitivement close.**

> **Note sur la tâche 5.3** : audit systématique (grille de couverture LoadingSpinner/EmptyState/ConfirmDialog/Snackbar sur les 15 pages asynchrones) qui a révélé et corrigé de vrais bugs, pas seulement une relecture superficielle :
> - `Kanban.jsx` et `Notes.jsx` : une erreur de mutation (glisser-déposer, suppression) après le chargement initial ne s'affichait **nulle part** — `error` n'était rendu que dans le cas "écran encore vide". Ajout d'une `Alert` persistante + `Snackbar` de succès pour les actions destructives/créations (pas sur `Notes.handleUpdate`, appelé trop souvent — sauvegarde automatique silencieuse assumée).
> - `LessonTab.jsx` : un échec de « J'ai terminé la leçon » remplaçait **toute la leçon déjà affichée** par un écran d'erreur générique (le check `if (error)` bloquant passait avant celui du chargement) — pire qu'un silence, un affichage cassé. Séparé en deux états (`error` pour le chargement initial, `completeError` pour l'action), à l'image de `QuizTab.jsx` qui avait déjà le bon pattern.
> - `Modules.jsx` (admin) : seule page CRUD admin sans `Snackbar` de succès (créer/modifier/supprimer module ou sous-module) — désormais alignée sur `Utilisateurs.jsx`/`Lecons.jsx`/`Quiz.jsx`/`Exercices.jsx`.
> - Vérifié sans anomalie : confirmations de suppression présentes partout (dialogue modal pour Kanban/Calendrier/admin, confirmation allégée à deux clics assumée pour les notes vu leur faible enjeu), tooltips de verrouillage cohérents (`title` natif) sur les onglets Quiz/Exercices, et les autres pages où `if (error)` bloque le rendu ne le font qu'à partir de l'échec du chargement initial (rien à perdre à l'écran à ce moment-là).
