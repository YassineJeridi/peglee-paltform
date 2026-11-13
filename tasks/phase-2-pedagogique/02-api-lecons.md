# Tâche 2.2 — API Leçons (lecture élève)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [01-api-modules-sous-modules.md](01-api-modules-sous-modules.md)
**Réfs cahier des charges :** §6.2.3 (onglet Leçon), §8.2, §8.3, §10.4, §11.3

## Objectif

Implémenter `GET /api/lessons/:subModuleId`, qui renvoie le contenu de la leçon associée à un sous-module.

## Contexte

C'est l'endpoint le plus simple de la phase (pas de logique de déverrouillage à ce niveau — la leçon est **toujours accessible**, c'est elle qui débloque la suite, cf. §6.2.3 : « Bouton "J'ai terminé la leçon" qui marque la leçon comme lue et débloque le quiz »). Le contenu doit pouvoir représenter du texte riche, des images et des blocs de code en notation algorithmique tunisienne **et** en Python (§8.2, §8.3).

## Étapes détaillées

1. **`GET /api/lessons/:subModuleId`** 🔒
   - Cherche la `Lesson` par `subModuleId`.
   - Renvoie `404` avec message clair si aucune leçon n'existe encore pour ce sous-module (cas possible si l'admin n'a pas encore saisi le contenu, §7.4).
   - Renvoie `title`, `content` (HTML/Markdown riche), `videoUrl`, `attachments`.

2. **Format du champ `content`**
   - Décider explicitement du format retenu (Markdown ou HTML) — cohérent avec le choix fait pour l'éditeur admin (tâche 4.5). **Recommandation** : Markdown stocké tel quel en base, rendu côté client avec une librairie de rendu Markdown + coloration syntaxique (react-markdown + un plugin de coloration, ou équivalent) plutôt que du HTML brut stocké (plus sûr, évite les risques d'injection XSS liés à un `dangerouslySetInnerHTML` non filtré).
   - Si HTML riche est retenu à la place (éditeur WYSIWYG), s'assurer d'un assainissement (sanitization) strict du contenu à l'enregistrement (tâche 4.5) — ne jamais faire confiance à du HTML stocké en base pour un rendu direct sans sanitization.

3. **Pas de logique de restriction d'accès particulière** au-delà de `auth` — toute la logique de déverrouillage porte sur le Quiz et les Exercices, pas sur la Leçon elle-même.

## Fichiers à créer / modifier

```
server/src/
├── controllers/lessonController.js
└── routes/lessonRoutes.js
```

## Modèles de données concernés

`Lesson` (§10.4).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/lessons/:subModuleId` 🔒 | Leçon d'un sous-module. |

## Règles métier / cas limites

- Un `subModuleId` valide mais sans leçon associée doit renvoyer une erreur explicite distincte d'un `subModuleId` invalide (400 vs 404).
- Le contenu de la leçon ne doit jamais être rendu côté client sans passer par un sanitizer si HTML est utilisé.

## Critères d'acceptation

- [ ] `GET /api/lessons/:subModuleId` renvoie le contenu correct pour un sous-module du seed.
- [ ] Un sous-module valide sans leçon renvoie `404` avec un message clair, pas une erreur 500.
- [ ] Le contenu renvoyé, une fois rendu côté client (tâche 2.7), affiche correctement texte, blocs de code algorithme et blocs de code Python distincts.
