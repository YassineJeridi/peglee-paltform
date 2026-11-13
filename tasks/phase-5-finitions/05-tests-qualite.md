# Tâche 5.5 — Tests et livrables documentaires

**Phase :** 5 — Finitions
**Dépendances :** l'ensemble du projet
**Réfs cahier des charges :** §16 (Phase 5 « tests »), §17 (Livrables)

## Objectif

Mettre en place une base de tests automatisés couvrant en priorité la logique métier critique (déverrouillage, correction de quiz, sécurité des rôles), et finaliser les livrables documentaires attendus par le §17 : README d'installation, documentation des endpoints API.

## Contexte

Le cahier des charges mentionne les tests comme faisant partie de la Phase 5 sans détailler de stack précise — ce document propose une approche pragmatique priorisant la valeur (logique métier et sécurité) plutôt que la couverture exhaustive, compte tenu du périmètre déjà large du projet.

## Étapes détaillées

1. **Choix d'outillage** — `Jest` (ou `Vitest`) + `supertest` pour les tests backend (API), éventuellement `mongodb-memory-server` pour isoler les tests d'une vraie instance MongoDB. Côté frontend, tests unitaires ciblés avec `Vitest` + `React Testing Library` si le temps le permet — non bloquant pour la livraison si le temps manque, à prioriser après le backend.

2. **Tests backend prioritaires** (couvrent directement les règles métier les plus critiques identifiées dans les tâches précédentes) :
   - `gradeQuiz` (tâche 2.3/2.5) : un test par type de question (`single`, `multiple`, `boolean`, `short`), cas limite score exactement au seuil.
   - Logique de déverrouillage (tâche 2.5) : leçon → quiz → exercices, y compris tentative d'accès prématuré aux exercices (`403` attendu).
   - Authentification (tâche 1.1) : inscription avec doublon, connexion avec mauvais mot de passe, token expiré/invalide.
   - Middleware de rôle (tâche 1.1) : accès admin refusé à un `student` sur au moins un endpoint représentatif de chaque module admin (utilisateurs, modules, quiz, exercices).
   - Isolation des données (tâche 3.1-3.3) : un élève ne peut pas lire/modifier/supprimer les tâches/notes/événements d'un autre.
   - Calcul XP/niveau (tâche 5.1) : `computeLevel` sur quelques valeurs de référence.

3. **Tests frontend (si temps disponible)** — cibler les composants à logique non triviale plutôt que les composants purement présentationnels : `ProtectedRoute`/`RoleRoute` (tâche 1.3), logique de verrouillage visuel des onglets (tâche 2.7), validation des formulaires auth (tâche 1.2).

4. **README racine du projet** (amorcé en tâche 0.1, finalisé ici) :
   - Présentation du projet, stack (§9.1).
   - Instructions d'installation (`client` + `server`), variables d'environnement requises (`.env.example` de chaque côté), commande de seed (§17 « script de seed »).
   - Commandes de lancement (dev et prod).
   - Commande de lancement des tests.

5. **Documentation des endpoints API** (§17 « Documentation des API ») — un document listant tous les endpoints réellement implémentés (méthode, route, protection 🔒/👑, description, exemple de body si pertinent). Peut être un simple Markdown (`server/API.md`) reprenant et complétant le tableau du §11 avec les endpoints ajoutés en cours de développement (ex. `Settings`, réordonnancement, réinitialisation de mot de passe) qui n'étaient pas explicitement listés dans le cahier des charges initial.

## Fichiers à créer / modifier

```
server/
├── tests/                    # tests Jest/Vitest + supertest
│   ├── auth.test.js
│   ├── quiz.test.js
│   ├── progress.test.js
│   ├── roles.test.js
│   └── isolation.test.js
└── API.md

client/
└── src/**/*.test.jsx         # si le temps le permet

README.md                     # racine, finalisé
```

## Règles métier / cas limites

- Prioriser systématiquement les tests qui protègent contre une régression de sécurité ou de logique métier (déverrouillage, rôles, isolation) plutôt que des tests de rendu UI à faible valeur.

## Critères d'acceptation

- [ ] Une suite de tests backend s'exécute via une commande unique (`npm test`) et couvre au minimum les scénarios listés ci-dessus.
- [ ] Le README racine permet à une personne n'ayant jamais touché le projet d'installer et lancer l'application de bout en bout (client + serveur + seed) sans aide extérieure.
- [ ] `API.md` (ou équivalent) liste tous les endpoints réellement disponibles, à jour par rapport au code.
