import { useEffect, useState } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { getUpcomingEvents } from '../../api/eventsApi';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';

function formatEventDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Branché sur GET /api/events?upcoming=true (tâche 3.3) — désormais que le
// calendrier existe, ce widget n'a plus besoin d'un état statique (tâche 2.9).
function UpcomingEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents(5)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger vos échéances pour le moment.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Prochaines échéances
      </Typography>

      {error && <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} minHeight={120} />}

      {!error && !events && <LoadingSpinner label="Chargement…" minHeight={120} />}

      {!error && events && events.length === 0 && (
        <EmptyState icon="🗓️" title="Aucune échéance à venir" description="Ajoutez un événement depuis le calendrier." minHeight={120} />
      )}

      {!error && events && events.length > 0 && (
        <Stack spacing={1.5}>
          {events.map((e) => (
            <Stack key={e._id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: e.color || EVENT_TYPE_COLORS[e.type], flexShrink: 0 }} />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {e.title}
              </Typography>
              <Chip label={EVENT_TYPE_LABELS[e.type] || e.type} size="small" variant="outlined" />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {formatEventDate(e.start)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default UpcomingEvents;
