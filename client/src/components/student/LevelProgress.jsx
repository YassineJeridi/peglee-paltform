import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';

// Le calcul exact des paliers est finalisé en Phase 5 (tâche 5.1) ; ici on se
// contente de consommer level/xp/xpIntoLevel/xpForNextLevel déjà exposés par
// GET /api/progress/me (§13.3).
function LevelProgress({ level, xp, xpIntoLevel, xpForNextLevel }) {
  const isMaxLevel = xpForNextLevel === null || xpForNextLevel === undefined;
  const percent = isMaxLevel ? 100 : Math.min(Math.round((xpIntoLevel / xpForNextLevel) * 100), 100);

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'secondary.main',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <MilitaryTechRoundedIcon />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Niveau {level}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {xp} XP au total
          </Typography>
        </Box>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main', borderRadius: 4 } }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
        {isMaxLevel ? 'Niveau maximum atteint' : `${xpIntoLevel} / ${xpForNextLevel} XP vers le niveau ${level + 1}`}
      </Typography>
    </Paper>
  );
}

export default LevelProgress;
