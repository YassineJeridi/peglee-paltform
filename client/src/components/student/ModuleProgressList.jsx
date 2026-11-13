import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import EmptyState from '../EmptyState';

// `modules` vient de GET /api/progress/me (`{ moduleId, title, progressPercent }`
// par module réellement présent en base) — jamais de liste figée, pour
// refléter fidèlement les modules créés par l'admin (critère d'acceptation).
function ModuleProgressList({ modules }) {
  if (modules.length === 0) {
    return <EmptyState icon="📚" title="Aucun module" description="Aucun module n'a encore été publié." minHeight={160} />;
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Progression par module
      </Typography>
      <Stack spacing={2}>
        {modules.map((m) => (
          <Box key={m.moduleId}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{m.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {m.progressPercent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={m.progressPercent}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default ModuleProgressList;
