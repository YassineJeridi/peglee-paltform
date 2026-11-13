import { Box, Button, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { MODULE_ICON_OPTIONS, MODULE_ICON_FALLBACK } from '../../constants/moduleIcons';

const FALLBACK_COLOR = '#9D4EDD';

function ModuleCard({ module, onOpen }) {
  // Le nom d'icône vient du sélecteur admin (tâche 4.4) — registre partagé
  // pour garantir qu'un choix admin se résout toujours correctement ici.
  const Icon = MODULE_ICON_OPTIONS[module.icon] || MODULE_ICON_FALLBACK;
  // `${color}1A` (alpha suffix) n'est valide que sur un hex ; on n'utilise
  // donc jamais un token de thème (ex. "primary.main") ici.
  const color = module.color || FALLBACK_COLOR;
  const progress = module.progressPercent ?? 0;

  return (
    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}1A`,
            color,
            flexShrink: 0,
          }}
        >
          <Icon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {module.title}
          </Typography>
          {module.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {module.description}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Progression
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {progress}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
        />
      </Box>

      <Button
        variant="outlined"
        endIcon={<ArrowForwardRoundedIcon />}
        onClick={() => onOpen(module)}
        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
      >
        {progress > 0 ? 'Continuer' : 'Ouvrir'}
      </Button>
    </Paper>
  );
}

export default ModuleCard;
