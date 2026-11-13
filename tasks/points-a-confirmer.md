# Points à confirmer avec le client

Repris et détaillés depuis le §18.2 du cahier des charges. Ces décisions ne bloquent pas le démarrage du développement (des valeurs par défaut raisonnables sont proposées), mais doivent être tranchées avant la mise en production.

| # | Question | Valeur par défaut proposée (à utiliser si pas de réponse) | Tâche(s) impactée(s) |
|---|---|---|---|
| 1 | Mots-clés **exacts** de la notation algorithmique tunisienne (majuscules, accents, orthographe officielle) selon le programme visé. | Utiliser la notation du §8.3 telle quelle (`Début`/`Fin`, `←`, `Si…Alors…Sinon…Finsi`, etc.). | [phase-2-pedagogique/08-editeur-code-algorithme-python.md](phase-2-pedagogique/08-editeur-code-algorithme-python.md), [phase-2-pedagogique/02-api-lecons.md](phase-2-pedagogique/02-api-lecons.md) |
| 2 | Seuil de réussite par défaut des quiz. | **60 %** | [phase-2-pedagogique/03-api-quiz.md](phase-2-pedagogique/03-api-quiz.md), [phase-4-admin/08-parametres-generaux.md](phase-4-admin/08-parametres-generaux.md) |
| 3 | Nombre de tentatives de quiz par défaut. | **Illimité** (`maxAttempts = 0`) | [phase-2-pedagogique/03-api-quiz.md](phase-2-pedagogique/03-api-quiz.md), [phase-4-admin/08-parametres-generaux.md](phase-4-admin/08-parametres-generaux.md) |
| 4 | Palette de couleurs définitive. | Palette proposée au §12.3 (bleu indigo `#2F5BFF`, vert `#22C55E`, etc.) | [phase-0-fondations/05-setup-frontend-theme-mui.md](phase-0-fondations/05-setup-frontend-theme-mui.md) |
| 5 | Exécution automatique du code Python dès la V1, ou reportée en V2 ? | **Reportée en V2** (MVP = comparaison manuelle à la solution de référence, cf. §8.4) | [phase-2-pedagogique/08-editeur-code-algorithme-python.md](phase-2-pedagogique/08-editeur-code-algorithme-python.md), [phase-6-evolutions/01-execution-code-python.md](phase-6-evolutions/01-execution-code-python.md) |
| 6 | Stockage des photos de profil : local serveur ou service externe (Cloudinary) ? | **Stockage local serveur** via `multer` (`server/uploads/`) pour le MVP, migration Cloudinary possible plus tard sans changer le contrat d'API (`profilePicture` reste une URL). | [phase-3-outils-personnels/04-profil-utilisateur.md](phase-3-outils-personnels/04-profil-utilisateur.md) |
| 7 | Contenu réel des sous-modules **Algorithmique** et **STI** (découpage précis, textes de leçons, questions de quiz, énoncés d'exercices). | Utiliser la liste indicative du §8.5 pour amorcer la Phase 0 (seed) ; contenu définitif saisi ensuite via l'interface admin (Phase 4). | [phase-0-fondations/04-seed-donnees-demo.md](phase-0-fondations/04-seed-donnees-demo.md) |

## Comment traiter ces points

- Ne pas bloquer le développement en attendant une réponse : implémenter avec la valeur par défaut, et **rendre le paramètre configurable** (surtout #2 et #3, déjà prévus comme champs `passingScore` / `maxAttempts` par quiz, et des valeurs par défaut globales dans `/admin/parametres`).
- Revalider ces points avec le client avant la Phase 5 (Finitions) et impérativement avant mise en production.
