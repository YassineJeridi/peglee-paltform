import {
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

// `value` : tableau d'index sélectionnés pour single/boolean/multiple (même
// format que `correctAnswers` côté serveur, cf. services/quizService.js),
// chaîne pour `short`. `correction` (optionnel) est fourni après soumission :
// { correct, correctAnswers, explanation }.
function QuizQuestion({ question, value, onChange, disabled, correction }) {
  const isChoiceType = question.type === 'single' || question.type === 'boolean' || question.type === 'multiple';
  const selected = isChoiceType && Array.isArray(value) ? value : [];

  function toggleChoice(index) {
    if (question.type === 'multiple') {
      const next = selected.includes(index) ? selected.filter((i) => i !== index) : [...selected, index];
      onChange(next);
    } else {
      onChange([index]);
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        {question.text}
      </Typography>

      {isChoiceType && question.type !== 'multiple' && (
        <RadioGroup
          value={selected[0] ?? ''}
          onChange={(e) => toggleChoice(Number(e.target.value))}
        >
          {question.options.map((opt, index) => (
            <FormControlLabel
              key={index}
              value={index}
              disabled={disabled}
              control={<Radio />}
              label={opt}
            />
          ))}
        </RadioGroup>
      )}

      {question.type === 'multiple' && (
        <FormGroup>
          {question.options.map((opt, index) => (
            <FormControlLabel
              key={index}
              disabled={disabled}
              control={<Checkbox checked={selected.includes(index)} onChange={() => toggleChoice(index)} />}
              label={opt}
            />
          ))}
        </FormGroup>
      )}

      {question.type === 'short' && (
        <TextField
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          size="small"
          placeholder="Votre réponse"
          fullWidth
        />
      )}

      {correction && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Alert
            severity={correction.correct ? 'success' : 'error'}
            icon={correction.correct ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
          >
            {correction.correct ? 'Bonne réponse.' : 'Réponse incorrecte.'}
            {correction.explanation ? ` ${correction.explanation}` : ''}
          </Alert>
        </Stack>
      )}
    </Paper>
  );
}

export default QuizQuestion;
