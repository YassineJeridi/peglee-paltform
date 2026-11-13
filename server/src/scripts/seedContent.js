// Contenu pédagogique complémentaire (sous-modules Algorithmique et STI).
// `testInputs` (exercices Python) : le seed exécute la solution de référence
// sur ces entrées pour produire automatiquement les cas de test attendus.

const single = (text, options, answer, explanation) => ({
  text, type: 'single', options, correctAnswers: [answer], explanation, points: 1,
});
const bool = (text, answer, explanation) => ({
  text, type: 'boolean', options: ['Vrai', 'Faux'], correctAnswers: [answer ? 0 : 1], explanation, points: 1,
});
const short = (text, answer, explanation) => ({
  text, type: 'short', options: [], correctAnswers: answer, explanation, points: 1,
});
const multiple = (text, options, answers, explanation) => ({
  text, type: 'multiple', options, correctAnswers: answers, explanation, points: 1,
});

const algorithmiqueExtra = [
  {
    title: 'Les entrées / sorties',
    description: 'Lire des données au clavier et afficher des résultats lisibles.',
    order: 2,
    estimatedDuration: 30,
    lesson: {
      title: 'Lire et écrire',
      content: `## 1. Principe

Un programme dialogue avec l'utilisateur :

- **lire(x)** : saisit une valeur au clavier et la range dans l'objet \`x\` ;
- **écrire(...)** : affiche un ou plusieurs éléments (texte entre guillemets, valeurs d'objets).

## 2. Algorithme

\`\`\`algorithme
Algorithme Bienvenue
Début
  écrire("Quel est votre prénom ? "), lire(prenom)
  écrire("Quel est votre âge ? "), lire(age)
  écrire("Bonjour ", prenom, ", vous aurez ", age + 1, " ans l'an prochain.")
Fin

T.D.O
| Objet  | Type/Nature |
|--------|-------------|
| prenom | chaîne      |
| age    | entier      |
\`\`\`

## 3. Traduction en Python

\`\`\`python
prenom = input("Quel est votre prénom ? ")
age = int(input("Quel est votre âge ? "))
print("Bonjour", prenom + ", vous aurez", age + 1, "ans l'an prochain.")
\`\`\`

## À retenir

- En Python, \`input()\` renvoie **toujours une chaîne** : on convertit avec \`int()\` ou \`float()\`.
- On sépare les éléments de \`écrire\` / \`print\` par des virgules.
- Un message de saisie clair (« Donner la note : ») évite les erreurs de l'utilisateur.`,
    },
    quiz: {
      title: 'Quiz — Les entrées / sorties',
      questions: [
        single("Quelle instruction saisit une valeur au clavier ?", ['écrire', 'lire', 'afficher', 'saisir'], 1, "lire(x) range la valeur saisie dans x."),
        single("Que renvoie input() en Python ?", ['Un entier', 'Un réel', 'Une chaîne de caractères', 'Un booléen'], 2, "input() renvoie toujours une chaîne : il faut convertir."),
        bool("En Python, int(input()) convertit la saisie en entier.", true, "int() convertit la chaîne saisie en nombre entier."),
        short("Quelle fonction Python affiche un résultat à l'écran ?", 'print', "print() est la fonction d'affichage."),
      ],
    },
    exercises: [
      {
        title: 'Moyenne de trois notes',
        statement: "Écrire l'**algorithme** qui lit trois notes réelles et affiche leur moyenne.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: 'Algorithme Moyenne3\nDébut\n\nFin\n',
        solution: `Algorithme Moyenne3
Début
  écrire("Note 1 : "), lire(n1)
  écrire("Note 2 : "), lire(n2)
  écrire("Note 3 : "), lire(n3)
  moy ← (n1 + n2 + n3) / 3
  écrire("Moyenne = ", moy)
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n1, n2, n3 | réel |
| moy | réel |`,
      },
      {
        title: 'Convertir des degrés Celsius en Fahrenheit',
        statement: "Écrire un programme **Python** qui lit une température en °C (entier) et affiche son équivalent en °F, avec F = C × 9 / 5 + 32. Afficher uniquement le nombre.",
        type: 'python', difficulty: 'facile', order: 2,
        starterCode: 'c = int(input())\n',
        solution: 'c = int(input())\nprint(c * 9 / 5 + 32)',
        testInputs: ['0\n', '100\n', '-40\n'],
      },
    ],
  },
  {
    title: 'Les tableaux (1D / 2D)',
    description: 'Stocker et parcourir plusieurs valeurs du même type.',
    order: 5,
    estimatedDuration: 50,
    lesson: {
      title: 'Les tableaux',
      content: `## 1. Analyse

On veut lire **n notes** puis afficher la plus grande. Il faut mémoriser toutes les notes : on utilise un **tableau**.

## 2. Algorithme

\`\`\`algorithme
Algorithme MaxTableau
Début
  écrire("Taille : "), lire(n)
  Pour i de 1 à n Faire
    écrire("T[", i, "] = "), lire(T[i])
  Fin Pour
  max ← T[1]
  Pour i de 2 à n Faire
    Si (T[i] > max) Alors
      max ← T[i]
    Fin Si
  Fin Pour
  écrire("Maximum = ", max)
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n, i  | entier      |
| max   | entier      |
| T     | tableau de 100 entiers |
\`\`\`

## 3. Traduction en Python

\`\`\`python
n = int(input())
T = []
for i in range(n):
    T.append(int(input()))
maximum = T[0]
for i in range(1, n):
    if T[i] > maximum:
        maximum = T[i]
print(maximum)
\`\`\`

## Matrice (tableau 2D)

Une matrice \`M[i, j]\` se parcourt avec **deux boucles imbriquées** : la première sur les lignes, la seconde sur les colonnes.

## À retenir

- En algorithmique les indices commencent en général à **1**, en Python à **0**.
- Un tableau a une **taille fixe** et des éléments de **même type**.
- Parcours complet = boucle \`Pour\`.`,
    },
    quiz: {
      title: 'Quiz — Les tableaux',
      questions: [
        single("Quel est l'indice du premier élément d'une liste Python ?", ['0', '1', '-1', 'Cela dépend'], 0, "Les listes Python sont indexées à partir de 0."),
        bool("Tous les éléments d'un tableau doivent être du même type.", true, "Un tableau est une structure homogène."),
        single("Combien de boucles faut-il pour parcourir une matrice ?", ['1', '2 imbriquées', '3', 'Aucune'], 1, "Une boucle pour les lignes et une pour les colonnes."),
        short("Quelle méthode Python ajoute un élément à la fin d'une liste ?", 'append', "liste.append(x) ajoute x à la fin."),
      ],
    },
    exercises: [
      {
        title: 'Somme des éléments d\'un tableau',
        statement: "Écrire l'**algorithme** qui remplit un tableau de n entiers puis affiche la somme de ses éléments.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: 'Algorithme SommeTab\nDébut\n\nFin\n',
        solution: `Algorithme SommeTab
Début
  écrire("n = "), lire(n)
  somme ← 0
  Pour i de 1 à n Faire
    lire(T[i])
    somme ← somme + T[i]
  Fin Pour
  écrire("Somme = ", somme)
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n, i, somme | entier |
| T | tableau de 100 entiers |`,
      },
      {
        title: 'Plus petit élément',
        statement: "Écrire un programme **Python** qui lit n puis n entiers (un par ligne) et affiche le plus petit.",
        type: 'python', difficulty: 'moyen', order: 2,
        starterCode: 'n = int(input())\n',
        solution: 'n = int(input())\nT = [int(input()) for _ in range(n)]\nmin_val = T[0]\nfor x in T:\n    if x < min_val:\n        min_val = x\nprint(min_val)',
        testInputs: ['3\n5\n2\n9\n', '4\n-1\n-5\n0\n7\n', '1\n8\n'],
      },
    ],
  },
  {
    title: 'Les chaînes de caractères',
    description: 'Parcourir, comparer et transformer des chaînes.',
    order: 6,
    estimatedDuration: 40,
    lesson: {
      title: 'Les chaînes de caractères',
      content: `## 1. Opérations de base

| Opération | Algorithme | Python |
|---|---|---|
| Longueur | \`long(ch)\` | \`len(ch)\` |
| Caractère d'indice i | \`ch[i]\` | \`ch[i]\` |
| Concaténation | \`ch1 + ch2\` | \`ch1 + ch2\` |
| Sous-chaîne | \`sous_chaine(ch, d, f)\` | \`ch[d:f]\` |
| Conversion en majuscules | \`majus(ch)\` | \`ch.upper()\` |

## 2. Exemple : compter les voyelles

\`\`\`algorithme
Algorithme Voyelles
Début
  écrire("Donner un mot : "), lire(ch)
  nb ← 0
  Pour i de 1 à long(ch) Faire
    Si (ch[i] dans ["a","e","i","o","u","y"]) Alors
      nb ← nb + 1
    Fin Si
  Fin Pour
  écrire("Nombre de voyelles : ", nb)
Fin
\`\`\`

\`\`\`python
ch = input()
nb = 0
for c in ch:
    if c in "aeiouy":
        nb += 1
print(nb)
\`\`\`

## À retenir

- Une chaîne se parcourt comme un tableau de caractères.
- Les chaînes Python sont **immuables** : on ne modifie pas un caractère, on construit une nouvelle chaîne.
- \`ch[d:f]\` exclut l'indice \`f\`.`,
    },
    quiz: {
      title: 'Quiz — Les chaînes de caractères',
      questions: [
        single("Que vaut len(\"bac\") en Python ?", ['2', '3', '4', 'Erreur'], 1, "La chaîne contient 3 caractères."),
        single("Que vaut \"informatique\"[0:4] ?", ['info', 'infor', 'nfo', 'form'], 0, "Les indices 0 à 3, la borne 4 est exclue."),
        bool("Une chaîne Python peut être modifiée caractère par caractère (ch[0] = 'a').", false, "Les chaînes sont immuables."),
        short("Quelle méthode Python met une chaîne en majuscules ?", 'upper', "ch.upper() renvoie la chaîne en majuscules."),
      ],
    },
    exercises: [
      {
        title: 'Palindrome',
        statement: "Écrire l'**algorithme** qui vérifie si un mot est un palindrome (se lit pareil dans les deux sens, ex. « radar »).",
        type: 'algorithme', difficulty: 'moyen', order: 1,
        starterCode: 'Algorithme Palindrome\nDébut\n\nFin\n',
        solution: `Algorithme Palindrome
Début
  écrire("Mot : "), lire(ch)
  ok ← vrai
  n ← long(ch)
  Pour i de 1 à n DIV 2 Faire
    Si (ch[i] <> ch[n - i + 1]) Alors
      ok ← faux
    Fin Si
  Fin Pour
  Si (ok) Alors
    écrire("Palindrome")
  Sinon
    écrire("Non palindrome")
  Fin Si
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| ch | chaîne |
| n, i | entier |
| ok | booléen |`,
      },
      {
        title: 'Compter les voyelles',
        statement: "Écrire un programme **Python** qui lit un mot en minuscules et affiche le nombre de voyelles (a, e, i, o, u, y).",
        type: 'python', difficulty: 'facile', order: 2,
        starterCode: 'ch = input()\n',
        solution: 'ch = input()\nnb = 0\nfor c in ch:\n    if c in "aeiouy":\n        nb += 1\nprint(nb)',
        testInputs: ['informatique\n', 'rythme\n', 'bac\n'],
      },
    ],
  },
  {
    title: 'Les sous-programmes (fonctions & procédures)',
    description: 'Décomposer un problème en modules réutilisables.',
    order: 7,
    estimatedDuration: 50,
    lesson: {
      title: 'Fonctions et procédures',
      content: `## 1. Pourquoi des sous-programmes ?

Découper un programme en modules le rend **lisible**, **réutilisable** et plus facile à **tester**.

- Une **fonction** renvoie **un résultat** (via \`retourner\`).
- Une **procédure** exécute un traitement et ne renvoie rien (elle peut modifier ses paramètres passés par adresse).

## 2. Exemple

\`\`\`algorithme
Fonction carre(x : entier) : entier
Début
  retourner x * x
Fin

Procédure afficher_carre(x : entier)
Début
  écrire(x, "² = ", carre(x))
Fin
\`\`\`

\`\`\`python
def carre(x):
    return x * x

def afficher_carre(x):
    print(x, "² =", carre(x))
\`\`\`

## 3. Paramètres

- **Paramètres formels** : ceux de la déclaration (\`x\`).
- **Paramètres effectifs** : ceux passés à l'appel (\`afficher_carre(5)\`).
- Les variables déclarées dans un sous-programme sont **locales**.

## À retenir

- Choisir fonction si on attend **une valeur** ; procédure sinon.
- Un appel de fonction se place dans une expression : \`y ← carre(4)\`.`,
    },
    quiz: {
      title: 'Quiz — Les sous-programmes',
      questions: [
        single("Quel sous-programme renvoie une valeur ?", ['Une procédure', 'Une fonction', 'Les deux', 'Aucun'], 1, "Une fonction renvoie un résultat avec retourner."),
        bool("Une variable locale est visible dans tout le programme.", false, "Elle n'existe que dans son sous-programme."),
        single("Quel mot-clé Python définit une fonction ?", ['function', 'def', 'fun', 'proc'], 1, "def nom(parametres): ..."),
        short("Comment appelle-t-on les paramètres passés lors de l'appel ?", 'effectifs', "Paramètres effectifs (ou arguments), par opposition aux paramètres formels."),
      ],
    },
    exercises: [
      {
        title: 'Fonction maximum de deux entiers',
        statement: "Écrire la **fonction** `max2(a, b)` qui renvoie le plus grand de deux entiers, puis un algorithme principal qui l'utilise.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: 'Fonction max2(a : entier, b : entier) : entier\nDébut\n\nFin\n',
        solution: `Fonction max2(a : entier, b : entier) : entier
Début
  Si (a > b) Alors
    retourner a
  Sinon
    retourner b
  Fin Si
Fin

Algorithme Principal
Début
  écrire("a = "), lire(x)
  écrire("b = "), lire(y)
  écrire("Maximum = ", max2(x, y))
Fin`,
      },
      {
        title: 'Nombre pair — fonction Python',
        statement: "Définir la fonction `est_pair(n)` qui renvoie `True` si n est pair. Puis lire un entier et afficher `True` ou `False` en appelant la fonction.",
        type: 'python', difficulty: 'facile', order: 2,
        starterCode: 'def est_pair(n):\n    pass\n\nn = int(input())\n',
        solution: 'def est_pair(n):\n    return n % 2 == 0\n\nn = int(input())\nprint(est_pair(n))',
        testInputs: ['4\n', '7\n', '0\n'],
      },
    ],
  },
  {
    title: 'La récursivité',
    description: 'Des sous-programmes qui s\'appellent eux-mêmes.',
    order: 8,
    estimatedDuration: 45,
    lesson: {
      title: 'La récursivité',
      content: `## 1. Principe

Un sous-programme est **récursif** s'il s'appelle lui-même. Il faut toujours :

1. un **cas de base** (arrêt de la récursion) ;
2. un **appel récursif** qui se rapproche du cas de base.

## 2. Exemple : factorielle

n! = n × (n-1)! avec 0! = 1.

\`\`\`algorithme
Fonction fact(n : entier) : entier
Début
  Si (n = 0) Alors
    retourner 1
  Sinon
    retourner n * fact(n - 1)
  Fin Si
Fin
\`\`\`

\`\`\`python
def fact(n):
    if n == 0:
        return 1
    return n * fact(n - 1)
\`\`\`

## 3. Déroulement de fact(3)

fact(3) → 3 × fact(2) → 3 × 2 × fact(1) → 3 × 2 × 1 × fact(0) → 3 × 2 × 1 × 1 = **6**

## À retenir

- Sans cas de base : récursion infinie (erreur de dépassement de pile).
- Chaque appel crée un nouveau contexte avec ses propres variables locales.
- Toute fonction récursive peut s'écrire avec une boucle, parfois moins élégamment.`,
    },
    quiz: {
      title: 'Quiz — La récursivité',
      questions: [
        single("Que doit toujours comporter une fonction récursive ?", ['Une boucle', 'Un cas de base', 'Un tableau', 'Une procédure'], 1, "Le cas de base arrête la récursion."),
        single("Que vaut fact(4) ?", ['10', '16', '24', '120'], 2, "4 × 3 × 2 × 1 = 24."),
        bool("Une récursion sans cas de base se termine toujours.", false, "Elle ne s'arrête jamais (débordement de pile)."),
        short("Quelle est la valeur de fact(0) ?", '1', "Par définition 0! = 1."),
      ],
    },
    exercises: [
      {
        title: 'Somme récursive',
        statement: "Écrire la **fonction récursive** `somme(n)` qui renvoie 1 + 2 + … + n.",
        type: 'algorithme', difficulty: 'moyen', order: 1,
        starterCode: 'Fonction somme(n : entier) : entier\nDébut\n\nFin\n',
        solution: `Fonction somme(n : entier) : entier
Début
  Si (n = 0) Alors
    retourner 0
  Sinon
    retourner n + somme(n - 1)
  Fin Si
Fin`,
      },
      {
        title: 'Suite de Fibonacci',
        statement: "Écrire en **Python** la fonction récursive `fib(n)` (fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)). Lire n et afficher fib(n).",
        type: 'python', difficulty: 'moyen', order: 2,
        starterCode: 'def fib(n):\n    pass\n\nn = int(input())\n',
        solution: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nn = int(input())\nprint(fib(n))',
        testInputs: ['0\n', '1\n', '7\n', '10\n'],
      },
    ],
  },
  {
    title: 'Les algorithmes de tri et de recherche',
    description: 'Recherche séquentielle, dichotomique et tris classiques.',
    order: 9,
    estimatedDuration: 60,
    lesson: {
      title: 'Tri et recherche',
      content: `## 1. Recherche séquentielle

On parcourt le tableau jusqu'à trouver la valeur. Complexité : jusqu'à **n** comparaisons.

## 2. Recherche dichotomique (tableau **trié**)

On compare avec l'élément du milieu et on élimine la moitié du tableau à chaque étape.

\`\`\`algorithme
Fonction dicho(T : tableau, n : entier, x : entier) : booléen
Début
  d ← 1
  f ← n
  Tant Que (d <= f) Faire
    m ← (d + f) DIV 2
    Si (T[m] = x) Alors
      retourner vrai
    Sinon Si (T[m] < x) Alors
      d ← m + 1
    Sinon
      f ← m - 1
    Fin Si
  Fin Tant Que
  retourner faux
Fin
\`\`\`

## 3. Tri par sélection

À chaque étape on place le plus petit élément restant à sa position.

\`\`\`python
def tri_selection(T):
    n = len(T)
    for i in range(n - 1):
        imin = i
        for j in range(i + 1, n):
            if T[j] < T[imin]:
                imin = j
        T[i], T[imin] = T[imin], T[i]
\`\`\`

## 4. Tri à bulles

On compare les voisins et on les échange s'ils sont dans le mauvais ordre, jusqu'à ce qu'aucun échange ne soit nécessaire.

## À retenir

- La dichotomie exige un tableau **déjà trié** : elle fait environ log₂(n) comparaisons.
- Les tris par sélection et à bulles font environ n² comparaisons.`,
    },
    quiz: {
      title: 'Quiz — Tri et recherche',
      questions: [
        single("Quelle condition la recherche dichotomique exige-t-elle ?", ['Tableau de taille paire', 'Tableau trié', 'Valeurs distinctes', 'Tableau 2D'], 1, "Sans tri, éliminer la moitié du tableau n'a pas de sens."),
        bool("La recherche séquentielle fonctionne sur un tableau non trié.", true, "On parcourt simplement les éléments un à un."),
        single("Combien d'étapes (au plus) pour chercher dans 1024 éléments triés par dichotomie ?", ['10 environ', '32', '512', '1024'], 0, "log₂(1024) = 10."),
        multiple("Quels sont des algorithmes de tri ?", ['Tri par sélection', 'Tri à bulles', 'Recherche dichotomique', 'Tri par insertion'], [0, 1, 3], "La recherche dichotomique est un algorithme de recherche, pas de tri."),
      ],
    },
    exercises: [
      {
        title: 'Tri à bulles',
        statement: "Écrire l'**algorithme** qui trie un tableau de n entiers par ordre croissant avec le tri à bulles.",
        type: 'algorithme', difficulty: 'difficile', order: 1,
        starterCode: 'Algorithme TriBulles\nDébut\n\nFin\n',
        solution: `Algorithme TriBulles
Début
  écrire("n = "), lire(n)
  Pour i de 1 à n Faire
    lire(T[i])
  Fin Pour
  Répéter
    echange ← faux
    Pour i de 1 à n - 1 Faire
      Si (T[i] > T[i + 1]) Alors
        tmp ← T[i]
        T[i] ← T[i + 1]
        T[i + 1] ← tmp
        echange ← vrai
      Fin Si
    Fin Pour
  Jusqu'à (echange = faux)
  Pour i de 1 à n Faire
    écrire(T[i])
  Fin Pour
Fin

T.D.O
| Objet | Type/Nature |
|-------|-------------|
| n, i, tmp | entier |
| echange | booléen |
| T | tableau de 100 entiers |`,
      },
      {
        title: 'Recherche d\'un élément',
        statement: "Écrire un programme **Python** qui lit n, puis n entiers (un par ligne), puis un entier x. Afficher `Trouvé` si x est dans la liste, sinon `Absent`.",
        type: 'python', difficulty: 'facile', order: 2,
        starterCode: 'n = int(input())\n',
        solution: 'n = int(input())\nT = [int(input()) for _ in range(n)]\nx = int(input())\nprint("Trouvé" if x in T else "Absent")',
        testInputs: ['3\n4\n8\n15\n8\n', '3\n4\n8\n15\n16\n'],
      },
    ],
  },
];

const stiExtra = [
  {
    title: "Représentation de l'information",
    description: 'Systèmes de numération, conversions et codage des caractères.',
    order: 2,
    estimatedDuration: 50,
    lesson: {
      title: "Numération binaire et codage",
      content: `## 1. Les bases de numération

| Base | Nom | Chiffres |
|---|---|---|
| 2 | binaire | 0, 1 |
| 8 | octal | 0 à 7 |
| 10 | décimal | 0 à 9 |
| 16 | hexadécimal | 0 à 9, A à F |

## 2. Binaire → décimal

1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = **11**

## 3. Décimal → binaire

On divise successivement par 2 et on lit les restes **de bas en haut** :

13 ÷ 2 = 6 reste **1** ; 6 ÷ 2 = 3 reste **0** ; 3 ÷ 2 = 1 reste **1** ; 1 ÷ 2 = 0 reste **1** → 13 = **1101**₂

## 4. Hexadécimal

Un chiffre hexadécimal = 4 bits : \`1F₁₆ = 0001 1111₂ = 31\`.

## 5. Codage des caractères

- **ASCII** : 7 bits (128 caractères), 'A' = 65.
- **Unicode / UTF-8** : tous les alphabets, dont l'arabe et les accents.

## À retenir

- 1 octet = 8 bits ; 1 Ko = 1024 octets.
- Avec n bits on représente 2ⁿ valeurs différentes.`,
    },
    quiz: {
      title: "Quiz — Représentation de l'information",
      questions: [
        single("Que vaut 1011 en binaire ?", ['9', '10', '11', '13'], 2, "8 + 2 + 1 = 11."),
        single("Combien de valeurs peut-on coder sur 4 bits ?", ['8', '16', '32', '4'], 1, "2⁴ = 16."),
        single("Quelle est l'écriture binaire de 13 ?", ['1011', '1101', '1110', '1001'], 1, "13 = 8 + 4 + 1 = 1101."),
        short("Combien de bits contient un octet ?", '8', "1 octet = 8 bits."),
        bool("Le code ASCII standard utilise 7 bits.", true, "128 caractères codés sur 7 bits."),
      ],
    },
    exercises: [
      {
        title: 'Conversions de bases',
        statement: "Convertir : (a) 45 en binaire ; (b) 101101₂ en décimal ; (c) 2A₁₆ en décimal. Détailler la méthode.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: '',
        solution: `(a) 45 = 32 + 8 + 4 + 1 = 101101₂ (divisions successives par 2 : restes 1,0,1,1,0,1 lus de bas en haut).
(b) 101101₂ = 32 + 8 + 4 + 1 = 45.
(c) 2A₁₆ = 2×16 + 10 = 42.`,
      },
      {
        title: 'Décimal vers binaire en Python',
        statement: "Écrire un programme **Python** qui lit un entier positif et affiche son écriture binaire **sans** utiliser `bin()` (divisions successives par 2).",
        type: 'python', difficulty: 'moyen', order: 2,
        starterCode: 'n = int(input())\n',
        solution: 'n = int(input())\nif n == 0:\n    print(0)\nelse:\n    s = ""\n    while n > 0:\n        s = str(n % 2) + s\n        n = n // 2\n    print(s)',
        testInputs: ['13\n', '0\n', '255\n', '1\n'],
      },
    ],
  },
  {
    title: "Les systèmes d'exploitation",
    description: 'Rôle, fonctions et exemples de systèmes d\'exploitation.',
    order: 3,
    estimatedDuration: 35,
    lesson: {
      title: "Le système d'exploitation",
      content: `## 1. Définition

Le **système d'exploitation** (SE) est le logiciel de base qui sert d'**intermédiaire** entre le matériel et les applications.

## 2. Fonctions principales

- **Gestion du processeur** : ordonnancement des processus.
- **Gestion de la mémoire** : allocation de la RAM aux programmes.
- **Gestion des fichiers** : arborescence, droits d'accès.
- **Gestion des périphériques** : via des pilotes (drivers).
- **Interface utilisateur** : graphique (GUI) ou en ligne de commande.

## 3. Exemples

| Famille | Exemples |
|---|---|
| Windows | Windows 10, 11 |
| Unix / Linux | Ubuntu, Debian, Android (noyau Linux) |
| macOS / iOS | macOS, iPadOS |

## 4. Fichiers et répertoires

Un fichier a un **nom**, une **extension** (\`.docx\`, \`.py\`) et un **chemin** (\`C:\\Documents\\cours.docx\`).

## À retenir

- Un SE est **multitâche** s'il exécute plusieurs programmes « en même temps ».
- Un **pilote** permet au SE de communiquer avec un périphérique précis.`,
    },
    quiz: {
      title: "Quiz — Les systèmes d'exploitation",
      questions: [
        single("Quel est le rôle principal d'un système d'exploitation ?", ["Naviguer sur Internet", "Gérer les ressources matérielles et logicielles", "Créer des documents", "Protéger contre les virus"], 1, "Le SE gère le matériel et sert d'interface avec les applications."),
        multiple("Lesquels sont des systèmes d'exploitation ?", ['Linux', 'Windows', 'Python', 'Android'], [0, 1, 3], "Python est un langage de programmation."),
        short("Comment s'appelle le logiciel qui permet au SE de piloter un périphérique ?", 'pilote', "Un pilote (driver)."),
        bool("Un SE multitâche peut exécuter plusieurs programmes simultanément.", true, "C'est la définition du multitâche."),
      ],
    },
    exercises: [
      {
        title: 'Chemin d\'un fichier',
        statement: "Un fichier `rapport.pdf` est dans le dossier `Cours`, lui-même dans `Documents` sur le disque `C:`. Écrire son chemin complet (notation Windows) et indiquer son extension et son type.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: '',
        solution: `Chemin complet : C:\\Documents\\Cours\\rapport.pdf
Extension : .pdf — document PDF (Portable Document Format).`,
      },
    ],
  },
  {
    title: 'Les réseaux informatiques',
    description: 'Types de réseaux, topologies, protocoles et Internet.',
    order: 4,
    estimatedDuration: 45,
    lesson: {
      title: 'Introduction aux réseaux',
      content: `## 1. Définition

Un **réseau informatique** relie plusieurs équipements pour **échanger des données** et **partager des ressources** (imprimante, fichiers, connexion Internet).

## 2. Classification par taille

| Type | Étendue | Exemple |
|---|---|---|
| PAN | quelques mètres | Bluetooth |
| LAN | un bâtiment | réseau d'un lycée |
| MAN | une ville | réseau municipal |
| WAN | pays / monde | Internet |

## 3. Topologies

- **Bus** : un câble commun.
- **Étoile** : tous reliés à un équipement central (switch) — la plus répandue.
- **Anneau** : machines reliées en boucle.

## 4. Équipements

- **Carte réseau** (NIC), **switch** (relie les machines d'un LAN), **routeur** (relie des réseaux entre eux), **point d'accès Wi-Fi**.

## 5. Protocoles

Un **protocole** est un ensemble de règles de communication : **TCP/IP** (Internet), **HTTP/HTTPS** (web), **SMTP/IMAP** (e-mail), **DNS** (noms de domaine → adresses IP).

## À retenir

- Une adresse **IP** identifie une machine sur un réseau (ex. 192.168.1.10).
- Le modèle client/serveur : le client demande, le serveur répond.`,
    },
    quiz: {
      title: 'Quiz — Les réseaux informatiques',
      questions: [
        single("Quel équipement relie plusieurs réseaux entre eux ?", ['Switch', 'Routeur', 'Carte réseau', 'Câble'], 1, "Le routeur interconnecte les réseaux."),
        single("Quel est le plus grand réseau du monde ?", ['LAN', 'MAN', 'Internet', 'PAN'], 2, "Internet est un WAN mondial."),
        single("Quel protocole traduit un nom de domaine en adresse IP ?", ['HTTP', 'DNS', 'SMTP', 'FTP'], 1, "Le DNS associe nom de domaine et adresse IP."),
        bool("Dans la topologie en étoile, toutes les machines sont reliées à un équipement central.", true, "Généralement un switch."),
        short("Que désigne l'acronyme LAN ?", 'réseau local', "Local Area Network : réseau local."),
      ],
    },
    exercises: [
      {
        title: 'Choisir un réseau',
        statement: "Pour chaque situation, indiquer le type de réseau (PAN, LAN, WAN) : (a) casque Bluetooth ↔ téléphone ; (b) ordinateurs du laboratoire d'informatique d'un lycée ; (c) connexion entre deux filiales dans deux pays.",
        type: 'algorithme', difficulty: 'facile', order: 1,
        starterCode: '',
        solution: `(a) PAN — quelques mètres autour d'une personne.
(b) LAN — réseau limité à un bâtiment.
(c) WAN — liaison longue distance entre sites éloignés.`,
      },
    ],
  },
  {
    title: 'Sécurité informatique',
    description: 'Menaces courantes et bonnes pratiques de protection.',
    order: 5,
    estimatedDuration: 35,
    lesson: {
      title: 'Sécurité informatique',
      content: `## 1. Les menaces

| Menace | Description |
|---|---|
| **Virus** | programme malveillant qui se propage en infectant d'autres fichiers |
| **Ver** | se duplique seul à travers le réseau |
| **Cheval de Troie** | programme qui paraît légitime mais ouvre une porte dérobée |
| **Phishing** | faux e-mail/site qui vole identifiants ou données bancaires |
| **Ransomware** | chiffre vos fichiers contre une rançon |

## 2. Les protections

- **Antivirus** à jour et **pare-feu** (firewall) activé.
- **Mises à jour** régulières du système et des logiciels.
- **Mots de passe robustes** (longs, uniques), idéalement avec un gestionnaire.
- **Sauvegardes** régulières (règle 3-2-1).
- Ne jamais ouvrir de pièce jointe ou lien suspect.

## 3. Les trois piliers de la sécurité

**Confidentialité** (seuls les autorisés lisent), **Intégrité** (les données ne sont pas altérées), **Disponibilité** (le service reste accessible).

## À retenir

- Le maillon faible est souvent l'**utilisateur** : la vigilance est la première protection.
- Le chiffrement protège la confidentialité des données.`,
    },
    quiz: {
      title: 'Quiz — Sécurité informatique',
      questions: [
        single("Un faux e-mail de banque demandant vos identifiants est du…", ['Phishing', 'Spam publicitaire', 'Ver', 'Pare-feu'], 0, "Le phishing (hameçonnage) vole des identifiants."),
        multiple("Quelles sont de bonnes pratiques ?", ['Mettre à jour son système', 'Utiliser le même mot de passe partout', 'Faire des sauvegardes', 'Ouvrir toutes les pièces jointes'], [0, 2], "Mots de passe uniques et prudence avec les pièces jointes."),
        single("Quel programme chiffre vos fichiers contre une rançon ?", ['Ransomware', 'Antivirus', 'Pilote', 'Navigateur'], 0, "C'est un rançongiciel."),
        short("Quel est le rôle d'un pare-feu ? (un mot-clé : filtrer)", 'filtrer', "Le pare-feu filtre le trafic réseau entrant et sortant."),
      ],
    },
    exercises: [
      {
        title: 'Mot de passe robuste',
        statement: "Écrire un programme **Python** qui lit un mot de passe et affiche `Robuste` s'il contient au moins 8 caractères, au moins un chiffre et au moins une lettre ; sinon `Faible`.",
        type: 'python', difficulty: 'moyen', order: 1,
        starterCode: 'mdp = input()\n',
        solution: 'mdp = input()\nchiffre = any(c.isdigit() for c in mdp)\nlettre = any(c.isalpha() for c in mdp)\nprint("Robuste" if len(mdp) >= 8 and chiffre and lettre else "Faible")',
        testInputs: ['abc123\n', 'motdepasse1\n', '12345678\n', 'Bac2026tn\n'],
      },
    ],
  },
];

const defaultBadges = [
  { title: 'Premier pas', description: 'Terminer votre première leçon.', icon: '🚀', criteria: { type: 'lessons_completed', value: 1 } },
  { title: 'Studieux', description: 'Terminer 5 leçons.', icon: '📚', criteria: { type: 'lessons_completed', value: 5 } },
  { title: 'Quiz Master', description: 'Réussir 3 quiz.', icon: '🧠', criteria: { type: 'quizzes_passed', value: 3 } },
  { title: 'Codeur', description: 'Résoudre 5 exercices.', icon: '💻', criteria: { type: 'exercises_completed', value: 5 } },
  { title: 'Sous-module maîtrisé', description: 'Terminer un sous-module complet.', icon: '✅', criteria: { type: 'submodules_completed', value: 1 } },
  { title: 'Algorithmicien', description: 'Terminer tout le module Algorithmique.', icon: '🏅', criteria: { type: 'module_completed', moduleSlug: 'algorithmique' } },
  { title: 'Expert STI', description: 'Terminer tout le module STI.', icon: '🖥️', criteria: { type: 'module_completed', moduleSlug: 'sti' } },
  { title: 'Niveau 5', description: 'Atteindre le niveau 5.', icon: '⭐', criteria: { type: 'level_reached', value: 5 } },
  { title: 'Légende', description: 'Atteindre le niveau 10.', icon: '👑', criteria: { type: 'level_reached', value: 10 } },
];

module.exports = { algorithmiqueExtra, stiExtra, defaultBadges };
