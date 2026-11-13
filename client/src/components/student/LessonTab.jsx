import { useEffect, useState } from 'react';
import { Alert, Box, Button, Snackbar } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { getLesson } from '../../api/lessonsApi';
import { completeLesson } from '../../api/progressApi';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import LessonContent from './LessonContent';
import { useLevelUp } from '../../context/LevelUpContext';

export default function LessonTab({ subModuleId, lessonCompleted, onLessonCompleted }) {
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [completeError, setCompleteError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { notifyLevelUp } = useLevelUp();

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setError('');

    getLesson(subModuleId)
      .then((data) => {
        if (!cancelled) setLesson(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.status === 404
            ? "Cette leçon n'est pas encore disponible."
            : 'Impossible de charger la leçon pour le moment.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [subModuleId]);

  async function handleComplete() {
    setCompleting(true);
    setCompleteError('');
    try {
      const data = await completeLesson(subModuleId);
      onLessonCompleted();
      setSnackbarOpen(true);
      if (data.leveledUp) notifyLevelUp();
    } catch {
      // État séparé de `error` (qui gate l'affichage de toute la leçon) :
      // un échec ici ne doit pas faire disparaître la leçon déjà chargée,
      // seulement signaler l'échec de l'action ponctuelle (même logique que
      // QuizTab, cf. tâche 5.3).
      setCompleteError("Impossible d'enregistrer votre progression pour le moment.");
    } finally {
      setCompleting(false);
    }
  }

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!lesson) {
    return <LoadingSpinner label="Chargement de la leçon…" minHeight={240} />;
  }

  return (
    <Box>
      <LessonContent lesson={lesson} />

      {completeError && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setCompleteError('')}>
          {completeError}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={lessonCompleted || completing}
          startIcon={lessonCompleted ? <CheckCircleRoundedIcon /> : null}
          onClick={handleComplete}
        >
          {lessonCompleted ? 'Leçon terminée' : "J'ai terminé la leçon"}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Leçon marquée comme terminée. Le quiz est débloqué !"
      />
    </Box>
  );
}
