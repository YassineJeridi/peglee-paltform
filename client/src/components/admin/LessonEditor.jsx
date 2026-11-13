import { useRef } from 'react';
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

const SNIPPETS = {
  heading: { before: '## ', after: '', placeholder: 'Titre' },
  list: { before: '- ', after: '', placeholder: 'Élément' },
  image: { before: '![', after: '](url-image)', placeholder: 'texte alternatif' },
  algo: { before: '```algorithme\n', after: '\n```', placeholder: 'Algorithme Exemple\nDébut\n\nFin' },
  python: { before: '```python\n', after: '\n```', placeholder: '# code Python' },
  table: { before: '', after: '', placeholder: '| Colonne 1 | Colonne 2 |\n|---|---|\n| valeur | valeur |' },
};

const TOOLBAR = [
  { key: 'heading', label: 'Titre', Icon: TitleRoundedIcon },
  { key: 'list', label: 'Liste', Icon: FormatListBulletedRoundedIcon },
  { key: 'image', label: 'Image', Icon: ImageRoundedIcon },
  { key: 'algo', label: 'Bloc Algorithme', Icon: CodeRoundedIcon },
  { key: 'python', label: 'Bloc Python', Icon: TerminalRoundedIcon },
  { key: 'table', label: 'Tableau', Icon: TableChartRoundedIcon },
];

// Éditeur Markdown avec barre d'outils d'insertion (tâche 4.5) — pas de
// WYSIWYG : cohérent avec le format Markdown retenu tâche 2.2 (plus simple à
// sécuriser/versionner qu'un HTML riche). Les boutons de bloc de code
// insèrent les fences ```algorithme / ```python dont la coloration est
// définie tâche 2.8 et rendue à l'identique par LessonPreview.
function LessonEditor({ value, onChange, error }) {
  const textareaRef = useRef(null);

  function insertSnippet(key) {
    const textarea = textareaRef.current;
    const { before, after, placeholder } = SNIPPETS[key];

    if (!textarea) {
      onChange(`${value}${before}${placeholder}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const insertion = `${before}${selected}${after}`;
    const next = value.slice(0, start) + insertion + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + insertion.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  return (
    <Box>
      <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
        {TOOLBAR.map(({ key, label, Icon }) => (
          <Tooltip key={key} title={label}>
            <IconButton size="small" onClick={() => insertSnippet(key)}>
              <Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={Boolean(error)}
        helperText={error?.message || ' '}
        fullWidth
        multiline
        minRows={16}
        inputRef={textareaRef}
        slotProps={{
          htmlInput: {
            sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85rem' },
          },
        }}
      />
    </Box>
  );
}

export default LessonEditor;
