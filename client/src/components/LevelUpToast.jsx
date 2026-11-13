import { useEffect, useState } from 'react';
import { Snackbar, Box, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useLevelUp } from '../context/LevelUpContext';

// Notification ponctuelle de changement de niveau (tâche 5.1, critère
// d'acceptation "visible côté élève de façon claire") — montée une fois dans
// DashboardLayout, déclenchée par LessonTab/QuizTab/ExerciseCard via
// useLevelUp().notifyLevelUp() quand la réponse API renvoie leveledUp: true.
function LevelUpToast() {
  const { pulse } = useLevelUp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pulse === 0) return;
    setOpen(true);
  }, [pulse]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: { xs: 76, md: 88 } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          py: 1.5,
          borderRadius: 99,
          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.92), rgba(255, 158, 0, 0.85))',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 20px 45px rgba(157, 78, 221, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          color: '#fff',
          animation: 'levelUpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <EmojiEventsRoundedIcon />
        <Typography sx={{ fontWeight: 700 }}>Niveau supérieur !</Typography>
      </Box>
    </Snackbar>
  );
}

export default LevelUpToast;
