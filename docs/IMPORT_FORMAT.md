# Import de contenu par fichier JSON

Dans l'administration : **Admin → Import**. On dépose un fichier `.json` ; la plateforme le valide, affiche un aperçu, puis (après confirmation) enregistre **leçon + quiz + exercices** d'un sous-module en base.

**Pourquoi JSON ?** Un quiz exige une structure exacte (types de questions, indices des bonnes réponses). JSON est strictement validable, ce qui permet de rejeter précisément toute erreur (avec son chemin, ex. `quiz.questions[2].correctAnswers`) plutôt que d'« interpréter » un texte libre. Le contenu des leçons reste du **Markdown** (dans une chaîne JSON).

Modèle prêt à remplir : [templates/content-template.json](templates/content-template.json) (téléchargeable aussi depuis la page Import).

## Règles générales

- Un fichier = **un paquet** (un sous-module) **ou** `{ "schemaVersion": 1, "packages": [ {...}, {...} ] }` (jusqu'à 50 sous-modules).
- Taille max 2 Mo. Encodage UTF-8.
- **Tout ou rien** : s'il y a une seule erreur, rien n'est enregistré.
- **Réimport sans doublon (upsert)** :
  - sous-module retrouvé par *(module, titre)*, créé sinon ;
  - leçon et quiz : **remplacés** ;
  - exercices retrouvés par **titre** (mis à jour), créés sinon.
- Dans une chaîne JSON : retour à la ligne = `\n`, guillemet = `\"`.

## Structure d'un paquet

| Champ | Requis | Description |
|---|---|---|
| `schemaVersion` | non | `1` |
| `module.slug` | **oui** | Slug d'un module existant (ex. `algorithmique`, `sti`). Si le module n'existe pas, ajouter `module.title` (+ `description`, `icon`, `color`) pour le créer. |
| `subModule.title` | **oui** | Titre du sous-module (clé de recherche). |
| `subModule.description / order / estimatedDuration` | non | Description, position, durée en minutes. |
| `lesson` | non* | `{ title, content (Markdown), videoUrl? }` |
| `quiz` | non* | voir ci-dessous |
| `exercises` | non* | liste, voir ci-dessous |

\* Au moins un des trois (`lesson`, `quiz`, `exercises`) est requis.

### `quiz`

| Champ | Requis | Description |
|---|---|---|
| `title` | oui | Titre |
| `passingScore` | non (60) | Seuil de réussite 0–100 |
| `maxAttempts` | non (0) | Tentatives max, `0` = illimité |
| `questions` | oui | Liste (≥ 1) |

Chaque question : `type`, `text`, `explanation?`, `points?` (défaut 1), et selon le type :

| `type` | `options` | `correctAnswers` |
|---|---|---|
| `single` | 2 à 8 textes | **un seul** indice, à partir de 0 : `[1]` |
| `multiple` | 2 à 8 textes | liste d'indices : `[0, 2]` |
| `boolean` | (ignorées) | `true` / `false` |
| `short` | (aucune) | texte `"MOD"` ou liste de réponses acceptées `["MOD","mod"]` |

### `exercises[]`

| Champ | Requis | Description |
|---|---|---|
| `title` | oui | Unique dans le fichier (clé de mise à jour) |
| `type` | oui | `algorithme` ou `python` |
| `statement` | oui | Énoncé (Markdown) |
| `solution` | oui | Solution de référence |
| `difficulty` | non | `facile`, `moyen` (défaut), `difficile` |
| `order` | non | Position (défaut : ordre dans la liste) |
| `starterCode` | non | Code de départ |
| `tests` | non | **Python uniquement** : `[{ "input": "17\n5\n", "expectedOutput": "2" }]` — active le bouton « Exécuter » pour l'élève. Le code de l'élève doit produire exactement `expectedOutput` (espaces de fin ignorés). |

## Erreurs

La réponse liste chaque problème avec son chemin, par exemple :

```
quiz.questions[0].correctAnswers — Liste d'indices (à partir de 0) valides dans options attendue.
exercises[1].type — Type invalide (attendu : algorithme, python).
```
