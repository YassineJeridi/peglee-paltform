import { useState } from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import QuizQuestion from '../student/QuizQuestion';

// Prévisualisation admin (tâche 4.6) : réutilise QuizQuestion — le même
// composant de rendu par question que côté élève — pour vérifier énoncé,
// options et interaction. Seuls `text`/`type`/`options`/`points` sont
// transmis (jamais `correctAnswers`/`explanation`), exactement comme le
// endpoint de lecture élève (tâche 2.3) : aucune correction n'est calculée
// ou affichée ici, la soumission réelle reste un endpoint serveur distinct.
function QuizPreview({ title, passingScore, maxAttempts, questions }) {
  const [answers, setAnswers] = useState({});

  function setAnswer(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title || 'Sans titre'}
        </Typography>
        <Chip label={`Seuil de réussite : ${passingScore}%`} size="small" variant="outlined" />
        <Chip
          label={maxAttempts > 0 ? `${maxAttempts} tentative(s) max` : 'Tentatives illimitées'}
          size="small"
          variant="outlined"
        />
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Aperçu de l'expérience élève — les réponses ne sont pas soumises, aucune correction n'est affichée ici.
      </Alert>

      {questions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aucune question pour l'instant.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {questions.map((q, index) => {
            const key = q._id || index;
            return (
              <QuizQuestion
                key={key}
                question={{ _id: key, text: q.text, type: q.type, options: q.options, points: q.points }}
                value={answers[key]}
                onChange={(value) => setAnswer(key, value)}
                disabled={false}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default QuizPreview;
