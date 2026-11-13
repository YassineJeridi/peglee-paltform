import { Box, Checkbox, IconButton, MenuItem, Radio, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

const QUESTION_TYPE_LABELS = {
  single: 'QCM (choix unique)',
  multiple: 'QCM (choix multiple)',
  boolean: 'Vrai / Faux',
  short: 'Réponse courte',
};

function QuestionEditor({ question, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  function update(patch) {
    onChange({ ...question, ...patch });
  }

  function updateOption(i, text) {
    const options = [...question.options];
    options[i] = text;
    update({ options });
  }

  function addOption() {
    update({ options: [...question.options, ''] });
  }

  function removeOption(i) {
    const options = question.options.filter((_, idx) => idx !== i);
    // Réajuste les index de bonnes réponses affectés par la suppression.
    const current = Array.isArray(question.correctAnswers) ? question.correctAnswers : [];
    const correctAnswers = current.filter((ci) => ci !== i).map((ci) => (ci > i ? ci - 1 : ci));
    update({ options, correctAnswers });
  }

  function changeType(type) {
    if (type === 'boolean') {
      update({ type, options: ['Vrai', 'Faux'], correctAnswers: [] });
    } else if (type === 'short') {
      update({ type, options: [], correctAnswers: '' });
    } else {
      update({ type, options: question.options.length ? question.options : ['', ''], correctAnswers: [] });
    }
  }

  function toggleCorrectSingle(i) {
    update({ correctAnswers: [i] });
  }

  function toggleCorrectMultiple(i) {
    const current = Array.isArray(question.correctAnswers) ? question.correctAnswers : [];
    const next = current.includes(i) ? current.filter((c) => c !== i) : [...current, i];
    update({ correctAnswers: next });
  }

  const isChoiceType = question.type === 'single' || question.type === 'multiple' || question.type === 'boolean';
  const correctSet = new Set(Array.isArray(question.correctAnswers) ? question.correctAnswers : []);

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Question {index + 1}
        </Typography>
        <Tooltip title="Monter">
          <span>
            <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
              <ArrowUpwardRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Descendre">
          <span>
            <IconButton size="small" onClick={onMoveDown} disabled={index === total - 1}>
              <ArrowDownwardRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Supprimer la question">
          <IconButton size="small" onClick={onRemove}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TextField
        label="Énoncé"
        value={question.text}
        onChange={(e) => update({ text: e.target.value })}
        fullWidth
        size="small"
        sx={{ mb: 1.5 }}
      />

      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField select label="Type" value={question.type} onChange={(e) => changeType(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Points"
          type="number"
          value={question.points}
          onChange={(e) => update({ points: Number(e.target.value) })}
          size="small"
          sx={{ width: 100 }}
        />
      </Stack>

      {isChoiceType && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Options — cochez la ou les bonnes réponses
          </Typography>
          <Stack spacing={0.5}>
            {question.options.map((opt, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {question.type === 'multiple' ? (
                  <Checkbox checked={correctSet.has(i)} onChange={() => toggleCorrectMultiple(i)} size="small" />
                ) : (
                  <Radio checked={correctSet.has(i)} onChange={() => toggleCorrectSingle(i)} size="small" />
                )}
                <TextField
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  size="small"
                  fullWidth
                  disabled={question.type === 'boolean'}
                />
                {question.type !== 'boolean' && (
                  <IconButton size="small" onClick={() => removeOption(i)} disabled={question.options.length <= 1}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
          {question.type !== 'boolean' && (
            <IconButton size="small" onClick={addOption} sx={{ mt: 0.5 }}>
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {question.type === 'short' && (
        <TextField
          label="Réponse attendue"
          value={question.correctAnswers || ''}
          onChange={(e) => update({ correctAnswers: e.target.value })}
          size="small"
          fullWidth
          sx={{ mb: 1.5 }}
          helperText="Comparaison insensible à la casse et aux espaces superflus."
        />
      )}

      <TextField
        label="Explication (affichée après soumission)"
        value={question.explanation}
        onChange={(e) => update({ explanation: e.target.value })}
        size="small"
        fullWidth
        multiline
        minRows={2}
      />
    </Box>
  );
}

export default QuestionEditor;
