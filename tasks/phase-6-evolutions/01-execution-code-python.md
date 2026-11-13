# Tâche 6.1 — Exécution automatique du code Python (V2)

**Phase :** 6 — Évolutions
**Dépendances :** [phase-2-pedagogique/08-editeur-code-algorithme-python.md](../phase-2-pedagogique/08-editeur-code-algorithme-python.md), [phase-4-admin/07-gestion-exercices.md](../phase-4-admin/07-gestion-exercices.md) (champ `tests` du modèle `Exercise`, déjà prévu au §10.6)
**Réfs cahier des charges :** §8.4, §10.6 (champ `tests`), points-a-confirmer.md #5

## Objectif

Permettre l'exécution sécurisée du code Python soumis par l'élève dans un exercice, et la vérification automatique de ses sorties par rapport à des cas de test définis par l'admin, remplaçant (ou complétant) la correction manuelle par comparaison à la solution de référence.

## Contexte

Explicitement reporté en V2 par le cahier des charges (§8.4) : « Exécution automatique du code Python et vérification des sorties via un moteur d'exécution sécurisé côté serveur (ex. Judge0, Piston, ou un sandbox Docker) ». Important : la validation de l'**algorithme** (pseudo-code) reste toujours basée sur la comparaison/correction guidée, car il n'est pas exécutable — cette tâche ne concerne que les exercices de type `python`.

## Étapes détaillées

1. **Choix du moteur d'exécution** — évaluer entre :
   - **Judge0** (self-hosted ou API publique) — supporte de nombreux langages, API REST simple, isolation par sandbox déjà gérée.
   - **Piston** — alternative open-source, self-hostable facilement, plus légère.
   - **Sandbox Docker maison** — plus de contrôle mais plus de responsabilité sécurité (limites CPU/mémoire/temps, réseau désactivé, filesystem éphémère) — à réserver si les deux options précédentes ne conviennent pas.
   - **Recommandation** : démarrer avec Piston ou Judge0 self-hosté plutôt qu'un sandbox maison, pour limiter la surface de risque sécurité (exécution de code arbitraire soumis par des utilisateurs est une opération sensible).

2. **Backend — service d'exécution** (`services/codeExecutionService.js`)
   - Fonction `runPython(code, input)` qui appelle le moteur choisi, avec timeout strict (ex. 5-10s) et limites mémoire.
   - Endpoint `POST /api/exercises/:exerciseId/run` 🔒 : exécute le code soumis contre les `tests` définis sur l'exercice (§10.6 `tests: [{ input, expectedOutput }]`), renvoie le résultat par cas de test (réussi/échoué, sortie obtenue vs attendue) sans jamais exposer le code d'un autre élève ni la solution de référence.
   - Ne jamais exécuter le code de l'élève avec des privilèges élevés, accès réseau ou accès au système de fichiers du serveur applicatif — isolation stricte (conteneur éphémère dédié, pas le processus Node principal).

3. **Backend — admin** — étendre l'interface de gestion des exercices (tâche 4.7) pour permettre à l'admin de saisir les `tests` (`input`/`expectedOutput`) sur les exercices de type `python`, et éventuellement de tester lui-même la solution de référence contre ces cas avant publication (garde-fou qualité).

4. **Frontend** — dans `ExercisesTab`/`ExerciseCard` (tâche 2.7), pour les exercices `python` : bouton « Exécuter » en plus de « Valider », affichant le résultat par cas de test. La validation finale (`POST /api/exercises/:exerciseId/complete`, tâche 2.5) peut alors optionnellement exiger que tous les tests passent plutôt que de rester un marquage purement manuel — décision produit à valider avec le client (garder le marquage manuel en option reste raisonnable, l'exécution automatique étant alors une aide plutôt qu'un verrou strict).

## Fichiers à créer / modifier

```
server/src/
├── services/codeExecutionService.js
├── controllers/exerciseController.js   # ajout runExercise
└── routes/exerciseRoutes.js            # ajout POST /:exerciseId/run

client/src/
└── components/student/ExerciseCard.jsx  # ajout bouton Exécuter + affichage résultats
```

## Modèles de données concernés

`Exercise` (champ `tests`, déjà prévu au §10.6).

## Règles métier / cas limites

- **Sécurité critique** : ne jamais exécuter de code utilisateur non isolé sur l'infrastructure applicative principale — c'est la fonctionnalité la plus sensible de toute la plateforme en termes de risque (exécution de code arbitraire).
- Timeout et limites de ressources obligatoires pour éviter le déni de service (boucle infinie soumise par un élève).
- Le résultat des tests ne doit jamais révéler la solution de référence, seulement la sortie produite par le code de l'élève face aux cas de test.

## Critères d'acceptation

- [ ] Un exercice Python avec des cas de test définis peut être exécuté par l'élève, avec résultat par cas affiché.
- [ ] Un code contenant une boucle infinie ou une consommation excessive de ressources est interrompu par le timeout sans affecter le reste de la plateforme.
- [ ] Le code d'un élève ne peut ni accéder au réseau, ni au système de fichiers du serveur, ni aux données d'autres utilisateurs.
- [ ] La solution de référence n'est jamais exposée par cet endpoint.
