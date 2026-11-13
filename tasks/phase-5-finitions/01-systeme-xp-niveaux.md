# Tâche 5.1 — Système de niveaux (XP)

**Phase :** 5 — Finitions
**Dépendances :** [phase-2-pedagogique/05-api-progression-deverrouillage.md](../phase-2-pedagogique/05-api-progression-deverrouillage.md) (`xpService` amorcé), [phase-2-pedagogique/09-frontend-overview-etudiant.md](../phase-2-pedagogique/09-frontend-overview-etudiant.md) (affichage amorcé)
**Réfs cahier des charges :** §13.3, §18.1

## Objectif

Finaliser le barème de gain d'XP, la formule de calcul de niveau à partir de l'XP cumulée, et l'affichage complet (niveau actuel + barre de progression vers le niveau suivant) sur l'overview étudiant.

## Contexte

Le §13.3 pose le principe (« mécanique de motivation demandée par le client ») sans fixer le barème exact ni la formule de paliers — c'est une décision de conception à prendre maintenant, en s'assurant qu'elle reste équilibrée (ni trop lente à progresser, ni triviale).

## Étapes détaillées

1. **Barème de gain d'XP** (`xpService.js`, étendu depuis la tâche 2.5) — proposition à valider avec l'équipe/le client :
   - Leçon terminée : 10 XP.
   - Quiz réussi (première fois) : 20 XP + bonus proportionnel au score (ex. +0,2 XP par point au-dessus du seuil, plafonné).
   - Exercice résolu : 15 XP.
   - Sous-module entièrement terminé (bonus de complétion, §18.1 « + XP ») : 25 XP supplémentaires.
   - Documenter ce barème dans une constante centralisée (`config/xpRules.js`) plutôt que dispersée dans les contrôleurs, pour rester facilement ajustable.

2. **Formule de niveau** — ex. paliers en progression géométrique ou par table explicite :
   - Option simple : `level = floor(sqrt(xp / 50)) + 1` (ou toute formule à courbe croissante) — ou une **table de paliers explicite** (`[0, 100, 250, 450, 700, ...]`) plus facile à ajuster manuellement palier par palier. Recommandé pour un contenu pédagogique avec un nombre fini de modules : une table explicite, plus prévisible et communicable au client.
   - Fonction pure `computeLevel(xp)` retournant `{ level, xpIntoLevel, xpForNextLevel }` — utilisée à la fois pour mettre à jour `User.level` à chaque gain d'XP et pour l'affichage de la barre de progression.

3. **Mise à jour automatique** — à chaque attribution d'XP (`xpService.award`), recalculer et sauvegarder `User.level` si le palier a changé ; envisager un retour d'information visible (« Félicitations, niveau supérieur ! ») côté frontend si l'événement de changement de niveau est signalé par l'API (champ `leveledUp: boolean` dans la réponse des endpoints de progression concernés).

4. **Frontend** (`components/student/LevelProgress.jsx`, créé en tâche 2.9) — finaliser l'affichage : niveau actuel, barre de progression (`xpIntoLevel / xpForNextLevel`), et une notification ponctuelle (snackbar/confetti léger) lors d'un changement de niveau si l'information est disponible.

## Fichiers à créer / modifier

```
server/src/
├── config/xpRules.js
├── services/xpService.js         # étendu : award(), computeLevel()
└── (contrôleurs de progression déjà créés en Phase 2, mis à jour pour renvoyer leveledUp)

client/src/
└── components/student/LevelProgress.jsx   # finalisé
```

## Modèles de données concernés

`User` (champs `xp`, `level`, §10.1).

## Règles métier / cas limites

- Le calcul de niveau doit rester déterministe et cohérent : recalculer `level` à partir de `xp` à chaque lecture plutôt que de risquer une désynchronisation entre les deux champs stockés séparément — ou, a minima, toujours les mettre à jour ensemble dans la même opération.
- Ne jamais permettre à un XP négatif ou une régression de niveau (le système est purement additif dans ce cahier des charges).

## Critères d'acceptation

- [ ] Chaque action de progression (leçon, quiz, exercice, complétion de sous-module) attribue le bon montant d'XP une seule fois.
- [ ] La barre de progression vers le niveau suivant reflète fidèlement la formule choisie.
- [ ] Un changement de niveau est visible côté élève de façon claire.
- [ ] Le barème est centralisé dans un seul fichier, modifiable sans toucher aux contrôleurs.
