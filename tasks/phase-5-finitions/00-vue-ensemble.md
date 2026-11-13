# Phase 5 — Finitions

**Réfs cahier des charges :** §16 (Phase 5), §12.4, §13.3, §14, §15, §17.

## Objectif de la phase

Transformer la plateforme fonctionnelle issue des phases 0-4 en un produit prêt pour un usage réel : système de motivation XP/niveaux complet, responsive abouti sur tous les écrans, états UX soignés (chargement/vide/erreur) partout, sécurité renforcée et auditée, et une base de tests. C'est aussi dans cette phase que les livrables documentaires (§17) sont finalisés.

## Prérequis

Phases 0 à 4 terminées — cette phase consolide l'ensemble plutôt que d'ajouter de nouvelles routes/pages.

## Tâches de la phase

1. [01-systeme-xp-niveaux.md](01-systeme-xp-niveaux.md) — Barème XP complet et calcul des niveaux (finalise ce qui a été amorcé en tâche 2.5/2.9).
2. [02-responsive-mobile.md](02-responsive-mobile.md) — Audit et corrections responsive sur toute la plateforme.
3. [03-etats-ux-chargement-vides-erreurs.md](03-etats-ux-chargement-vides-erreurs.md) — Audit et harmonisation des états de chargement/vides/erreurs.
4. [04-securite-renforcee.md](04-securite-renforcee.md) — Audit de sécurité complet et durcissement.
5. [05-tests-qualite.md](05-tests-qualite.md) — Tests (backend prioritaire, frontend si le temps le permet) et finalisation des livrables documentaires.

Ces 5 tâches sont largement indépendantes et transverses — peuvent être réparties entre plusieurs personnes en parallèle, chacune passant en revue l'ensemble de la plateforme sous un angle différent.

## Definition of done de la phase

- [ ] Le système XP/niveaux est visible et cohérent sur l'overview étudiant, avec un barème documenté.
- [ ] Toutes les pages sont utilisables sur mobile, tablette et desktop, sidebar comprise (menu hamburger).
- [ ] Chaque liste/formulaire asynchrone de la plateforme a un état de chargement, un état vide et une gestion d'erreur cohérents.
- [ ] Un audit de sécurité (§15) a été mené et les manquements corrigés.
- [ ] Les livrables du §17 sont finalisés : README d'installation, documentation des endpoints API.
