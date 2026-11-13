// Auto-hébergement de Monaco (§9.4 : pas de dépendance runtime à un CDN
// externe). Par défaut, `@monaco-editor/react` charge Monaco depuis
// cdn.jsdelivr.net — inacceptable pour une plateforme scolaire qui doit
// fonctionner sans connexion internet fiable côté client. On pointe donc le
// loader vers le paquet npm local, avec le worker Vite dédié.
import { loader } from '@monaco-editor/react';
// On importe le cœur de l'éditeur (`editor.api.js`) plutôt que le paquet
// racine `monaco-editor`, qui embarque ~90 langages + les fonctionnalités
// LSP-like css/html/json/typescript : plusieurs Mo inutiles pour un éditeur
// qui n'a besoin que de Python et de notre langage Monarch personnalisé.
import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/languages/definitions/python/register.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';

self.MonacoEnvironment = {
  // Le tokenizer Monarch (langue « tunisian-algo ») et la coloration Python
  // intégrée de Monaco n'ont besoin que du worker générique de l'éditeur —
  // pas des workers TS/JSON/CSS, qu'on ne charge donc pas.
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });
