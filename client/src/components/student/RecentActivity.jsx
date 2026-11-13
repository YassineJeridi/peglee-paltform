import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmptyState from '../EmptyState';

const RTF = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

function formatRelativeTime(isoDate) {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) return RTF.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return RTF.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return RTF.format(diffDays, 'day');
}

function activityLabel(item) {
  if (item.type === 'quiz_attempt') {
    return `Quiz ${item.subModuleTitle || ''} — ${item.passed ? 'réussi' : 'échoué'} (${item.score}%)`;
  }
  if (item.lessonCompleted && item.quizPassed) {
    return `${item.subModuleTitle || ''} — quiz réussi`;
  }
  if (item.lessonCompleted) {
    return `${item.subModuleTitle || ''} — leçon terminée`;
  }
  return `${item.subModuleTitle || ''} — progression mise à jour`;
}

function RecentActivity({ activity }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Activité récente
      </Typography>

      {activity.length === 0 ? (
        <EmptyState
          icon="✨"
          title="Aucune activité pour l'instant"
          description="Commencez une leçon pour voir votre activité apparaître ici."
          minHeight={140}
        />
      ) : (
        <Stack spacing={1.5}>
          {activity.map((item, index) => {
            const Icon = item.type === 'quiz_attempt' ? QuizRoundedIcon : TrendingUpRoundedIcon;
            return (
              <Stack key={index} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {activityLabel(item)}
                </Typography>
                {item.type === 'quiz_attempt' && (
                  <Chip
                    label={item.passed ? 'Réussi' : 'Échoué'}
                    size="small"
                    color={item.passed ? 'success' : 'default'}
                  />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {formatRelativeTime(item.at)}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export default RecentActivity;
