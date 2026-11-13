# Tâche 5.3 — États UX (chargement, vides, erreurs, confirmations)

**Phase :** 5 — Finitions
**Dépendances :** l'ensemble des pages des phases 1 à 4
**Réfs cahier des charges :** §12.4, §14

## Objectif

Auditer systématiquement toutes les vues asynchrones de la plateforme pour garantir la présence cohérente des quatre états attendus par le §12.4 : chargement (skeleton/spinner), vide (message + action), erreur/succès (snackbars), et confirmation avant suppression.

## Contexte

Ces états ont été posés au fil de l'eau dans les tâches précédentes (notamment via les composants génériques `LoadingSpinner`/`EmptyState` de la tâche 0.5), mais rien ne garantit qu'ils ont été appliqués **partout** de façon cohérente — cette tâche est la passe de contrôle qualité dédiée.

## Étapes détaillées

1. **Grille d'audit** — pour chaque page listant des données asynchrones (Overview élève/admin, Cours, unité d'apprentissage, Kanban, Notes, Calendrier, toutes les pages admin), vérifier :
   - **État de chargement** : un skeleton ou spinner s'affiche pendant le fetch initial, pas un écran blanc ni un flash de contenu vide.
   - **État vide** : un message clair + éventuelle action (« Aucune tâche pour l'instant », « Aucun module disponible ») s'affiche quand la liste est réellement vide (à distinguer du chargement).
   - **État d'erreur réseau/serveur** : un message clair s'affiche si l'appel échoue (pas un écran cassé, pas une erreur JS non gérée dans la console visible à l'utilisateur).
2. **Snackbars de succès/erreur** — vérifier la cohérence des messages après chaque action de mutation (créer/modifier/supprimer) sur toutes les pages : Kanban, Notes, Calendrier, Profil, et toutes les pages admin (utilisateurs, modules, leçons, quiz, exercices, paramètres).
3. **Dialogues de confirmation avant suppression** — vérifier leur présence sur toutes les actions destructives : suppression de tâche Kanban, note, événement, utilisateur, module, sous-module, leçon, quiz, exercice.
4. **Éléments verrouillés** — revalider spécifiquement l'onglet Exercices verrouillé (tâche 2.7) : cadenas visible + info-bulle expliquant comment débloquer (§12.4), cohérent sur toutes les instances (pas seulement le cas testé initialement).
5. **Harmonisation** — si des divergences de style/texte sont trouvées entre pages (ex. une page dit « Chargement... » et une autre utilise un skeleton), harmoniser vers un pattern unique par type de composant (skeleton pour les listes/cartes, spinner pour les actions ponctuelles).

## Fichiers à créer / modifier

Corrections transverses ; possible extraction de composants génériques supplémentaires si des patterns répétés sont identifiés (ex. `ConfirmDialog.jsx` générique si pas déjà mutualisé).

## Règles métier / cas limites

- Ne jamais laisser une erreur réseau silencieuse — l'utilisateur doit toujours comprendre qu'une action a échoué et pourquoi (message en français, cf. §14 internationalisation).

## Critères d'acceptation

- [ ] Chaque page listée a été revue avec la grille d'audit ci-dessus ; les manques corrigés.
- [ ] Toutes les actions destructives demandent confirmation.
- [ ] Aucune page n'affiche un écran blanc ou cassé en cas d'erreur réseau simulée (test en coupant le backend momentanément).
- [ ] Les messages de succès/erreur sont cohérents en ton et en style sur toute la plateforme.
