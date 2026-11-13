import { useEffect, useState } from 'react';
import { Alert, Box, Stack } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { getExercises } from '../../api/exercisesApi';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import ExerciseCard from './ExerciseCard';

export default function ExercisesTab({ subModuleId, onExerciseCompleted }) {
  const [exercises, setExercises] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setExercises(null);
    setError('');

    getExercises(subModuleId)
      .then((data) => {
        if (!cancelled) setExercises(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // Désynchronisation possible entre l'état local (onglet affiché comme
        // débloqué) et l'état serveur réel : on affiche le message serveur
        // plutôt que de planter (règles métier, tâche 2.7).
        setError(
          err?.response?.status === 403
            ? err.response.data?.message || "Vous devez réussir le quiz avant d'accéder aux exercices."
            : 'Impossible de charger les exercices pour le moment.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [subModuleId]);

  function handleExerciseCompleted(exerciseId, data) {
    setExercises((prev) => prev.map((ex) => (ex._id === exerciseId ? { ...ex, completed: true } : ex)));
    onExerciseCompleted(data);
  }

  if (error) {
    return <EmptyState icon="🔒" title="Exercices verrouillés" description={error} />;
  }

  if (!exercises) {
    return <LoadingSpinner label="Chargement des exercices…" minHeight={240} />;
  }

  if (exercises.length === 0) {
    return (
      <EmptyState
        icon="🧩"
        title="Aucun exercice disponible"
        description="Le contenu de ce sous-module n'a pas encore été publié."
      />
    );
  }

  const allCompleted = exercises.every((ex) => ex.completed);

  return (
    <Box>
      {allCompleted && (
        <Alert icon={<EmojiEventsRoundedIcon />} severity="success" sx={{ mb: 2 }}>
          Bravo, vous avez terminé tous les exercices de ce sous-module !
        </Alert>
      )}
      <Stack spacing={2}>
        {exercises.map((ex) => (
          <ExerciseCard key={ex._id} exercise={ex} onCompleted={(data) => handleExerciseCompleted(ex._id, data)} />
        ))}
      </Stack>
    </Box>
  );
}
