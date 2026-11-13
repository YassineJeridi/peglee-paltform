# Tâche 0.4 — Script de seed (admin + données de démonstration)

**Phase :** 0 — Fondations
**Dépendances :** [03-modeles-mongoose.md](03-modeles-mongoose.md)
**Réfs cahier des charges :** §3.2 (note sur la création du premier admin), §9.5, §17 (Livrables), §8.5 (exemples de sous-modules)

## Objectif

Fournir un script exécutable (`npm run seed` côté `server`) qui crée le premier compte administrateur à partir des variables d'environnement, et injecte un jeu de données de démonstration cohérent : le module **Algorithmique** avec quelques sous-modules **complets** (leçon + quiz + ≥2 exercices chacun).

## Contexte

Le cahier des charges précise (§3.2) qu'aucune interface publique ne permet de s'auto-attribuer le rôle admin : le premier admin est créé via un seed ou une variable d'environnement. Le §17 exige également un « script de seed (admin + jeu de données de démonstration) » comme livrable. Ce jeu de données sert aussi de matériel de test pour toutes les phases suivantes (sans lui, il est impossible de tester le parcours élève avant que l'admin ait créé du contenu via son interface, ce qui n'arrive qu'en Phase 4).

## Étapes détaillées

1. **Script principal** (`server/src/scripts/seed.js` ou `server/seed.js`)
   - Se connecte à MongoDB via la config existante (§0.2).
   - Idempotent si possible : vérifier si l'admin existe déjà (`findOne({ email: ADMIN_EMAIL })`) avant de le recréer ; proposer un flag `--reset` pour vider les collections concernées avant de reseeder (pratique en dev).

2. **Création de l'admin**
   - Lire `ADMIN_EMAIL` et `ADMIN_PASSWORD` depuis `.env`.
   - Hacher le mot de passe avec `bcrypt` (même logique que l'inscription normale, réutiliser un helper `hashPassword` si déjà extrait — sinon l'extraire ici en prévision de la Phase 1).
   - Créer le `User` avec `role: 'admin'`, `isActive: true`.

3. **Création du module Algorithmique**
   - `Module` : `title: 'Algorithmique'`, `slug: 'algorithmique'`, `description`, `icon`, `color`, `order: 1`.
   - Sous-modules (s'inspirer du §8.5, choisir 2 à 4 pour la démo, ex. *Les variables et les types*, *Les structures conditionnelles*, *Les structures itératives*) : `SubModule` avec `order` croissant.

4. **Contenu complet pour chaque sous-module de démo**
   - Une `Lesson` par sous-module : contenu illustrant explicitement la démarche du §8.2 (analyse → algorithme en notation tunisienne §8.3 → traduction Python), avec au moins un bloc de code algorithme et un bloc Python.
   - Un `Quiz` par sous-module : 3-5 questions variées (`single`, `boolean`, `short`), `passingScore: 60`, `maxAttempts: 0`.
   - Au moins 2 `Exercise` par sous-module : un de type `algorithme`, un de type `python`, avec `statement`, `solution` de référence, `difficulty` variée.

5. **(Optionnel mais utile pour les tests) Module STI**
   - Créer un second `Module` « STI » avec au moins un sous-module minimal (peut être un simple squelette), pour valider que la plateforme gère bien plusieurs modules dès la Phase 2, conformément à l'exigence « extensibles » du §2.2.

6. **Script npm**
   - Ajouter `"seed": "node src/scripts/seed.js"` dans `server/package.json`.
   - Logger un résumé clair en fin d'exécution (nombre de documents créés, identifiants de l'admin) et fermer proprement la connexion MongoDB (`process.exit(0)`).

## Fichiers à créer / modifier

```
server/src/scripts/seed.js
server/package.json   (ajout du script "seed")
```

## Modèles de données concernés

`User`, `Module`, `SubModule`, `Lesson`, `Quiz`, `Exercise` (§10.1, §10.2, §10.3, §10.4, §10.5, §10.6).

## Règles métier / cas limites

- Ne jamais logger le mot de passe en clair, même en dev.
- Le script doit être **rejouable sans planter** (soit idempotent, soit avec un mode reset explicite) — évite de bloquer l'équipe qui relance le seed plusieurs fois en développement.
- Le contenu de démo doit respecter la démarche pédagogique tunisienne (§8.2) pour servir de référence visuelle/qualité à l'admin qui saisira le vrai contenu en Phase 4.

## Critères d'acceptation

- [ ] `npm run seed` depuis `server/` crée un admin fonctionnel (email/mot de passe issus de `.env`), utilisable pour se connecter une fois la Phase 1 terminée.
- [ ] Au moins 2 sous-modules du module Algorithmique sont **entièrement** jouables de bout en bout (leçon → quiz → 2 exercices) une fois les Phases 1-2 terminées.
- [ ] Relancer `npm run seed` une seconde fois ne crée pas de doublons (admin ou contenu) ni ne fait planter le script.
- [ ] Le contenu des leçons de démo illustre visiblement le triptyque analyse / algorithme / Python (§8.2).
