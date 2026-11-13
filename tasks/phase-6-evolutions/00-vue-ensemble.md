# Phase 6 — Évolutions (V2, hors périmètre initial)

**Réfs cahier des charges :** §16 (Phase 6), §2.3 (périmètre exclu), §5.3, §8.4, §13.3.

## Objectif de la phase

Ce dossier documente les évolutions explicitement identifiées par le cahier des charges comme **hors périmètre de la version initiale**, à considérer une fois les phases 0-5 livrées et validées. Elles ne bloquent pas la mise en production du MVP, mais sont préparées ici pour que l'équipe garde une vision claire de la suite.

## Prérequis

Phases 0 à 5 terminées et plateforme en production (ou au moins validée par le client).

## Tâches de la phase

1. [01-execution-code-python.md](01-execution-code-python.md) — Exécution automatique et vérification du code Python (§8.4 V2).
2. [02-mot-de-passe-oublie.md](02-mot-de-passe-oublie.md) — Fonctionnalité « Mot de passe oublié » (§5.3).
3. [03-badges-notifications.md](03-badges-notifications.md) — Badges/récompenses par jalons et notifications (§13.3, §16).

Ces trois tâches sont indépendantes entre elles.

## Ce qui reste explicitement hors périmètre même après cette phase (§2.3)

- Rôle « enseignant » (uniquement `student` et `admin`).
- Paiement / abonnement.
- Messagerie temps réel entre utilisateurs.
- Application mobile native.

Si l'une de ces exclusions devient une demande future, elle nécessite un nouveau cahier des charges/tâches dédiés — ne pas les improviser dans le prolongement de ce dossier.
