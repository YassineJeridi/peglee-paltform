import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Stack, Tooltip } from '@mui/material';
import '../utils/monacoSetup'; // configure le loader pour utiliser Monaco en local (pas de CDN)
import {
  TUNISIAN_ALGO_LANGUAGE_ID,
  TUNISIAN_ALGO_THEME_ID,
  registerTunisianAlgoLanguage,
} from '../utils/monacoTunisianAlgoLanguage';

const MONACO_LANGUAGE_BY_MODE = {
  algorithme: TUNISIAN_ALGO_LANGUAGE_ID,
  python: 'python',
};

// Composant réutilisable (tâche 2.8) : même API dans les deux modes, utilisé
// par ExerciseCard (tâche 2.7) et potentiellement par l'éditeur de leçons
// admin (Phase 4).
function CodeEditor({ mode, value, onChange, readOnly = false, height = 320 }) {
  const editorRef = useRef(null);

  function handleMount(editor, monaco) {
    editorRef.current = editor;
    registerTunisianAlgoLanguage(monaco);
  }

  function insertAssignmentArrow() {
    const editor = editorRef.current;
    if (!editor) return;
    // Le clavier ne propose pas ← nativement (§8.4) : bouton dédié pour
    // l'insérer à la position du curseur / sur la sélection courante.
    editor.executeEdits('insert-assignment-arrow', [
      { range: editor.getSelection(), text: '←', forceMoveMarkers: true },
    ]);
    editor.focus();
  }

  return (
    <Box>
      {mode === 'algorithme' && !readOnly && (
        <Stack direction="row" sx={{ mb: 1 }}>
          <Tooltip title="Insérer le symbole d'affectation ←">
            <Button
              size="small"
              variant="outlined"
              onClick={insertAssignmentArrow}
              sx={{ minWidth: 0, px: 1.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '1rem' }}
            >
              ←
            </Button>
          </Tooltip>
        </Stack>
      )}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        <Editor
          height={height}
          language={MONACO_LANGUAGE_BY_MODE[mode] || 'plaintext'}
          theme={mode === 'algorithme' ? TUNISIAN_ALGO_THEME_ID : 'vs-dark'}
          value={value}
          onChange={(next) => onChange?.(next ?? '')}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Box>
    </Box>
  );
}

export default CodeEditor;
