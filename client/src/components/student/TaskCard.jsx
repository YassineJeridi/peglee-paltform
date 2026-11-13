import { Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'default' },
  medium: { label: 'Moyenne', color: 'warning' },
  high: { label: 'Haute', color: 'error' },
};

function formatDueDate(dueDate) {
  return new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function TaskCard({ task, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        border: 1,
        borderColor: 'divider',
        borderLeft: 4,
        borderLeftColor: task.color || 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {task.title}
        </Typography>
        <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
          <IconButton size="small" onClick={() => onEdit(task)} aria-label="Modifier la tâche">
            <EditRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(task)} aria-label="Supprimer la tâche">
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Stack>

      {task.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip label={priority.label} size="small" color={priority.color} />
        {task.dueDate && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <EventRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{formatDueDate(task.dueDate)}</Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default TaskCard;
