# Tâche 2.8 — Éditeur de code (mode Algorithme + mode Python)

**Phase :** 2 — Cœur pédagogique
**Dépendances :** [phase-0-fondations/05-setup-frontend-theme-mui.md](../phase-0-fondations/05-setup-frontend-theme-mui.md)
**Réfs cahier des charges :** §8.3, §8.4, §9.2

## Objectif

Intégrer un composant éditeur de code réutilisable dans le navigateur, avec un **mode Algorithme** (coloration adaptée à la notation tunisienne) et un **mode Python** (coloration Python standard), utilisé dans l'onglet Exercices (tâche 2.7) et potentiellement dans l'éditeur de leçons admin (Phase 4).

## Contexte

Le §8.3 et §8.4 sont explicites sur ce que doit couvrir la notation tunisienne : structure `Début…Fin`, T.D.O, types (`entier`, `réel`, `booléen`, `caractère`, `chaîne`), affectation `←`, `écrire`/`lire`, opérateurs (`DIV`, `MOD`, `ET`, `OU`, `NON`), structures conditionnelles (`Si…Alors…Sinon…Finsi`, `Selon…Fin Selon`), structures itératives (`Pour…Faire…Fin Pour`, `Tant Que…Faire…Fin Tant Que`, `Répéter…Jusqu'à`), tableaux/chaînes/enregistrements, `Fonction`/`Procédure`. Il n'existe pas de grammaire Monaco/CodeMirror standard pour cette notation — il faut la définir soi-même.

## Étapes détaillées

1. **Choix de la librairie** — Monaco Editor (`@monaco-editor/react`) recommandé pour sa richesse (autocomplétion, thèmes) ; CodeMirror est une alternative plus légère. Ce document suppose Monaco, à adapter si CodeMirror est retenu.

2. **Mode Python**
   - Monaco supporte Python nativement (`language="python"`) — configuration minimale suffit.

3. **Mode Algorithme (notation tunisienne)** — travail sur-mesure :
   - Enregistrer un **langage personnalisé** Monaco (`monaco.languages.register({ id: 'tunisian-algo' })`).
   - Définir un **tokenizer** (`setMonarchTokensProvider`) reconnaissant :
     - mots-clés de structure : `Début`, `Fin`, `Algorithme`, `T.D.O` ;
     - types : `entier`, `réel`, `booléen`, `caractère`, `chaîne` ;
     - mots-clés de contrôle : `Si`, `Alors`, `Sinon`, `Finsi`, `Selon`, `Fin Selon`, `Pour`, `de`, `à`, `Faire`, `Fin Pour`, `Tant Que`, `Fin Tant Que`, `Répéter`, `Jusqu'à` ;
     - mots-clés d'E/S : `écrire`, `lire` ;
     - opérateurs logiques : `ET`, `OU`, `NON` ;
     - opérateurs arithmétiques spéciaux : `DIV`, `MOD` ;
     - sous-programmes : `Fonction`, `Procédure` ;
     - le symbole d'affectation `←` comme opérateur distinct.
   - Définir un thème de coloration associé (couleurs cohérentes avec le thème MUI général, mais l'éditeur de code garde souvent son propre thème sombre/clair dédié — choix à documenter).
   - **Saisie facilitée du symbole `←`** : le clavier ne le propose pas nativement — prévoir un raccourci (ex. taper `<-` auto-remplacé en `←`) ou un bouton dans la barre d'outils de l'éditeur pour l'insérer.
   - Indentation automatique basique après les mots-clés ouvrants (`Alors`, `Faire`, `Début`) — configuration `onEnterRules` ou gestion manuelle simplifiée pour le MVP (le cahier des charges demande un « support minimal », §8.4).

4. **Composant réutilisable** (`components/CodeEditor.jsx`)
   - Props : `mode` (`'algorithme' | 'python'`), `value`, `onChange`, `readOnly`, `height`.
   - Bascule automatique du langage Monaco selon `mode`.
   - Utilisé par `ExerciseCard` (tâche 2.7) et, plus tard, par l'éditeur de contenu de leçon admin si des blocs de code interactifs y sont prévus (tâche 4.5 utilise plutôt un éditeur de texte riche classique avec des blocs `<code>` statiques — clarifier cette distinction dans la tâche 4.5).

5. **MVP de correction** (§8.4) : pas d'exécution, seulement comparaison visuelle avec la solution de référence affichée à côté ou en dessous (« Voir la solution ») — l'éditeur sert uniquement à la rédaction, pas à l'évaluation automatique en V1.

## Fichiers à créer / modifier

```
client/src/
├── components/CodeEditor.jsx
└── utils/monacoTunisianAlgoLanguage.js   # définition du langage + thème personnalisés
```

## Règles métier / cas limites

- Les mots-clés exacts sont **à confirmer avec le client** (voir [points-a-confirmer.md](../points-a-confirmer.md) #1) — implémenter la liste du §8.3 comme point de départ, mais structurer le tokenizer pour qu'ajouter/renommer un mot-clé soit une modification localisée (liste de mots-clés externalisée, pas hardcodée dans plusieurs regex dispersées).
- L'éditeur doit rester utilisable sur mobile/tablette dans la mesure du raisonnable (au minimum lisible, l'édition tactile de code étant intrinsèquement limitée — acceptable de recommander desktop pour cette fonctionnalité spécifique).

## Critères d'acceptation

- [ ] Un exercice de type `algorithme` affiche l'éditeur avec coloration des mots-clés tunisiens définis au §8.3.
- [ ] Un exercice de type `python` affiche l'éditeur avec coloration Python standard.
- [ ] Le symbole `←` est saisissable facilement (raccourci ou bouton), sans obliger l'élève à le copier-coller.
- [ ] Le composant `CodeEditor` est utilisé de façon identique dans les deux modes (même API de props), garantissant une UX cohérente.
