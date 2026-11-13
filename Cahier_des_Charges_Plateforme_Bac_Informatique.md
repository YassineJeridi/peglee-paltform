# Cahier des Charges — Plateforme d'apprentissage « Bac Informatique »

> **Document de spécification technique et fonctionnelle**
> Destiné à l'équipe de développement.
> Version 1.0

---

## Table des matières

1. [Présentation générale du projet](#1-présentation-générale-du-projet)
2. [Objectifs et périmètre](#2-objectifs-et-périmètre)
3. [Acteurs et rôles](#3-acteurs-et-rôles)
4. [Arborescence des pages (sitemap)](#4-arborescence-des-pages-sitemap)
5. [Spécifications fonctionnelles — Espace public](#5-spécifications-fonctionnelles--espace-public)
6. [Spécifications fonctionnelles — Espace étudiant](#6-spécifications-fonctionnelles--espace-étudiant)
7. [Spécifications fonctionnelles — Espace administrateur](#7-spécifications-fonctionnelles--espace-administrateur)
8. [Modèle pédagogique et notation algorithmique tunisienne](#8-modèle-pédagogique-et-notation-algorithmique-tunisienne)
9. [Spécifications techniques](#9-spécifications-techniques)
10. [Modèle de données (MongoDB)](#10-modèle-de-données-mongodb)
11. [API REST — Endpoints](#11-api-rest--endpoints)
12. [Spécifications UI / UX et charte graphique](#12-spécifications-ui--ux-et-charte-graphique)
13. [Indicateurs de performance (KPIs)](#13-indicateurs-de-performance-kpis)
14. [Exigences non fonctionnelles](#14-exigences-non-fonctionnelles)
15. [Sécurité](#15-sécurité)
16. [Découpage en phases (roadmap)](#16-découpage-en-phases-roadmap)
17. [Livrables attendus](#17-livrables-attendus)
18. [Annexes](#18-annexes)

---

## 1. Présentation générale du projet

### 1.1 Contexte

La plateforme est un environnement d'apprentissage en ligne (**e-learning**) dédié aux élèves tunisiens préparant le **Baccalauréat Informatique** (section Sciences de l'informatique). Elle accompagne l'élève dans l'apprentissage des modules informatiques, en respectant **la méthode et les conventions officielles de l'enseignement tunisien**, notamment la façon particulière d'écrire les **algorithmes** avant de passer à la traduction en **Python**.

L'objectif principal est de fournir un espace **structuré, motivant et progressif** où l'élève :
- suit des **leçons** organisées par module et sous-module ;
- valide ses acquis via des **quiz** ;
- s'entraîne sur des **exercices pratiques** (algorithme + Python) ;
- **s'organise** (kanban, notes, calendrier) ;
- **suit sa progression** grâce à des indicateurs et des niveaux d'amélioration.

### 1.2 Langue de la plateforme

L'intégralité de l'interface, des contenus, des messages système et des libellés est en **français**, conformément au standard d'enseignement tunisien. (Le présent document est le cahier des charges ; l'interface finale sera 100 % francophone.)

### 1.3 Principe directeur de conception

L'interface doit rester **moderne, épurée, claire et simple**. L'élève doit pouvoir se concentrer sur l'étude **sans surcharge visuelle ni confusion**. On privilégie :
- beaucoup d'espace blanc (« white space ») ;
- une navigation par **panneau latéral gauche** fixe et lisible ;
- des **cartes** (cards) pour regrouper l'information ;
- une hiérarchie visuelle nette (titres, KPI, graphiques).

Les maquettes de référence fournies par le client (3 dashboards e-learning) servent d'inspiration directe pour la disposition générale : sidebar à gauche, barre supérieure avec recherche + notifications + profil, cartes de KPI en haut, graphiques de performance, listes d'événements/planning à droite.

---

## 2. Objectifs et périmètre

### 2.1 Objectifs fonctionnels

| # | Objectif |
|---|----------|
| O1 | Permettre à un élève de créer un compte et d'accéder à un tableau de bord personnel. |
| O2 | Offrir un parcours pédagogique structuré : **Module → Sous-module → (Leçon → Quiz → Exercices)**. |
| O3 | Imposer une **progression verrouillée** : les exercices ne se débloquent qu'après la réussite du quiz. |
| O4 | Suivre et afficher la **progression** et les **performances** de l'élève (KPIs, niveaux). |
| O5 | Fournir des outils d'organisation : **tableau Kanban**, **notes autocollantes**, **calendrier**. |
| O6 | Gérer le **profil** (photo, nom d'utilisateur, e-mail, mot de passe). |
| O7 | Fournir à l'**administrateur** un contrôle total : gestion des utilisateurs, modules, sous-modules, leçons, quiz, exercices, et une vue d'ensemble globale. |

### 2.2 Périmètre — Inclus

- Landing page (page vitrine).
- Authentification : inscription, connexion, déconnexion.
- Dashboard étudiant (Overview, Cours, Kanban, Notes, Calendrier, Profil).
- Dashboard administrateur (gestion complète + statistiques).
- Deux modules de départ : **Algorithmique** et **STI**, extensibles.

### 2.3 Périmètre — Exclus (hors version initiale)

- Rôle « enseignant » (il n'existe que **Étudiant** et **Administrateur**).
- Paiement / abonnement.
- Messagerie temps réel entre utilisateurs (peut être une évolution future).
- Application mobile native (le web responsive suffit dans un premier temps).

---

## 3. Acteurs et rôles

La plateforme comporte **exactement deux rôles**.

### 3.1 Étudiant (`student`)

Utilisateur final. Il peut :
- s'inscrire, se connecter, se déconnecter ;
- consulter son tableau de bord et ses KPIs ;
- suivre les leçons, passer les quiz, résoudre les exercices ;
- utiliser le Kanban, les notes et le calendrier ;
- modifier son profil.

Il **ne peut pas** créer/modifier de contenu pédagogique ni voir les données des autres utilisateurs.

### 3.2 Administrateur (`admin`)

Super-utilisateur. Il peut **tout faire** :
- gérer les utilisateurs (création, consultation, modification, activation/désactivation, suppression) ;
- gérer l'ensemble du contenu : modules, sous-modules, leçons, quiz, exercices ;
- consulter une **vue d'ensemble complète** de la plateforme (statistiques d'usage, progression globale) ;
- consulter la progression individuelle des élèves.

> **Note :** l'accès admin est déterminé par le champ `role` du compte. Aucune interface publique ne permet de s'auto-attribuer le rôle admin ; le premier admin est créé via un *seed* en base ou une variable d'environnement.

---

## 4. Arborescence des pages (sitemap)

```
PUBLIC
├── /                      → Landing page
├── /connexion             → Connexion (login)
└── /inscription           → Inscription (register)

ÉTUDIANT (protégé, rôle = student)
├── /app                   → Redirection vers /app/overview
├── /app/overview          → Vue d'ensemble (KPIs + rapports de progression)
├── /app/cours             → Liste des modules (Algorithmique, STI, …)
│   ├── /app/cours/:module                  → Liste des sous-modules
│   └── /app/cours/:module/:sousModule      → Unité d'apprentissage :
│         ├── Onglet « Leçon »
│         ├── Onglet « Quiz »
│         └── Onglet « Exercices » (verrouillé tant que le quiz n'est pas réussi)
├── /app/kanban            → Tableau Kanban (tâches & projets)
├── /app/notes             → Notes autocollantes (sticky notes)
├── /app/calendrier        → Calendrier / organisation
└── /app/profil            → Profil (photo, username, e-mail, mot de passe)

ADMIN (protégé, rôle = admin)
├── /admin                 → Redirection vers /admin/overview
├── /admin/overview        → Vue d'ensemble globale (stats plateforme)
├── /admin/utilisateurs    → Gestion des utilisateurs
├── /admin/modules         → Gestion des modules & sous-modules
├── /admin/lecons          → Gestion des leçons
├── /admin/quiz            → Gestion des quiz
├── /admin/exercices       → Gestion des exercices
└── /admin/parametres      → Paramètres généraux
```

**Menu déroulant du profil** (coin supérieur droit, sur toutes les pages connectées) :
- **Mon tableau de bord** (redirige vers l'overview du rôle) ;
- **Mon profil** ;
- **Se déconnecter**.

---

## 5. Spécifications fonctionnelles — Espace public

### 5.1 Landing page (`/`)

Page vitrine présentant la plateforme aux visiteurs non connectés. Objectif : convaincre et diriger vers l'inscription.

**Sections attendues :**

| Section | Contenu |
|---------|---------|
| En-tête (navbar) | Logo, liens d'ancrage (Fonctionnalités, Modules, À propos), boutons **Se connecter** / **S'inscrire**. |
| Hero | Titre accrocheur, sous-titre, illustration, bouton d'appel à l'action « Commencer maintenant ». |
| Fonctionnalités | Cartes présentant : cours structurés, quiz & exercices, suivi de progression, organisation (kanban/notes/calendrier). |
| Modules | Présentation des modules disponibles (Algorithmique, STI…). |
| Comment ça marche | 3–4 étapes : S'inscrire → Étudier → S'entraîner → Progresser. |
| Témoignages / bénéfices | (optionnel) Arguments pour l'élève de bac. |
| Pied de page | Liens, mentions, contact. |

**Exigences :**
- Entièrement responsive (mobile, tablette, desktop).
- Les boutons **Se connecter** et **S'inscrire** redirigent vers les pages dédiées.
- Si un utilisateur déjà connecté ouvre `/`, il est redirigé vers son dashboard.

### 5.2 Inscription (`/inscription`)

**Champs :**
- Nom d'utilisateur (`username`) — unique, requis.
- E-mail (`email`) — unique, format valide, requis.
- Mot de passe (`password`) — minimum 8 caractères, requis.
- Confirmation du mot de passe — doit correspondre.

**Règles :**
- Validation côté client (formulaire) **et** côté serveur.
- Le rôle est automatiquement **`student`** à l'inscription.
- Le mot de passe est haché (bcrypt) avant stockage.
- Messages d'erreur clairs en français (e-mail déjà utilisé, mots de passe non identiques, etc.).
- À la réussite : création du compte + connexion automatique (ou redirection vers `/connexion`) + redirection vers `/app/overview`.

### 5.3 Connexion (`/connexion`)

**Champs :** e-mail + mot de passe.

**Règles :**
- Authentification par **JWT** (voir section technique).
- Redirection selon le rôle : `student` → `/app/overview`, `admin` → `/admin/overview`.
- Message d'erreur générique en cas d'échec (« E-mail ou mot de passe incorrect »).
- Lien « Mot de passe oublié ? » (fonctionnalité optionnelle en phase 2).
- Lien vers l'inscription.

### 5.4 Déconnexion

- Accessible depuis le menu déroulant du profil.
- Invalide le token côté client (et côté serveur si liste de révocation).
- Redirige vers `/` ou `/connexion`.

---

## 6. Spécifications fonctionnelles — Espace étudiant

Toutes ces pages partagent une **mise en page commune** :
- **Panneau latéral gauche** (Drawer MUI) fixe avec les items : Vue d'ensemble, Cours, Kanban, Notes, Calendrier, Profil.
- **Barre supérieure** (AppBar) : barre de recherche, cloche de notifications, **avatar de profil** en haut à droite avec menu déroulant (Tableau de bord / Profil / Déconnexion).
- **Zone de contenu** principale à droite.

### 6.1 Vue d'ensemble (`/app/overview`)

Tableau de bord d'accueil. Affiche les **KPIs** et **rapports** sur le niveau et la performance de l'élève.

**Composants (cartes) :**

1. **Cartes de KPI** (haut de page, 4 cartes) :
   - Progression globale (%) ;
   - Sous-modules terminés / total ;
   - Quiz réussis + score moyen ;
   - Exercices résolus.

2. **Graphique de performance** : évolution du score / de l'activité dans le temps (hebdomadaire / mensuel — sélecteur de période). Voir maquettes de référence.

3. **Niveau d'amélioration** : niveau actuel de l'élève + barre de progression vers le niveau suivant (système d'XP / points — voir §13.3).

4. **Progression par module** : barres de progression par module (ex. Algorithmique 60 %, STI 30 %) — inspiré de « Learning Progress » de la maquette 3.

5. **Prochaines échéances / planning** : extrait du calendrier (prochains événements).

6. **Activité récente** : dernières leçons vues, quiz passés, exercices résolus.

### 6.2 Cours (`/app/cours`)

#### 6.2.1 Liste des modules

- Affiche les modules disponibles sous forme de **cartes** (au départ : **Algorithmique** et **STI**).
- Chaque carte : icône, titre, description courte, **barre de progression** du module, bouton « Continuer / Ouvrir ».

#### 6.2.2 Liste des sous-modules (`/app/cours/:module`)

- Un module contient **plusieurs sous-modules** (ex. pour Algorithmique : *Les variables*, *Les structures conditionnelles*, *Les boucles*, *Les tableaux*, etc.).
- Chaque sous-module est affiché avec son **statut** : verrouillé / en cours / terminé, et un indicateur (leçon lue ✔, quiz réussi ✔, exercices X/N).

#### 6.2.3 Unité d'apprentissage (`/app/cours/:module/:sousModule`)

Chaque sous-module est composé de **trois parties**, présentées sous forme d'**onglets** (Tabs MUI) :

**① Onglet « Leçon »**
- Contenu pédagogique riche : texte formaté, images, blocs de code (algorithme + Python), éventuellement vidéos.
- Bouton **« J'ai terminé la leçon »** qui marque la leçon comme lue et débloque le quiz.

**② Onglet « Quiz »**
- Débloqué après lecture de la leçon.
- Série de questions (QCM, vrai/faux, réponse courte).
- À la fin : score affiché + correction (explications).
- **Règle de réussite** : score ≥ **seuil de réussite** (configurable, ex. 60 %).
- **Le quiz doit être réussi pour débloquer les exercices.**
- L'élève peut **repasser** le quiz (nombre de tentatives illimité ou configurable). Le meilleur score est conservé.

**③ Onglet « Exercices »**
- **Verrouillé** (grisé + cadenas + message) tant que le quiz n'est pas réussi.
- Contient **2 exercices ou plus**.
- Chaque exercice comporte :
  - un énoncé ;
  - un **éditeur** pour rédiger la solution (voir §8.4 : éditeur algorithme + éditeur Python) ;
  - un bouton « Valider » / « Voir la solution » ;
  - (évolution) exécution/auto-évaluation du code.
- Marquage de l'exercice comme « résolu » → met à jour la progression.

> **Logique de déverrouillage (résumé) :**
> `Leçon lue` → débloque `Quiz` → `Quiz réussi (≥ seuil)` → débloque `Exercices`.
> Un sous-module est **« terminé »** lorsque leçon lue + quiz réussi + tous les exercices résolus (ou seuil défini par l'admin).

### 6.3 Kanban (`/app/kanban`)

Tableau Kanban personnel pour organiser projets et tâches.

**Fonctionnalités :**
- Colonnes par défaut : **À faire**, **En cours**, **Terminé** (colonnes personnalisables en évolution).
- Cartes de tâches avec : titre, description, priorité (basse/moyenne/haute), date d'échéance, étiquette/couleur.
- **Glisser-déposer** (drag & drop) entre colonnes.
- Création, édition, suppression de cartes.
- Chaque élève ne voit **que ses propres** tâches.

### 6.4 Notes autocollantes (`/app/notes`)

Espace de notes rapides (sticky notes).

**Fonctionnalités :**
- Création de notes colorées (choix de couleur).
- Édition et suppression.
- Affichage type « mur de post-it » (grille de cartes).
- (Optionnel) repositionnement libre / épinglage.
- Chaque élève ne voit que ses propres notes.

### 6.5 Calendrier (`/app/calendrier`)

Outil d'organisation du temps d'étude.

**Fonctionnalités :**
- Vues **Mois / Semaine / Jour**.
- Création d'événements : titre, description, date/heure de début et de fin, type/couleur (révision, quiz, examen, personnel).
- Édition / suppression d'événements.
- Les prochains événements alimentent le widget « Prochaines échéances » de l'overview.
- Bibliothèque suggérée : **FullCalendar** (compatible React) ou composant calendrier MUI X.

### 6.6 Profil (`/app/profil`)

Gestion des informations personnelles.

**Champs modifiables :**
- **Photo de profil** (upload d'image, aperçu, remplacement).
- **Nom d'utilisateur**.
- **E-mail**.
- **Mot de passe** (avec saisie du mot de passe actuel + nouveau + confirmation).

**Règles :**
- Validation des champs (e-mail valide, mot de passe fort, unicité e-mail/username).
- Confirmation visuelle après enregistrement.
- La photo est stockée (stockage local serveur ou service type Cloudinary — à décider en phase technique).

---

## 7. Spécifications fonctionnelles — Espace administrateur

L'administrateur dispose d'un dashboard dédié (même structure : sidebar gauche + barre supérieure) lui donnant un **contrôle total** sur la plateforme.

### 7.1 Vue d'ensemble admin (`/admin/overview`)

Statistiques globales de la plateforme :
- Nombre total d'utilisateurs (et nouveaux ce mois-ci) ;
- Nombre de modules / sous-modules / leçons / quiz / exercices ;
- Taux de complétion global des quiz ;
- Élèves actifs (connexions récentes) ;
- Progression moyenne des élèves ;
- Graphiques : inscriptions dans le temps, activité, répartition par module.

### 7.2 Gestion des utilisateurs (`/admin/utilisateurs`)

- **Tableau** (MUI DataGrid) listant tous les utilisateurs : avatar, username, e-mail, rôle, date d'inscription, statut (actif/inactif), progression.
- Actions : **créer**, **consulter le détail**, **modifier**, **activer/désactiver**, **supprimer**, **réinitialiser le mot de passe**.
- Recherche, tri et filtrage (par rôle, par statut).
- Consultation de la **progression détaillée** d'un élève (modules, quiz, exercices).

### 7.3 Gestion des modules & sous-modules (`/admin/modules`)

- CRUD des **modules** : titre, description, icône, couleur, ordre d'affichage.
- CRUD des **sous-modules** rattachés à un module : titre, description, ordre, durée estimée.
- Réordonnancement (drag & drop ou champ « ordre »).

### 7.4 Gestion des leçons (`/admin/lecons`)

- CRUD des **leçons** rattachées à un sous-module.
- **Éditeur de contenu riche** (WYSIWYG ou Markdown) permettant : titres, texte, listes, images, **blocs de code** (avec coloration syntaxique pour algorithme et Python), tableaux, éventuellement vidéos (URL/embed).
- Prévisualisation avant publication.

### 7.5 Gestion des quiz (`/admin/quiz`)

- CRUD des **quiz** rattachés à un sous-module (un quiz par sous-module).
- Ajout de **questions** : énoncé, type (QCM à choix unique / multiple, vrai-faux, réponse courte), options de réponse, bonne(s) réponse(s), explication, points.
- Définition du **seuil de réussite** (%).
- Définition du nombre de tentatives autorisées.

### 7.6 Gestion des exercices (`/admin/exercices`)

- CRUD des **exercices** rattachés à un sous-module (**2 ou plus** par sous-module).
- Champs : titre, énoncé, type (**algorithme** ou **Python**), code de départ (optionnel), **solution de référence**, difficulté (facile/moyen/difficile), ordre.
- (Évolution) configuration de tests automatiques (entrées attendues / sorties attendues) pour l'auto-évaluation.

### 7.7 Paramètres (`/admin/parametres`)

- Paramètres généraux : seuil de réussite par défaut, nombre de tentatives par défaut, activation/désactivation de fonctionnalités.
- Gestion de son propre profil admin.

---

## 8. Modèle pédagogique et notation algorithmique tunisienne

Cette section est **critique** : elle décrit la spécificité de l'enseignement informatique tunisien que la plateforme doit respecter.

### 8.1 Hiérarchie du contenu

```
Module            (ex. « Algorithmique », « STI »)
  └── Sous-module (ex. « Les boucles »)
        ├── Leçon      (le cours théorique)
        ├── Quiz       (validation des acquis)
        └── Exercices  (2 ou plus, pratique)
```

### 8.2 Démarche pédagogique tunisienne

En Tunisie, la résolution d'un problème informatique suit un enchaînement précis que la plateforme doit refléter dans les leçons et les exercices :

1. **Analyse** du problème ;
2. Écriture de l'**algorithme** en pseudo-code selon la notation officielle ;
3. **Traduction** de l'algorithme en **Python**.

L'accent est mis sur **la logique algorithmique** : l'élève apprend d'abord à raisonner et à écrire l'algorithme, **avant** de coder en Python. Python est utilisé de façon **simple**, sans recours excessif aux fonctions avancées ou aux bibliothèques externes — l'objectif est de **traduire fidèlement l'algorithme** et d'apprendre à coder, pas d'utiliser des raccourcis de haut niveau.

> **Conséquence pour la plateforme :** chaque sous-module de programmation présente idéalement la notion **d'abord en algorithme** (notation tunisienne) puis **en Python**. Les exercices doivent pouvoir cibler l'un ou l'autre (`type: algorithme` ou `type: python`).

### 8.3 Notation algorithmique (conventions à respecter)

La plateforme (éditeur, coloration syntaxique, exemples de leçons) doit prendre en charge la notation algorithmique tunisienne, dont les éléments principaux sont :

- **Structure générale** : nom de l'algorithme, corps `Début … Fin`, et **T.D.O** (Table de Déclaration des Objets) pour déclarer les variables et leurs types.
- **Types de base** : `entier`, `réel`, `booléen`, `caractère`, `chaîne`.
- **Affectation** : symbole flèche `←`.
- **Entrées / sorties** : `écrire(...)`, `lire(...)`.
- **Opérateurs** : arithmétiques (`+`, `-`, `*`, `/`, `DIV`, `MOD`), logiques (`ET`, `OU`, `NON`), de comparaison.
- **Structures conditionnelles** : `Si … Alors … Sinon … Finsi` ; `Selon … Fin Selon`.
- **Structures itératives** : `Pour i de … à … Faire … Fin Pour` ; `Tant Que … Faire … Fin Tant Que` ; `Répéter … Jusqu'à`.
- **Structures de données** : tableaux, chaînes de caractères, enregistrements.
- **Sous-programmes** : `Fonction` et `Procédure`.

> ⚠️ **À confirmer avec le client / conforme au programme officiel :** les mots-clés exacts et la mise en forme (majuscules, accents) doivent suivre la version du programme officiel visée. Le contenu réel des leçons est saisi par l'administrateur ; la plateforme fournit le **support de mise en forme** (blocs de code, coloration).

### 8.4 Éditeur de code / algorithme (exercices)

Pour la partie Exercices, la plateforme intègre un **éditeur de code** dans le navigateur :

- **Mode « Algorithme »** : zone d'édition avec coloration adaptée à la notation tunisienne (mots-clés en évidence). Support minimal : saisie du symbole `←`, indentation, coloration des mots-clés.
- **Mode « Python »** : éditeur avec coloration syntaxique Python.
- Bibliothèque suggérée : **Monaco Editor** ou **CodeMirror** (intégrables dans React).
- **MVP** : l'élève écrit sa solution, la compare à la **solution de référence** (affichage « Voir la solution ») et se corrige. Marquage manuel « résolu ».
- **Évolution (V2)** : **exécution automatique** du code Python et vérification des sorties via un moteur d'exécution sécurisé côté serveur (ex. **Judge0**, **Piston**, ou un sandbox Docker). L'algorithme (pseudo-code) n'étant pas exécutable, sa validation reste basée sur la comparaison/correction guidée.

### 8.5 Exemples de sous-modules (à titre indicatif)

> Le contenu réel est défini par l'administrateur. Exemples de découpage pour le module **Algorithmique** :
> Les variables et les types • Les entrées/sorties • Les structures conditionnelles • Les structures itératives (boucles) • Les tableaux (1D / 2D) • Les chaînes de caractères • Les sous-programmes (fonctions & procédures) • La récursivité • Les algorithmes de tri et de recherche.
>
> Le module **STI** suit la même structure (sous-modules → leçon/quiz/exercices), avec le contenu propre au programme officiel.

---

## 9. Spécifications techniques

### 9.1 Stack technologique imposée

| Couche | Technologie |
|--------|-------------|
| Front-end | **React** (SPA) |
| Bibliothèque UI | **MUI (Material UI)** pour les composants du dashboard |
| Back-end | **Node.js** + **Express** |
| Base de données | **MongoDB** (via **Mongoose**) |
| Authentification | **JWT** (JSON Web Token) + **bcrypt** pour le hachage |

### 9.2 Bibliothèques recommandées

**Front-end :**
- `react-router-dom` — routage et routes protégées.
- `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid` (tableaux admin), `@mui/x-charts` ou `recharts` (graphiques).
- `axios` — appels API.
- Gestion d'état : **Context API** + hooks (ou Redux Toolkit / Zustand si le besoin grandit).
- `@hello-pangea/dnd` ou `dnd-kit` — glisser-déposer (Kanban).
- `FullCalendar` (`@fullcalendar/react`) — calendrier.
- `Monaco Editor` (`@monaco-editor/react`) ou `CodeMirror` — éditeur de code.
- `react-hook-form` + `yup`/`zod` — formulaires et validation.

**Back-end :**
- `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`.
- `cors`, `helmet`, `express-rate-limit`, `express-validator` — sécurité & validation.
- `multer` — upload de fichiers (photo de profil).
- `dotenv` — variables d'environnement.
- `morgan` — logs.

### 9.3 Architecture générale

Architecture **client / serveur découplée** (API REST) :

```
[ React SPA ]  ⇄  HTTPS/JSON  ⇄  [ API Express ]  ⇄  [ MongoDB ]
     |                                   |
  MUI, Router                     JWT auth, contrôleurs,
  Context, Axios                  middlewares (rôles)
```

### 9.4 Structure de projet suggérée

```
projet/
├── client/                      # React
│   ├── src/
│   │   ├── api/                 # services axios
│   │   ├── components/          # composants réutilisables (Sidebar, Navbar, Cards…)
│   │   ├── layouts/             # StudentLayout, AdminLayout, PublicLayout
│   │   ├── pages/
│   │   │   ├── public/          # Landing, Login, Register
│   │   │   ├── student/         # Overview, Cours, Kanban, Notes, Calendrier, Profil
│   │   │   └── admin/           # Overview, Users, Modules, Lessons, Quiz, Exercices
│   │   ├── context/             # AuthContext…
│   │   ├── hooks/
│   │   ├── routes/              # ProtectedRoute, RoleRoute
│   │   ├── theme/               # thème MUI (couleurs, typo)
│   │   └── utils/
│   └── package.json
│
└── server/                      # Node.js / Express
    ├── src/
    │   ├── config/              # db.js, env
    │   ├── models/              # schémas Mongoose
    │   ├── controllers/
    │   ├── routes/
    │   ├── middlewares/         # auth, role, error, validation
    │   ├── services/
    │   └── app.js
    ├── uploads/                 # (si stockage local des images)
    └── package.json
```

### 9.5 Variables d'environnement (exemple)

```
# server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bac_informatique
JWT_SECRET=<clé_secrète_forte>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@plateforme.tn         # pour le seed du premier admin
ADMIN_PASSWORD=<mot_de_passe_initial>
```

### 9.6 Routes protégées et gestion des rôles

- Middleware `auth` : vérifie le JWT, injecte `req.user`.
- Middleware `role('admin')` / `role('student')` : autorise l'accès selon le rôle.
- Côté React : composant `ProtectedRoute` (redirige vers `/connexion` si non connecté) et `RoleRoute` (redirige si le rôle ne correspond pas).

---

## 10. Modèle de données (MongoDB)

Schémas Mongoose principaux (les champs `createdAt` / `updatedAt` sont gérés par `timestamps: true`).

### 10.1 `User`
```js
{
  username: String,        // unique, requis
  email: String,           // unique, requis
  passwordHash: String,    // requis
  role: String,            // 'student' | 'admin'  (défaut: 'student')
  profilePicture: String,  // URL / chemin
  isActive: Boolean,       // défaut: true
  xp: Number,              // points d'expérience (niveau)
  level: Number,           // niveau calculé
  lastLoginAt: Date
}
```

### 10.2 `Module`
```js
{
  title: String,           // ex. "Algorithmique"
  slug: String,            // ex. "algorithmique"
  description: String,
  icon: String,            // nom d'icône
  color: String,           // couleur d'accent
  order: Number            // ordre d'affichage
}
```

### 10.3 `SubModule`
```js
{
  moduleId: ObjectId,      // ref: Module
  title: String,           // ex. "Les boucles"
  description: String,
  order: Number,
  estimatedDuration: Number // minutes (optionnel)
}
```

### 10.4 `Lesson`
```js
{
  subModuleId: ObjectId,   // ref: SubModule (1 leçon par sous-module)
  title: String,
  content: String,         // HTML riche ou Markdown (texte, images, blocs de code)
  videoUrl: String,        // optionnel
  attachments: [String]    // optionnel
}
```

### 10.5 `Quiz`
```js
{
  subModuleId: ObjectId,   // ref: SubModule (1 quiz par sous-module)
  title: String,
  passingScore: Number,    // seuil de réussite en % (ex. 60)
  maxAttempts: Number,     // 0 = illimité
  questions: [
    {
      text: String,
      type: String,        // 'single' | 'multiple' | 'boolean' | 'short'
      options: [String],   // pour QCM
      correctAnswers: [Number/String],
      explanation: String,
      points: Number
    }
  ]
}
```

### 10.6 `Exercise`
```js
{
  subModuleId: ObjectId,   // ref: SubModule (2 ou plus par sous-module)
  title: String,
  statement: String,       // énoncé (riche)
  type: String,            // 'algorithme' | 'python'
  starterCode: String,     // optionnel
  solution: String,        // solution de référence
  difficulty: String,      // 'facile' | 'moyen' | 'difficile'
  order: Number,
  tests: [                 // optionnel (auto-évaluation V2, Python)
    { input: String, expectedOutput: String }
  ]
}
```

### 10.7 `Progress`
Suivi de la progression d'un élève pour chaque sous-module.
```js
{
  userId: ObjectId,        // ref: User
  subModuleId: ObjectId,   // ref: SubModule
  lessonCompleted: Boolean,
  quizPassed: Boolean,
  quizBestScore: Number,
  exercisesCompleted: [ObjectId], // ref: Exercise
  status: String,          // 'locked' | 'in_progress' | 'completed'
  completedAt: Date
}
```

### 10.8 `QuizAttempt`
```js
{
  userId: ObjectId,
  quizId: ObjectId,
  answers: [Mixed],
  score: Number,           // en %
  passed: Boolean,
  attemptedAt: Date
}
```

### 10.9 `Task` (Kanban)
```js
{
  userId: ObjectId,
  title: String,
  description: String,
  status: String,          // 'todo' | 'doing' | 'done'
  priority: String,        // 'low' | 'medium' | 'high'
  dueDate: Date,
  color: String,
  order: Number
}
```

### 10.10 `Note` (Sticky notes)
```js
{
  userId: ObjectId,
  content: String,
  color: String,
  pinned: Boolean
}
```

### 10.11 `Event` (Calendrier)
```js
{
  userId: ObjectId,
  title: String,
  description: String,
  start: Date,
  end: Date,
  type: String,            // 'revision' | 'quiz' | 'examen' | 'personnel'
  color: String
}
```

### 10.12 Relations (résumé)

```
User 1─* Progress *─1 SubModule
Module 1─* SubModule 1─1 Lesson
SubModule 1─1 Quiz
SubModule 1─* Exercise
User 1─* Task
User 1─* Note
User 1─* Event
User 1─* QuizAttempt
```

---

## 11. API REST — Endpoints

Base : `/api`. Les routes marquées 🔒 nécessitent un JWT valide ; 👑 nécessitent le rôle `admin`.

### 11.1 Authentification
| Méthode | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Inscription (rôle student). |
| POST | `/api/auth/login` | Connexion, renvoie le JWT + infos user. |
| POST | `/api/auth/logout` | Déconnexion. |
| GET | `/api/auth/me` 🔒 | Renvoie l'utilisateur courant. |

### 11.2 Utilisateurs / Profil
| Méthode | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/me` 🔒 | Profil courant. |
| PUT | `/api/users/me` 🔒 | Modifier username / e-mail. |
| PUT | `/api/users/me/password` 🔒 | Changer le mot de passe. |
| POST | `/api/users/me/avatar` 🔒 | Upload photo de profil. |
| GET | `/api/users` 👑 | Liste des utilisateurs (recherche/filtre/pagination). |
| GET | `/api/users/:id` 👑 | Détail + progression. |
| POST | `/api/users` 👑 | Créer un utilisateur. |
| PUT | `/api/users/:id` 👑 | Modifier (rôle, statut…). |
| DELETE | `/api/users/:id` 👑 | Supprimer. |

### 11.3 Contenu pédagogique
| Méthode | Route | Description |
|--------|-------|-------------|
| GET | `/api/modules` 🔒 | Liste des modules (+ progression pour l'élève). |
| GET | `/api/modules/:id/submodules` 🔒 | Sous-modules d'un module (+ statut). |
| GET | `/api/submodules/:id` 🔒 | Détail d'un sous-module (leçon, quiz, exercices, statut de déblocage). |
| POST/PUT/DELETE | `/api/modules`, `/api/submodules` 👑 | CRUD modules & sous-modules. |
| GET | `/api/lessons/:subModuleId` 🔒 | Leçon d'un sous-module. |
| POST/PUT/DELETE | `/api/lessons` 👑 | CRUD leçons. |
| GET | `/api/quiz/:subModuleId` 🔒 | Quiz (sans les bonnes réponses côté élève). |
| POST/PUT/DELETE | `/api/quiz` 👑 | CRUD quiz. |
| GET | `/api/exercises/:subModuleId` 🔒 | Exercices (verrouillés si quiz non réussi). |
| POST/PUT/DELETE | `/api/exercises` 👑 | CRUD exercices. |

### 11.4 Progression & évaluation
| Méthode | Route | Description |
|--------|-------|-------------|
| POST | `/api/progress/lesson/:subModuleId/complete` 🔒 | Marque la leçon comme lue (débloque le quiz). |
| POST | `/api/quiz/:quizId/submit` 🔒 | Soumet le quiz, calcule le score, débloque les exercices si réussi. |
| POST | `/api/exercises/:exerciseId/complete` 🔒 | Marque un exercice comme résolu. |
| GET | `/api/progress/me` 🔒 | Progression globale de l'élève (pour l'overview). |

### 11.5 Outils personnels
| Méthode | Route | Description |
|--------|-------|-------------|
| GET/POST/PUT/DELETE | `/api/tasks` 🔒 | CRUD tâches Kanban (de l'élève). |
| GET/POST/PUT/DELETE | `/api/notes` 🔒 | CRUD notes autocollantes. |
| GET/POST/PUT/DELETE | `/api/events` 🔒 | CRUD événements du calendrier. |

### 11.6 Statistiques admin
| Méthode | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` 👑 | KPIs globaux de la plateforme. |

> **Sécurité API :** l'endpoint de récupération du quiz côté élève **ne renvoie jamais** les bonnes réponses ; la correction est calculée côté serveur à la soumission. De même, l'accès aux exercices est refusé côté serveur si `quizPassed` est faux (ne pas se fier uniquement au verrouillage visuel).

---

## 12. Spécifications UI / UX et charte graphique

### 12.1 Principes

- **Moderne, épuré, simple** : espace, cartes, coins arrondis, ombres douces.
- **Cohérence** : mêmes composants MUI, même thème, mêmes espacements partout.
- **Lisibilité** : hiérarchie claire, pas de surcharge, focus sur l'étude.
- **Responsive** : desktop prioritaire, mais utilisable sur tablette et mobile (sidebar rétractable en menu « hamburger »).

### 12.2 Disposition (layout)

Inspirée des maquettes fournies :
- **Sidebar gauche** fixe : logo en haut, items de navigation avec icônes, item actif mis en évidence, éventuel encart en bas (nom/avatar de l'utilisateur).
- **Barre supérieure** : titre de page, barre de recherche, cloche de notifications, **avatar profil + menu déroulant** à droite.
- **Contenu** : grille de cartes (KPIs en haut, graphiques et listes en dessous).

### 12.3 Charte graphique (proposition, à valider)

> Palette de départ, ajustable par le client. On recommande une base **claire et professionnelle** adaptée à l'étude.

| Élément | Valeur proposée |
|---------|-----------------|
| Couleur primaire | Bleu indigo `#2F5BFF` (accent, boutons, actif) |
| Couleur secondaire | Vert `#22C55E` (succès, progression) |
| Alerte / erreur | Rouge `#EF4444` |
| Avertissement | Orange `#F59E0B` |
| Fond application | Gris très clair `#F7F8FA` |
| Cartes / surfaces | Blanc `#FFFFFF` |
| Texte principal | `#0F172A` |
| Texte secondaire | `#64748B` |
| Bordures / séparateurs | `#E5E7EB` |

- **Typographie** : police sans-serif moderne (**Inter** ou **Poppins**), lisible ; titres en semi-bold, corps en regular.
- **Rayons** : coins arrondis (8–16 px).
- **Icônes** : `@mui/icons-material` (style cohérent).
- **Thème MUI** : centraliser couleurs, typo et espacements dans un fichier `theme/` unique.

### 12.4 États et retours utilisateur

- **États de chargement** (skeletons / spinners) sur les données asynchrones.
- **États vides** (« Aucune note pour l'instant », etc.) avec illustration/appel à l'action.
- **Messages** de succès/erreur (snackbars MUI).
- **Confirmations** avant suppression (dialogues).
- **Éléments verrouillés** clairement signalés (cadenas + info-bulle expliquant comment débloquer).

---

## 13. Indicateurs de performance (KPIs)

### 13.1 KPIs élève (overview)
- Progression globale (%) = sous-modules terminés / total.
- Nombre de quiz réussis + score moyen.
- Nombre d'exercices résolus.
- Progression par module (barres).
- Série d'activité / temps d'étude (graphique).
- Prochaines échéances (depuis le calendrier).

### 13.2 KPIs admin (overview)
- Total utilisateurs / nouveaux utilisateurs.
- Total modules / sous-modules / leçons / quiz / exercices.
- Taux moyen de réussite aux quiz.
- Progression moyenne des élèves.
- Élèves actifs récemment.
- Évolution des inscriptions et de l'activité (graphiques).

### 13.3 Système de niveaux (« improvement levels »)
Mécanique de motivation demandée par le client :
- L'élève gagne des **points d'XP** : leçon terminée, quiz réussi, exercice résolu (barème configurable).
- Un **niveau** est calculé à partir de l'XP cumulée (paliers).
- L'overview affiche le **niveau actuel** + barre de progression vers le niveau suivant.
- (Évolution) badges / récompenses par jalons.

---

## 14. Exigences non fonctionnelles

| Exigence | Détail |
|----------|--------|
| **Performance** | Chargement initial rapide ; pagination des listes admin ; requêtes indexées côté MongoDB. |
| **Responsive** | Utilisable sur desktop, tablette, mobile. |
| **Accessibilité** | Contrastes suffisants, navigation clavier, libellés de formulaires. |
| **Internationalisation** | Interface **100 % française** ; centraliser les libellés pour faciliter d'éventuelles évolutions. |
| **Maintenabilité** | Code structuré, composants réutilisables, nommage clair, variables d'environnement. |
| **Compatibilité** | Derniers navigateurs modernes (Chrome, Edge, Firefox, Safari). |
| **Fiabilité** | Gestion centralisée des erreurs (front & back), messages clairs. |

---

## 15. Sécurité

- **Mots de passe** hachés avec **bcrypt** (jamais stockés en clair).
- **JWT** signé avec un secret fort, expiration configurée ; stockage côté client sécurisé (httpOnly cookie recommandé, ou en mémoire).
- **Middlewares** d'autorisation par rôle sur **toutes** les routes sensibles (ne jamais se fier au front).
- **Validation** et **assainissement** des entrées (`express-validator`) côté serveur.
- **Protection** : `helmet`, `cors` restreint au domaine client, `express-rate-limit` (surtout login/register).
- **Upload d'images** : limite de taille, types autorisés (jpg/png/webp), noms de fichiers assainis.
- **Isolation des données** : un élève n'accède **jamais** aux tâches/notes/événements/progression d'un autre (filtrage systématique par `userId`).
- **Contenu quiz** : bonnes réponses non exposées à l'élève ; correction serveur uniquement.
- **HTTPS** en production.

---

## 16. Découpage en phases (roadmap)

> Proposition indicative pour organiser le développement.

**Phase 0 — Fondations**
Mise en place projet (client/serveur), thème MUI, connexion MongoDB, modèles de base, seed admin.

**Phase 1 — Authentification & layout**
Landing, inscription, connexion, déconnexion, routes protégées, layouts étudiant/admin, menu profil.

**Phase 2 — Cœur pédagogique (élève)**
Modules → sous-modules → leçon/quiz/exercices, logique de déverrouillage, progression, overview + KPIs.

**Phase 3 — Outils personnels**
Kanban, notes, calendrier, profil.

**Phase 4 — Espace admin**
Gestion utilisateurs, modules, sous-modules, leçons, quiz, exercices, stats globales.

**Phase 5 — Finitions**
Système de niveaux/XP, responsive, états de chargement/vides, sécurité renforcée, tests.

**Phase 6 (évolutions)**
Exécution/auto-évaluation du code Python, mot de passe oublié, badges, notifications.

---

## 17. Livrables attendus

- Code source **front-end (React)** et **back-end (Node.js/Express)** structuré et documenté.
- Base **MongoDB** avec modèles + script de **seed** (admin + jeu de données de démonstration : module Algorithmique avec quelques sous-modules complets).
- **Fichier README** d'installation et de lancement (variables d'environnement incluses).
- **Documentation des API** (liste des endpoints).
- Application **responsive**, interface **100 % en français**.

---

## 18. Annexes

### 18.1 Récapitulatif de la logique de déverrouillage
```
[Sous-module]
   Leçon  ──(clic « J'ai terminé »)──►  Quiz débloqué
   Quiz   ──(score ≥ seuil)──────────►  Exercices débloqués
   Exercices tous résolus  ───────────►  Sous-module « terminé » (+ XP)
```

### 18.2 Points à confirmer avec le client
1. Mots-clés **exacts** de la notation algorithmique à respecter (selon la version du programme officiel visée).
2. **Seuil de réussite** par défaut des quiz (proposé : 60 %) et **nombre de tentatives** (proposé : illimité).
3. **Palette de couleurs** définitive (proposition fournie au §12.3).
4. Faut-il l'**exécution automatique** du code Python dès la V1, ou en évolution (V2) ?
5. Stockage des **photos de profil** : local serveur ou service externe (Cloudinary) ?
6. Sous-modules de départ précis pour **STI** et **Algorithmique** (contenu réel).

---

*Fin du cahier des charges — Version 1.0.*
