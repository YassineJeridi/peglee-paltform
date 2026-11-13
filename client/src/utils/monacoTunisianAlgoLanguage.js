// Langage Monaco personnalisé pour la notation algorithmique tunisienne
// (§8.3). Monaco n'a pas de grammaire native pour cette notation ; on la
// définit ici. Les mots-clés exacts sont à confirmer avec le client
// (points-a-confirmer.md #1) — ils sont donc externalisés dans ces listes
// plutôt qu'éparpillés dans des regex, pour rester ajustables en un seul
// endroit.

export const TUNISIAN_ALGO_LANGUAGE_ID = 'tunisian-algo';
export const TUNISIAN_ALGO_THEME_ID = 'tunisian-algo-theme';

export const STRUCTURE_KEYWORDS = ['Algorithme', 'Début', 'Fin', 'Fonction', 'Procédure'];
export const TYPE_KEYWORDS = ['entier', 'réel', 'booléen', 'caractère', 'chaîne'];
// Monarch matche des identifiants \w+ : les mots-clés composés (« Fin Pour »,
// « Tant Que »...) sont donc listés mot par mot, chaque mot restant coloré
// individuellement — suffisant pour une coloration descriptive.
export const CONTROL_KEYWORDS = [
  'Si', 'Alors', 'Sinon', 'Finsi',
  'Selon',
  'Pour', 'de', 'à', 'Faire',
  'Tant', 'Que',
  'Répéter',
];
export const IO_KEYWORDS = ['écrire', 'lire'];
export const LOGICAL_OPERATORS = ['ET', 'OU', 'NON'];
export const ARITHMETIC_OPERATORS = ['DIV', 'MOD'];

const monarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.tunisianAlgo',
  ignoreCase: true,

  keywords: [...STRUCTURE_KEYWORDS, ...CONTROL_KEYWORDS, ...IO_KEYWORDS],
  typeKeywords: TYPE_KEYWORDS,
  logicalOperators: LOGICAL_OPERATORS,
  arithmeticOperators: ARITHMETIC_OPERATORS,

  tokenizer: {
    root: [
      // Tokens composés/à ponctuation avant la règle générique d'identifiant.
      [/T\.D\.O/, 'keyword.structure'],
      [/Jusqu['’]à/, 'keyword.control'],
      [/←/, 'operator.assign'],

      [
        /[a-zA-ZÀ-ÖØ-öø-ÿ_][\w$À-ÖØ-öø-ÿ]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@logicalOperators': 'operator.logical',
            '@arithmeticOperators': 'operator.arithmetic',
            '@default': 'identifier',
          },
        },
      ],

      [/".*?"/, 'string'],
      [/\d+(\.\d+)?/, 'number'],
      [/[{}()[\]]/, '@brackets'],
      [/[<>=+\-*/]/, 'operator'],
      [/\/\/.*$/, 'comment'],
    ],
  },
};

const languageConfiguration = {
  comments: { lineComment: '//' },
  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
  ],
  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '"', close: '"' },
  ],
};

const theme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C8B6FF', fontStyle: 'bold' },
    { token: 'keyword.structure', foreground: 'C8B6FF', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'C8B6FF', fontStyle: 'bold' },
    { token: 'type', foreground: '4CC9F0' },
    { token: 'operator.logical', foreground: 'FF9E00', fontStyle: 'bold' },
    { token: 'operator.arithmetic', foreground: 'FF9E00', fontStyle: 'bold' },
    { token: 'operator.assign', foreground: 'F72585', fontStyle: 'bold' },
    { token: 'string', foreground: 'FDE68A' },
    { token: 'number', foreground: '8DE4FF' },
    { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
    { token: 'identifier', foreground: 'E2E8F0' },
  ],
  colors: {
    'editor.background': '#0A0918',
  },
};

let registered = false;

// `monaco.languages.register` avec un id déjà connu ne relève pas d'erreur,
// mais on évite quand même de redéfinir tokenizer/thème à chaque montage du
// composant (CodeEditor est instancié plusieurs fois par page d'exercices).
export function registerTunisianAlgoLanguage(monaco) {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: TUNISIAN_ALGO_LANGUAGE_ID });
  monaco.languages.setMonarchTokensProvider(TUNISIAN_ALGO_LANGUAGE_ID, monarchLanguage);
  monaco.languages.setLanguageConfiguration(TUNISIAN_ALGO_LANGUAGE_ID, {
    ...languageConfiguration,
    onEnterRules: [
      {
        beforeText: /(Alors|Faire|Début|Sinon)\s*$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  });
  monaco.editor.defineTheme(TUNISIAN_ALGO_THEME_ID, theme);
}
