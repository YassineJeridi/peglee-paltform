import { lazy, Suspense, useState } from 'react';
import { Alert, Box, Button, Chip, Collapse, Paper, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Markdown from 'react-markdown';
import { getExerciseSolution, completeExercise, runExercise } from '../../api/exercisesApi';
import LoadingSpinner from '../LoadingSpinner';
import { useLevelUp } from '../../context/LevelUpContext';

// Monaco (~1 Mo gzippé) ne doit être téléchargé que par les élèves qui
// ouvrent réellement l'onglet Exercices, jamais par la landing page ou les
// autres écrans — d'où le chargement paresseux plutôt qu'un import statique.
const CodeEditor = lazy(() => import('../CodeEditor'));

const DIFFICULTY_COLORS = { facile: 'success', moyen: 'warning', difficile: 'error' };
const TYPE_LABELS = { algorithme: 'Algorithme', python: 'Python' };

// Chaque exercice garde son propre brouillon local dans l'éditeur, non
// persisté côté serveur. Pour les exercices Python dotés de cas de test,
// « Exécuter » lance la vérification automatique (aide) ; « Valider » reste
// le marquage manuel de l'élève.
function ExerciseCard({ exercise, onCompleted }) {
  const [code, setCode] = useState(exercise.starterCode || '');
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [solution, setSolution] = useState(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const { notifyLevelUp } = useLevelUp();

  async function handleRun() {
    setRunning(true);
    setError('');
    try {
      setRunResult(await runExercise(exercise._id, code));
    } catch (err) {
      setRunResult(null);
      setError(err?.response?.data?.message || "Impossible d'exécuter le code pour le moment.");
    } finally {
      setRunning(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setError('');
    try {
      const data = await completeExercise(exercise._id);
      onCompleted(data);
      if (data.leveledUp) notifyLevelUp();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de valider cet exercice pour le moment.');
    } finally {
      setCompleting(false);
    }
  }

  async function handleShowSolution() {
    if (solution !== null) {
      setSolution(null);
      return;
    }
    setLoadingSolution(true);
    setError('');
    try {
      const data = await getExerciseSolution(exercise._id);
      setSolution(data.solution);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de récupérer la solution pour le moment.');
    } finally {
      setLoadingSolution(false);
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: exercise.completed ? 'success.main' : 'divider' }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {exercise.title}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={TYPE_LABELS[exercise.type] || exercise.type} size="small" variant="outlined" />
          <Chip label={exercise.difficulty} size="small" color={DIFFICULTY_COLORS[exercise.difficulty] || 'default'} />
          {exercise.completed && <Chip icon={<CheckCircleRoundedIcon />} label="Résolu" size="small" color="success" />}
        </Stack>
      </Stack>

      <Box sx={{ mb: 2, '& p': { lineHeight: 1.7, m: 0, mb: 1 } }}>
        <Markdown>{exercise.statement}</Markdown>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingSpinner label="Chargement de l'éditeur…" minHeight={260} />}>
          <CodeEditor mode={exercise.type} value={code} onChange={setCode} height={260} />
        </Suspense>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        {exercise.runnable && (
          <Button
            variant="outlined"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleRun}
            disabled={running}
          >
            {running ? 'Exécution…' : 'Exécuter'}
          </Button>
        )}
        <Button variant="contained" onClick={handleComplete} disabled={exercise.completed || completing}>
          {exercise.completed ? 'Validé' : completing ? 'Validation…' : 'Valider'}
        </Button>
        <Button
          variant="text"
          startIcon={<VisibilityRoundedIcon />}
          onClick={handleShowSolution}
          disabled={loadingSolution}
        >
          {solution !== null ? 'Masquer la solution' : 'Voir la solution'}
        </Button>
      </Stack>

      {runResult && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={runResult.allPassed ? 'success' : 'warning'} sx={{ mb: 1 }}>
            {runResult.allPassed
              ? 'Tous les tests passent. Vous pouvez valider l\'exercice.'
              : `${runResult.results.filter((r) => r.passed).length} / ${runResult.results.length} tests réussis.`}
          </Alert>
          <Stack spacing={1}>
            {runResult.results.map((r, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, fontFamily: 'monospace', fontSize: 13 }}>
                <Chip size="small" color={r.passed ? 'success' : 'error'} label={`Test ${i + 1} — ${r.passed ? 'réussi' : r.timedOut ? 'temps dépassé' : 'échoué'}`} sx={{ mb: 0.5 }} />
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {r.input && <div>Entrée : {r.input.trim()}</div>}
                  <div>Attendu : {r.expected}</div>
                  <div>Obtenu : {r.actual}</div>
                  {r.error && <div style={{ color: 'inherit', opacity: 0.8 }}>Erreur : {r.error}</div>}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      <Collapse in={solution !== null} unmountOnExit>
        {solution !== null && (
          <Box sx={{ mt: 2 }}>
            <Suspense fallback={<LoadingSpinner label="Chargement de l'éditeur…" minHeight={200} />}>
              <CodeEditor mode={exercise.type} value={solution} readOnly height={200} />
            </Suspense>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

export default ExerciseCard;
