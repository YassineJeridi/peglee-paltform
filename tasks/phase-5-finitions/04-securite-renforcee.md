# Tâche 5.4 — Sécurité renforcée (audit)

**Phase :** 5 — Finitions
**Dépendances :** l'ensemble du backend des phases 1 à 4
**Réfs cahier des charges :** §15 (intégralement), §11.6

## Objectif

Reprendre systématiquement chaque point de la checklist de sécurité du §15 et vérifier qu'il est effectivement respecté à travers toute l'API, pas seulement là où il a été explicitement mentionné dans les tâches précédentes.

## Contexte

Beaucoup de règles de sécurité ont déjà été posées au fil des phases (hachage bcrypt en 1.1, isolation par `userId` en Phase 3, verrouillage serveur des exercices en 2.4…). Cette tâche est un **audit croisé**, pas une nouvelle implémentation — son but est de trouver les oublis et incohérences qui apparaissent naturellement quand plusieurs personnes développent des routes différentes au fil du temps.

## Étapes détaillées (checklist à dérouler point par point, §15)

1. **Mots de passe** — confirmer qu'aucun endpoint, aucun log, aucune réponse API n'expose jamais `passwordHash` en clair ou haché (grep sur le code pour toute désérialisation de `User` qui n'exclut pas ce champ).
2. **JWT** — vérifier l'expiration effective (`JWT_EXPIRES_IN` bien appliqué), la robustesse du secret en environnement de prod (documenté, pas une valeur par défaut faible committée), et la stratégie de stockage côté client (cohérente avec le choix fait en tâche 1.1 — si cookie httpOnly, vérifier `secure`/`sameSite` corrects en prod).
3. **Middlewares d'autorisation** — parcourir **toutes** les routes définies dans `server/src/routes/` et vérifier qu'aucune route sensible n'a été montée sans `auth` et/ou `role('admin')` là où c'est requis (erreur classique : un développeur ajoute une route CRUD admin et oublie le middleware sur une seule des 4 méthodes HTTP). Construire un tableau de vérification croisant chaque endpoint du §11 avec le middleware effectivement appliqué en code.
4. **Validation/assainissement des entrées** — vérifier que `express-validator` (ou équivalent) est appliqué sur tous les endpoints acceptant un body, pas seulement `auth`.
5. **`helmet`/`cors`/`express-rate-limit`** — confirmer leur présence effective en prod (pas seulement en dev), et que `cors` reste restreint au domaine client réel (pas de `*` oublié).
6. **Upload d'images** — revalider taille/type/nom de fichier assaini sur l'upload d'avatar (tâche 3.4) ; vérifier qu'aucun autre point d'upload n'a été ajouté ailleurs sans les mêmes garde-fous.
7. **Isolation des données** — grep systématique sur les contrôleurs `Task`/`Note`/`Event`/`QuizAttempt`/`Progress` pour confirmer qu'**aucune** requête ne s'exécute sans filtre `userId: req.user.id` (sauf, légitimement, côté admin).
8. **Contenu quiz** — retester explicitement (requête réseau brute) que `GET /api/quiz/:subModuleId` ne renvoie jamais `correctAnswers`/`explanation` avant soumission (retest de la tâche 2.3, en conditions réelles après toutes les évolutions du code depuis).
9. **HTTPS en production** — documenter la configuration attendue au déploiement (reverse proxy/certificats), même si ce n'est pas géré par le code applicatif lui-même.

## Fichiers à créer / modifier

Pas de nouveaux fichiers dédiés en général — corrections ciblées là où l'audit révèle un manquement. Si un tableau de correspondance endpoints/middlewares est produit, le conserver comme documentation (ex. `server/SECURITY_CHECKLIST.md`).

## Règles métier / cas limites

- Traiter chaque écart trouvé comme un bug de sécurité à corriger avant la fin de la phase, pas une amélioration facultative.

## Critères d'acceptation

- [ ] Chaque point de la checklist §15 a été vérifié explicitement et documenté (fait/non applicable/corrigé).
- [ ] Aucune route sensible n'est accessible sans le middleware d'autorisation attendu (vérifié par tests manuels ou automatisés avec un token `student` sur des routes `admin`, et sans token du tout).
- [ ] Aucune donnée d'un utilisateur n'est accessible par un autre élève (test croisé avec deux comptes).
- [ ] Le quiz ne fuite jamais les bonnes réponses avant soumission (retest réseau explicite).
