# Tâche 4.5 — Gestion des leçons (`/admin/lecons`)

**Phase :** 4 — Espace administrateur
**Dépendances :** [04-gestion-modules-sous-modules.md](04-gestion-modules-sous-modules.md), [phase-2-pedagogique/02-api-lecons.md](../phase-2-pedagogique/02-api-lecons.md), [phase-2-pedagogique/08-editeur-code-algorithme-python.md](../phase-2-pedagogique/08-editeur-code-algorithme-python.md) (pour la cohérence des blocs de code)
**Réfs cahier des charges :** §7.4, §8.2, §8.3, §10.4, §11.3

## Objectif

CRUD complet des leçons côté API, et interface d'administration avec un éditeur de contenu riche permettant titres, texte, listes, images, blocs de code colorés (algorithme + Python), tableaux, et prévisualisation avant publication.

## Contexte

C'est l'endroit où l'admin traduit concrètement la démarche pédagogique tunisienne (§8.2 : analyse → algorithme → Python) dans le contenu vu par les élèves. La qualité de cet éditeur conditionne directement la qualité perçue de toute la plateforme.

## Étapes détaillées — Backend

1. **`POST /api/lessons`** 👑 — création (`subModuleId`, `title`, `content`, `videoUrl`, `attachments`). Contrainte d'unicité 1-1 avec `subModuleId` déjà posée au niveau du schéma (tâche 0.3) — renvoyer une erreur claire si une leçon existe déjà pour ce sous-module (proposer plutôt une modification).
2. **`PUT /api/lessons/:id`** 👑 — édition.
3. **`DELETE /api/lessons/:id`** 👑 — suppression.
4. **Sanitization du contenu** (si HTML riche retenu, cf. discussion tâche 2.2) : assainir le HTML soumis côté serveur avant stockage (ex. librairie de sanitization) pour empêcher l'injection de scripts malveillants — l'admin est un rôle de confiance mais reste une bonne pratique de défense en profondeur, et protège aussi contre un compte admin compromis.

## Étapes détaillées — Frontend

1. **Choix de l'éditeur** — cohérent avec le format de stockage décidé en tâche 2.2 :
   - Si Markdown : un éditeur Markdown avec panneau de prévisualisation en temps réel (ex. un éditeur type MDX/Markdown avec toolbar), boutons pour insérer facilement un bloc de code algorithme ou Python (insertion de fences ```` ```algorithme ```` / ```` ```python ```` avec coloration correspondante en prévisualisation, réutilisant la définition de langage de la tâche 2.8 pour la prévisualisation).
   - Si HTML/WYSIWYG : un éditeur riche (type TipTap/Quill/CKEditor) avec extension pour insérer des blocs de code.
   - Documenter le choix retenu ; ce document part sur l'option Markdown, plus simple à sécuriser et à versionner.
2. **Page `AdminLecons.jsx`** (`pages/admin/AdminLecons.jsx`, route `/admin/lecons`)
   - Sélection du sous-module concerné (liste déroulante alimentée par la tâche 4.4).
   - Éditeur : `title`, éditeur de `content` avec toolbar (titres, listes, images — upload ou URL, blocs de code), `videoUrl` (champ URL avec validation de format embed), `attachments` (upload multiple ou liste d'URLs).
   - **Bouton Prévisualisation** : affiche le rendu final tel que vu par l'élève (réutiliser le composant `LessonTab` de la tâche 2.7 en mode lecture, alimenté par le contenu en cours d'édition plutôt que par un appel API — évite de dupliquer la logique de rendu).
   - Sauvegarde (création ou mise à jour selon si une leçon existe déjà pour ce sous-module).

## Fichiers à créer / modifier

```
server/src/
├── controllers/lessonController.js   # étendu (CRUD complet)
├── routes/lessonRoutes.js            # étendu avec role('admin') sur les routes d'écriture
└── utils/sanitizeHtml.js             # si HTML retenu

client/src/
├── api/adminLessonsApi.js
├── pages/admin/AdminLecons.jsx
└── components/admin/
    ├── LessonEditor.jsx
    └── LessonPreview.jsx             # réutilise LessonTab en mode lecture seule
```

## Modèles de données concernés

`Lesson` (§10.4).

## Endpoints API concernés

`POST/PUT/DELETE /api/lessons` 👑 (§11.3).

## Règles métier / cas limites

- Un sous-module ne peut avoir qu'une seule leçon (contrainte déjà en base) — l'interface doit basculer automatiquement en mode édition si une leçon existe déjà pour le sous-module sélectionné, plutôt que de tenter une création qui échouera.
- Le contenu doit rester assaini avant stockage si le format est HTML.
- La prévisualisation doit être fidèle au rendu réel côté élève — tout écart est un bug (utiliser le même composant de rendu des deux côtés, pas deux implémentations séparées).

## Critères d'acceptation

- [ ] Créer une leçon pour un sous-module sans leçon existante fonctionne, et le contenu apparaît immédiatement dans l'onglet Leçon côté élève.
- [ ] Modifier une leçon existante met à jour le contenu vu côté élève.
- [ ] La prévisualisation admin correspond exactement au rendu final côté élève.
- [ ] Un bloc de code algorithme et un bloc de code Python dans la leçon s'affichent avec des colorations distinctes et correctes.
- [ ] Toute tentative d'écriture par un compte `student` échoue en `403`.
