import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

const STATUS_CONFIG = {
  locked: { icon: LockRoundedIcon, label: 'Verrouillé', color: 'text.disabled' },
  in_progress: { icon: PlayCircleRoundedIcon, label: 'En cours', color: 'warning.main' },
  completed: { icon: CheckCircleRoundedIcon, label: 'Terminé', color: 'success.main' },
};

function Indicator({ Icon, active, label }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: active ? 'success.main' : 'text.disabled' }}>
      <Icon sx={{ fontSize: 18 }} />
      <Typography variant="caption" sx={{ fontWeight: active ? 600 : 400 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function SubModuleListItem({ subModule, onOpen }) {
  const status = STATUS_CONFIG[subModule.status] || STATUS_CONFIG.in_progress;
  const StatusIcon = status.icon;
  const locked = subModule.status === 'locked';

  return (
    <Paper
      elevation={0}
      onClick={() => !locked && onOpen(subModule)}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.6 : 1,
        transition: 'border-color 0.15s',
        '&:hover': locked ? undefined : { borderColor: 'primary.main' },
      }}
    >
      <Box sx={{ color: status.color, display: 'flex' }}>
        <StatusIcon sx={{ fontSize: 28 }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {subModule.title}
        </Typography>
        {subModule.description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {subModule.description}
          </Typography>
        )}
        <Stack direction="row" spacing={2} sx={{ mt: 0.75 }}>
          <Indicator Icon={MenuBookRoundedIcon} active={subModule.lessonCompleted} label="Leçon" />
          <Indicator Icon={QuizRoundedIcon} active={subModule.quizPassed} label="Quiz" />
          <Indicator
            Icon={FitnessCenterRoundedIcon}
            active={subModule.exercisesCompleted > 0 && subModule.exercisesCompleted === subModule.exercisesTotal}
            label={`Exercices ${subModule.exercisesCompleted}/${subModule.exercisesTotal}`}
          />
        </Stack>
      </Box>

      <Chip label={status.label} size="small" sx={{ color: status.color, borderColor: status.color }} variant="outlined" />
    </Paper>
  );
}

export default SubModuleListItem;
