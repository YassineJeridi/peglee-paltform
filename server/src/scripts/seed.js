const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { User, Module, SubModule, Lesson, Quiz, Exercise, Progress, QuizAttempt, Badge } = require('../models');
const { algorithmiqueExtra, stiExtra, defaultBadges } = require('./seedContent');
const { runPython } = require('../services/codeExecutionService');

const RESET = process.argv.includes('--reset');

const algorithmiqueSubModules = [
  {
    title: 'Les variables et les types',
    description:
      "Déclarer des objets dans la T.D.O, choisir le bon type et manipuler l'affectation.",
    order: 1,
    estimatedDuration: 45,
    lesson: {
      title: 'Les variables et les types de base',
      content: `## 1. Analyse

On souhaite calculer la **moyenne de deux notes** saisies par l'utilisateur.

| Objet | Rôle |
|---|---|
| \`note1\`, \`note2\` | les deux notes saisies |
| \`moyenne\` | le résultat du calcul |

Résultat = \`moyenne\`
moyenne ← (note1 + note2) / 2
note1 = donnée
note2 = donnée

## 2. Algorithme

\`\`\`algorithme
Algorithme Moyenne
Début
  écrire("Donner la première note : "), lire(note1)
  écrire("Donner la deuxième note : "), lire(note2)
  moyenne ← (note1 + note2) / 2
  écrire("La moyenne est : ", moyenne)
Fin

T.D.O
| Objet   | Type/Nature |
|---------|-------------|
| note1   | réel        |
| note2   | réel        |
| moyenne | réel        |
\`\`\`

## 3. Traduction en Python

\`\`\`python
note1 = float(input("Donner la première note : "))
note2 = float(input("Donner la deuxième note : "))
moyenne = (note1 + note2) / 2
print("La moyenne est :", moyenne)
\`\`\`

## À retenir

- Les **types de base** sont : \`entier\`, \`réel\`, \`booléen\`, \`caractère\`, \`chaîne\`.
- L'**affectation** s'écrit avec la flèche \`←\` (et non \`=\`, qui est un test d'égalité).
- Toute variable utilisée dans le corps de l'algorithme doit être déclarée dans la **T.D.O**.
- \`DIV\` donne le quotient entier et \`MOD\` le reste : \`17 DIV 5 = 3\`, \`17 MOD 5 = 2\`.`,
    },
    quiz: {
      title: 'Quiz — Les variables et les types',
      questions: [
        {
          text: "Quel symbole représente l'affectation en notation algorithmique tunisienne ?",
          type: 'single',
          options: ['=', '←', '==', ':='],
          correctAnswers: [1],
          explanation: "L'affectation s'écrit avec la flèche ←. Le symbole = sert au test d'égalité.",
          points: 1,
        },
        {
          text: 'Que signifie l\'abréviation T.D.O ?',
          type: 'single',
          options: [
            'Table De Déclaration des Objets',
            'Tableau Des Opérations',
            'Test De Développement Objet',
            'Type De Donnée Obligatoire',
          ],
          correctAnswers: [0],
          explanation:
            'La T.D.O (Table de Déclaration des Objets) recense chaque objet utilisé et son type.',
          points: 1,
        },
        {
          text: 'Le type booléen ne peut prendre que deux valeurs : vrai ou faux.',
          type: 'boolean',
          options: ['Vrai', 'Faux'],
          correctAnswers: [0],
          explanation: 'Un booléen vaut vrai ou faux, rien d\'autre.',
          points: 1,
        },
        {
          text: 'Quel est le résultat de 17 MOD 5 ?',
          type: 'short',
          options: [],
          correctAnswers: '2',
          explanation: 'MOD donne le reste de la division entière : 17 = 5 × 3 + 2.',
          points: 1,
        },
        {
          text: 'Quel type choisir pour stocker le nom d\'un élève ?',
          type: 'single',
          options: ['entier', 'caractère', 'chaîne', 'booléen'],
          correctAnswers: [2],
          explanation:
            'Le type caractère ne contient qu\'un seul signe ; un nom complet demande une chaîne.',
          points: 1,
        },
      ],
    },
    exercises: [
      {
        title: 'Périmètre et surface d\'un rectangle',
        statement: `Écrire l'**analyse** puis l'**algorithme** d'un programme qui saisit la longueur et la largeur d'un rectangle (réels positifs), puis affiche son périmètre et sa surface.

Rappel : périmètre = 2 × (L + l), surface = L × l.`,
        type: 'algorithme',
        difficulty: 'facile',
        order: 1,
        starterCode: `Algorithme Rectangle
Début

Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
|       |             |`,
        solution: `Algorithme Rectangle
Début
  écrire("Donner la longueur : "), lire(L)
  écrire("Donner la largeur : "), lire(l)
  perimetre ← 2 * (L + l)
  surface ← L * l
  écrire("Périmètre = ", perimetre)
  écrire("Surface = ", surface)
Fin

T.D.O
| Objet     | Type/Nature |
|-----------|-------------|
| L         | réel        |
| l         | réel        |
| perimetre | réel        |
| surface   | réel        |`,
      },
      {
        title: 'Échanger le contenu de deux variables',
        statement: `Traduire en **Python** l'algorithme qui saisit deux entiers \`a\` et \`b\`, échange leurs valeurs à l'aide d'une variable intermédiaire, puis les réaffiche.

⚠️ On demande la traduction fidèle de l'algorithme : utiliser une variable temporaire, pas l'écriture raccourcie \`a, b = b, a\`.

Utiliser \`input()\` **sans message** et afficher le résultat avec \`print()\`.`,
        type: 'python',
        difficulty: 'facile',
        order: 2,
        starterCode: `a = int(input())
b = int(input())
# écrire l'échange ici
`,
        solution: `a = int(input())
b = int(input())
temp = a
a = b
b = temp
print("a =", a)
print("b =", b)`,
        testInputs: ['3\n5\n', '-2\n7\n'],
      },
      {
        title: 'Chiffre des unités et des dizaines',
        statement: `Écrire l'algorithme d'un programme qui saisit un entier \`n\` compris entre 10 et 99, puis affiche séparément son chiffre des dizaines et son chiffre des unités.

Indication : utiliser les opérateurs \`DIV\` et \`MOD\`.`,
        type: 'algorithme',
        difficulty: 'moyen',
        order: 3,
        starterCode: `Algorithme Chiffres
Début

Fin`,
        solution: `Algorithme Chiffres
Début
  écrire("Donner un entier entre 10 et 99 : "), lire(n)
  dizaines ← n DIV 10
  unites ← n MOD 10
  écrire("Chiffre des dizaines : ", dizaines)
  écrire("Chiffre des unités : ", unites)
Fin

T.D.O
| Objet    | Type/Nature |
|----------|-------------|
| n        | entier      |
| dizaines | entier      |
| unites   | entier      |`,
      },
    ],
  },
  {
    title: 'Les structures conditionnelles',
    description: 'Prendre une décision avec Si … Alors … Sinon … Finsi et la structure Selon.',
    order: 3,
    estimatedDuration: 60,
    lesson: {
      title: 'Les structures conditionnelles',
      content: `## 1. Analyse

On veut déterminer si un entier saisi est **pair ou impair**.

Un entier est pair si le reste de sa division par 2 vaut 0, c'est-à-dire si \`n MOD 2 = 0\`.

## 2. Algorithme

\`\`\`algorithme
Algorithme PairImpair
Début
  écrire("Donner un entier : "), lire(n)
  Si (n MOD 2 = 0) Alors
    écrire(n, " est pair")
  Sinon
    écrire(n, " est impair")
  Finsi
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n     | entier      |
\`\`\`

### Forme à choix multiples

\`\`\`algorithme
Selon note Faire
  note >= 16 : mention ← "Très bien"
  note >= 14 : mention ← "Bien"
  note >= 10 : mention ← "Passable"
  Sinon      : mention ← "Insuffisant"
Fin Selon
\`\`\`

## 3. Traduction en Python

\`\`\`python
n = int(input("Donner un entier : "))
if n % 2 == 0:
    print(n, "est pair")
else:
    print(n, "est impair")
\`\`\`

## À retenir

- \`Si … Alors … Finsi\` : la partie \`Sinon\` est **facultative**.
- Le \`Finsi\` ferme obligatoirement la structure en pseudo-code ; en Python c'est l'**indentation** qui joue ce rôle.
- Les conditions se combinent avec \`ET\`, \`OU\`, \`NON\` (\`and\`, \`or\`, \`not\` en Python).
- Attention : \`=\` est un **test d'égalité** en algorithmique, mais s'écrit \`==\` en Python.`,
    },
    quiz: {
      title: 'Quiz — Les structures conditionnelles',
      questions: [
        {
          text: 'Quel mot-clé ferme une structure conditionnelle en notation tunisienne ?',
          type: 'single',
          options: ['Fin Si', 'Finsi', 'End If', 'Fin'],
          correctAnswers: [1],
          explanation: 'La structure s\'écrit Si … Alors … Sinon … Finsi.',
          points: 1,
        },
        {
          text: 'La partie « Sinon » est obligatoire dans une structure conditionnelle.',
          type: 'boolean',
          options: ['Vrai', 'Faux'],
          correctAnswers: [1],
          explanation:
            'Le Sinon est facultatif : la forme simple Si … Alors … Finsi est parfaitement valide.',
          points: 1,
        },
        {
          text: 'Quelle condition teste qu\'un entier n est strictement positif ET pair ?',
          type: 'single',
          options: [
            '(n > 0) OU (n MOD 2 = 0)',
            '(n > 0) ET (n MOD 2 = 0)',
            '(n >= 0) ET (n DIV 2 = 0)',
            'NON (n > 0)',
          ],
          correctAnswers: [1],
          explanation: 'Les deux conditions doivent être vraies simultanément : on utilise ET.',
          points: 1,
        },
        {
          text: 'En Python, quel opérateur correspond au ET de la notation algorithmique ?',
          type: 'short',
          options: [],
          correctAnswers: 'and',
          explanation: 'ET → and, OU → or, NON → not.',
          points: 1,
        },
      ],
    },
    exercises: [
      {
        title: 'Le plus grand de trois nombres',
        statement: `Écrire l'algorithme d'un programme qui saisit trois réels et affiche le plus grand des trois, en utilisant uniquement des structures \`Si … Alors … Sinon … Finsi\`.`,
        type: 'algorithme',
        difficulty: 'moyen',
        order: 1,
        starterCode: `Algorithme PlusGrand
Début

Fin`,
        solution: `Algorithme PlusGrand
Début
  écrire("Donner a : "), lire(a)
  écrire("Donner b : "), lire(b)
  écrire("Donner c : "), lire(c)
  Si (a >= b) ET (a >= c) Alors
    max ← a
  Sinon
    Si (b >= a) ET (b >= c) Alors
      max ← b
    Sinon
      max ← c
    Finsi
  Finsi
  écrire("Le plus grand est : ", max)
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| a     | réel        |
| b     | réel        |
| c     | réel        |
| max   | réel        |`,
      },
      {
        title: 'Mention du baccalauréat',
        statement: `Écrire un programme **Python** qui saisit une moyenne (réel entre 0 et 20) et affiche la mention correspondante :

- moyenne ≥ 16 → « Très bien »
- moyenne ≥ 14 → « Bien »
- moyenne ≥ 12 → « Assez bien »
- moyenne ≥ 10 → « Passable »
- sinon → « Insuffisant »

Utiliser \`input()\` **sans message** et afficher le résultat avec \`print()\`.`,
        type: 'python',
        difficulty: 'facile',
        order: 2,
        starterCode: `moyenne = float(input())
`,
        solution: `moyenne = float(input())
if moyenne >= 16:
    print("Très bien")
elif moyenne >= 14:
    print("Bien")
elif moyenne >= 12:
    print("Assez bien")
elif moyenne >= 10:
    print("Passable")
else:
    print("Insuffisant")`,
        testInputs: ['15\n', '9\n', '12.5\n', '5\n'],
      },
      {
        title: 'Année bissextile',
        statement: `Une année est bissextile si elle est divisible par 4 **et** non divisible par 100, **ou** si elle est divisible par 400.

Écrire l'algorithme qui saisit une année et indique si elle est bissextile.`,
        type: 'algorithme',
        difficulty: 'difficile',
        order: 3,
        starterCode: `Algorithme Bissextile
Début

Fin`,
        solution: `Algorithme Bissextile
Début
  écrire("Donner une année : "), lire(annee)
  Si ((annee MOD 4 = 0) ET (annee MOD 100 <> 0)) OU (annee MOD 400 = 0) Alors
    écrire(annee, " est bissextile")
  Sinon
    écrire(annee, " n'est pas bissextile")
  Finsi
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| annee | entier      |`,
      },
    ],
  },
  {
    title: 'Les structures itératives',
    description:
      'Répéter des traitements avec Pour … Faire, Tant Que … Faire et Répéter … Jusqu\'à.',
    order: 4,
    estimatedDuration: 75,
    lesson: {
      title: 'Les structures itératives (boucles)',
      content: `## 1. Analyse

On veut calculer la **somme des n premiers entiers** : 1 + 2 + … + n.

Le nombre de répétitions est **connu à l'avance** (n itérations) : on utilise donc une boucle \`Pour\`.

somme ← 0, puis à chaque tour : somme ← somme + i

## 2. Algorithme

\`\`\`algorithme
Algorithme SommeN
Début
  écrire("Donner n : "), lire(n)
  somme ← 0
  Pour i de 1 à n Faire
    somme ← somme + i
  Fin Pour
  écrire("La somme vaut : ", somme)
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n     | entier      |
| i     | entier      |
| somme | entier      |
\`\`\`

### Quand le nombre de tours est inconnu

\`\`\`algorithme
Tant Que (n <= 0) Faire
  écrire("Valeur invalide, redonner n : "), lire(n)
Fin Tant Que
\`\`\`

\`\`\`algorithme
Répéter
  écrire("Donner n : "), lire(n)
Jusqu'à (n > 0)
\`\`\`

## 3. Traduction en Python

\`\`\`python
n = int(input("Donner n : "))
somme = 0
for i in range(1, n + 1):
    somme = somme + i
print("La somme vaut :", somme)
\`\`\`

## À retenir

- \`Pour\` : nombre d'itérations **connu** à l'avance.
- \`Tant Que\` : test **avant** le traitement — le corps peut ne jamais s'exécuter.
- \`Répéter … Jusqu'à\` : test **après** le traitement — le corps s'exécute **au moins une fois**.
- Attention en Python : \`Pour i de 1 à n\` se traduit par \`range(1, n + 1)\`, car la borne finale de \`range\` est exclue.`,
    },
    quiz: {
      title: 'Quiz — Les structures itératives',
      questions: [
        {
          text: 'Quelle boucle utiliser quand le nombre de répétitions est connu à l\'avance ?',
          type: 'single',
          options: ['Tant Que … Faire', 'Répéter … Jusqu\'à', 'Pour … Faire', 'Selon … Fin Selon'],
          correctAnswers: [2],
          explanation:
            'La boucle Pour est adaptée à un nombre d\'itérations connu ; Tant Que et Répéter servent quand il ne l\'est pas.',
          points: 1,
        },
        {
          text: 'Le corps d\'une boucle « Répéter … Jusqu\'à » s\'exécute au moins une fois.',
          type: 'boolean',
          options: ['Vrai', 'Faux'],
          correctAnswers: [0],
          explanation: 'Le test se fait après le traitement, donc le corps passe toujours une fois.',
          points: 1,
        },
        {
          text: 'Combien de fois s\'exécute « Pour i de 3 à 7 Faire » ?',
          type: 'short',
          options: [],
          correctAnswers: '5',
          explanation: 'Les valeurs prises par i sont 3, 4, 5, 6, 7 — soit 7 − 3 + 1 = 5 tours.',
          points: 1,
        },
        {
          text: 'Comment traduire « Pour i de 1 à n Faire » en Python ?',
          type: 'single',
          options: [
            'for i in range(1, n):',
            'for i in range(1, n + 1):',
            'for i in range(0, n):',
            'while i <= n:',
          ],
          correctAnswers: [1],
          explanation: 'La borne supérieure de range est exclue : il faut donc écrire n + 1.',
          points: 1,
        },
        {
          text: 'Dans une boucle « Tant Que », le test est effectué avant chaque exécution du corps.',
          type: 'boolean',
          options: ['Vrai', 'Faux'],
          correctAnswers: [0],
          explanation:
            'Si la condition est fausse dès le départ, le corps de la boucle n\'est jamais exécuté.',
          points: 1,
        },
      ],
    },
    exercises: [
      {
        title: 'Table de multiplication',
        statement: `Écrire l'algorithme d'un programme qui saisit un entier \`n\` entre 1 et 9, puis affiche sa table de multiplication de 1 à 10 sous la forme :

\`\`\`
n x 1 = ...
n x 2 = ...
\`\`\``,
        type: 'algorithme',
        difficulty: 'facile',
        order: 1,
        starterCode: `Algorithme Table
Début

Fin`,
        solution: `Algorithme Table
Début
  Répéter
    écrire("Donner n (1..9) : "), lire(n)
  Jusqu'à (n >= 1) ET (n <= 9)
  Pour i de 1 à 10 Faire
    écrire(n, " x ", i, " = ", n * i)
  Fin Pour
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n     | entier      |
| i     | entier      |`,
      },
      {
        title: 'Factorielle d\'un entier',
        statement: `Écrire un programme **Python** qui saisit un entier positif \`n\` et calcule sa factorielle n! = 1 × 2 × … × n, avec une boucle \`for\`.

⚠️ Ne pas utiliser \`math.factorial\` : on traduit l'algorithme.

Utiliser \`input()\` **sans message** et afficher le résultat avec \`print()\`.`,
        type: 'python',
        difficulty: 'moyen',
        order: 2,
        starterCode: `n = int(input())
fact = 1
`,
        solution: `n = int(input())
fact = 1
for i in range(1, n + 1):
    fact = fact * i
print(n, "! =", fact)`,
        testInputs: ['5\n', '0\n', '7\n'],
      },
      {
        title: 'Test de primalité',
        statement: `Écrire l'algorithme d'un programme qui saisit un entier \`n > 1\` et détermine s'il est **premier** (divisible uniquement par 1 et par lui-même).

Indication : tester les diviseurs de 2 à n DIV 2, et utiliser un booléen.`,
        type: 'algorithme',
        difficulty: 'difficile',
        order: 3,
        starterCode: `Algorithme Premier
Début

Fin`,
        solution: `Algorithme Premier
Début
  Répéter
    écrire("Donner n (> 1) : "), lire(n)
  Jusqu'à (n > 1)
  premier ← vrai
  i ← 2
  Tant Que (i <= n DIV 2) ET (premier = vrai) Faire
    Si (n MOD i = 0) Alors
      premier ← faux
    Finsi
    i ← i + 1
  Fin Tant Que
  Si (premier = vrai) Alors
    écrire(n, " est premier")
  Sinon
    écrire(n, " n'est pas premier")
  Finsi
Fin

T.D.O
| Objet   | Type/Nature |
|---------|-------------|
| n       | entier      |
| i       | entier      |
| premier | booléen     |`,
      },
    ],
  },
];

const stiSubModules = [
  {
    title: "Architecture d'un ordinateur",
    description: "Les composants matériels et leur rôle dans le traitement de l'information.",
    order: 1,
    estimatedDuration: 40,
    lesson: {
      title: "Les composants d'un ordinateur",
      content: `## Les unités fonctionnelles

Un ordinateur s'organise autour de trois grandes fonctions :

1. **Unité d'entrée** — clavier, souris, scanner : introduit les données.
2. **Unité centrale de traitement (CPU)** — exécute les instructions ; composée de l'unité de commande et de l'unité arithmétique et logique (UAL).
3. **Unité de sortie** — écran, imprimante : restitue les résultats.

La **mémoire centrale (RAM)** est volatile et stocke temporairement données et programmes en cours d'exécution ; la **mémoire de masse** (disque dur, SSD) conserve durablement l'information.

> Contenu de démonstration — à compléter par l'administrateur avec le programme officiel.`,
    },
    quiz: {
      title: "Quiz — Architecture d'un ordinateur",
      questions: [
        {
          text: 'Quel composant exécute les opérations arithmétiques et logiques ?',
          type: 'single',
          options: ['La RAM', "L'UAL", 'Le disque dur', "L'unité de sortie"],
          correctAnswers: [1],
          explanation: "L'UAL (unité arithmétique et logique) fait partie du processeur.",
          points: 1,
        },
        {
          text: 'La mémoire RAM conserve les données après extinction de la machine.',
          type: 'boolean',
          options: ['Vrai', 'Faux'],
          correctAnswers: [1],
          explanation: 'La RAM est volatile : son contenu est perdu à la mise hors tension.',
          points: 1,
        },
        {
          text: 'Citer une unité de sortie.',
          type: 'short',
          options: [],
          correctAnswers: 'écran',
          explanation: "L'écran et l'imprimante sont des unités de sortie.",
          points: 1,
        },
      ],
    },
    exercises: [
      {
        title: 'Classer les périphériques',
        statement: `Classer les périphériques suivants en **entrée**, **sortie** ou **entrée/sortie** : clavier, écran tactile, imprimante, scanner, disque dur externe, haut-parleur, microphone.

Justifier chaque choix en une phrase.`,
        type: 'algorithme',
        difficulty: 'facile',
        order: 1,
        starterCode: '',
        solution: `- Entrée : clavier, scanner, microphone (ils fournissent des données à la machine).
- Sortie : écran, imprimante, haut-parleur (ils restituent un résultat à l'utilisateur).
- Entrée/sortie : écran tactile (affiche et capte le toucher), disque dur externe (lecture et écriture).`,
      },
      {
        title: 'Conversion des unités de stockage',
        statement: `Écrire un programme **Python** qui saisit une taille en **Mo** et affiche sa valeur en **Ko** et en **octets** (1 Mo = 1024 Ko, 1 Ko = 1024 octets).

Utiliser \`input()\` **sans message** et afficher le résultat avec \`print()\`.`,
        type: 'python',
        difficulty: 'facile',
        order: 2,
        starterCode: `mo = float(input())
`,
        solution: `mo = float(input())
ko = mo * 1024
octets = ko * 1024
print(mo, "Mo =", ko, "Ko =", octets, "octets")`,
        testInputs: ['2\n', '0.5\n'],
      },
    ],
  },
];

const modules = [
  {
    title: 'Algorithmique',
    slug: 'algorithmique',
    description:
      "Apprendre à raisonner, écrire un algorithme en notation tunisienne, puis le traduire en Python.",
    icon: 'Code',
    color: '#2F5BFF',
    order: 1,
    subModules: [...algorithmiqueSubModules, ...algorithmiqueExtra],
  },
  {
    title: 'STI',
    slug: 'sti',
    description: "Systèmes et technologies de l'information : matériel, réseaux et systèmes.",
    icon: 'Memory',
    color: '#22C55E',
    order: 2,
    subModules: [...stiSubModules, ...stiExtra],
  },
];

async function resetCollections() {
  await Promise.all([
    Module.deleteMany({}),
    SubModule.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Exercise.deleteMany({}),
    Progress.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Badge.deleteMany({}),
  ]);
  await User.deleteMany({ role: 'admin', email: env.adminEmail });
  console.log('[seed] Collections de contenu vidées (--reset).');
}

async function seedAdmin(counters) {
  if (!env.adminEmail || !env.adminPassword) {
    console.warn(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD absents du .env — création de l'admin ignorée."
    );
    return;
  }

  const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (existing) {
    console.log(`[seed] Admin déjà présent (${existing.email}) — inchangé.`);
    return;
  }

  await User.create({
    username: 'admin',
    email: env.adminEmail.toLowerCase(),
    passwordHash: await hashPassword(env.adminPassword),
    role: 'admin',
    isActive: true,
  });
  counters.users += 1;
  console.log(`[seed] Admin créé : ${env.adminEmail.toLowerCase()}`);
}

async function seedModule(definition, counters) {
  let moduleDoc = await Module.findOne({ slug: definition.slug });
  if (!moduleDoc) {
    moduleDoc = await Module.create({
      title: definition.title,
      slug: definition.slug,
      description: definition.description,
      icon: definition.icon,
      color: definition.color,
      order: definition.order,
    });
    counters.modules += 1;
  }

  for (const sub of definition.subModules) {
    let subDoc = await SubModule.findOne({ moduleId: moduleDoc._id, title: sub.title });
    if (subDoc && subDoc.order !== sub.order) {
      subDoc.order = sub.order;
      await subDoc.save();
    }
    if (!subDoc) {
      subDoc = await SubModule.create({
        moduleId: moduleDoc._id,
        title: sub.title,
        description: sub.description,
        order: sub.order,
        estimatedDuration: sub.estimatedDuration,
      });
      counters.subModules += 1;
    }

    if (!(await Lesson.exists({ subModuleId: subDoc._id }))) {
      await Lesson.create({ subModuleId: subDoc._id, ...sub.lesson });
      counters.lessons += 1;
    }

    if (!(await Quiz.exists({ subModuleId: subDoc._id }))) {
      await Quiz.create({
        subModuleId: subDoc._id,
        title: sub.quiz.title,
        passingScore: 60,
        maxAttempts: 0,
        questions: sub.quiz.questions,
      });
      counters.quizzes += 1;
    }

    for (const { testInputs, ...exercise } of sub.exercises) {
      const existing = await Exercise.findOne({ subModuleId: subDoc._id, title: exercise.title });
      if (existing && !testInputs) continue;

      // Cas de test générés en exécutant la solution de référence.
      let tests = [];
      if (testInputs) {
        try {
          for (const input of testInputs) {
            const out = await runPython(exercise.solution, input);
            if (out.exitCode !== 0) throw new Error(out.stderr);
            tests.push({ input, expectedOutput: out.stdout.replace(/\s+$/, '') });
          }
        } catch (err) {
          console.warn(`[seed] Tests non générés pour « ${exercise.title} » : ${err.message}`);
          tests = [];
        }
      }

      if (existing) {
        Object.assign(existing, { statement: exercise.statement, starterCode: exercise.starterCode, solution: exercise.solution });
        existing.tests = tests;
        await existing.save();
      } else {
        await Exercise.create({ subModuleId: subDoc._id, ...exercise, tests });
        counters.exercises += 1;
      }
    }
  }
}

async function seedBadges() {
  if ((await Badge.countDocuments()) > 0) return;
  await Badge.insertMany(defaultBadges);
  console.log(`[seed] ${defaultBadges.length} badges par défaut créés.`);
}

async function run() {
  await connectDB();

  if (RESET) await resetCollections();

  const counters = {
    users: 0,
    modules: 0,
    subModules: 0,
    lessons: 0,
    quizzes: 0,
    exercises: 0,
  };

  await seedAdmin(counters);
  for (const definition of modules) {
    await seedModule(definition, counters);
  }
  await seedBadges();

  console.log('\n[seed] Terminé. Documents créés :');
  console.log(`  Utilisateurs : ${counters.users}`);
  console.log(`  Modules      : ${counters.modules}`);
  console.log(`  Sous-modules : ${counters.subModules}`);
  console.log(`  Leçons       : ${counters.lessons}`);
  console.log(`  Quiz         : ${counters.quizzes}`);
  console.log(`  Exercices    : ${counters.exercises}`);
  if (env.adminEmail) {
    console.log(`\n  Connexion admin : ${env.adminEmail.toLowerCase()} (mot de passe : voir .env)`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('[seed] Échec :', err);
  await mongoose.connection.close();
  process.exit(1);
});
