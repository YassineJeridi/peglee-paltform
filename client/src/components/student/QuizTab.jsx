import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { getQuiz, submitQuiz } from '../../api/quizApi';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import QuizQuestion from './QuizQuestion';
import { useLevelUp } from '../../context/LevelUpContext';

export default function QuizTab({ subModuleId, onQuizPassed }) {
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const { notifyLevelUp } = useLevelUp();

  useEffect(() => {
    let cancelled = false;
    setQuiz(null);
    setError('');
    setAnswers({});
    setResult(null);
    setReviewing(false);

    getQuiz(subModuleId)
      .then((data) => {
        if (cancelled) return;
        setQuiz(data);
        setAttemptsRemaining(data.attemptsRemaining);
        // Un meilleur score >= seuil de réussite implique nécessairement
        // quizPassed = true côté serveur (invariant de la tâche 2.5).
        if (data.bestScore >= data.passingScore) setReviewing(true);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le quiz pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, [subModuleId]);

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const data = await submitQuiz(quiz._id, payload);
      setResult(data);
      if (attemptsRemaining !== null) setAttemptsRemaining(Math.max(attemptsRemaining - 1, 0));
      if (data.passed) onQuizPassed(data.quizBestScore);
      if (data.leveledUp) notifyLevelUp();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de soumettre le quiz pour le moment.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  if (error && !quiz) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!quiz) {
    return <LoadingSpinner label="Chargement du quiz…" minHeight={240} />;
  }

  const correctionByQuestionId = new Map((result?.correction || []).map((c) => [c.questionId, c]));
  const showCorrection = Boolean(result);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quiz.questions.length;
  const maxAttemptsReached = attemptsRemaining === 0;

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', mb: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {quiz.title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Seuil de réussite : ${quiz.passingScore}%`} size="small" variant="outlined" />
            {quiz.maxAttempts > 0 && (
              <Chip label={`Tentatives restantes : ${attemptsRemaining}`} size="small" variant="outlined" />
            )}
          </Stack>
        </Stack>
      </Paper>

      {result && (
        <Alert severity={result.passed ? 'success' : 'error'} sx={{ mb: 2 }}>
          Score obtenu : {result.score}% — {result.passed ? 'Quiz réussi !' : 'Quiz non réussi.'} Meilleur score :{' '}
          {result.quizBestScore}%.
        </Alert>
      )}

      {reviewing && !result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Vous avez déjà réussi ce quiz (meilleur score : {quiz.bestScore}%). Vous pouvez le repasser pour vous
          entraîner.
        </Alert>
      )}

      {error && quiz && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reviewing && !result ? (
        <Button variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={handleRetry} disabled={maxAttemptsReached}>
          Repasser le quiz
        </Button>
      ) : (
        <>
          <Stack spacing={2}>
            {quiz.questions.map((q) => (
              <QuizQuestion
                key={q._id}
                question={q}
                value={answers[q._id]}
                onChange={(value) => setAnswer(q._id, value)}
                disabled={showCorrection}
                correction={correctionByQuestionId.get(q._id)}
              />
            ))}
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            {showCorrection ? (
              <Button
                variant="outlined"
                startIcon={<ReplayRoundedIcon />}
                onClick={handleRetry}
                disabled={maxAttemptsReached}
              >
                {maxAttemptsReached ? 'Nombre maximal de tentatives atteint' : 'Repasser le quiz'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} disabled={!allAnswered || submitting}>
                {submitting ? 'Envoi…' : 'Soumettre'}
              </Button>
            )}
          </Box>
        </>
      )}

      {submitting && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}
