import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Alert, Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/eventsApi';
import { EVENT_TYPE_COLORS } from '../../constants/eventTypes';
import EventFormDialog from '../../components/student/EventFormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Calendrier() {
  const calendarRef = useRef(null);
  const theme = useTheme();
  // Vue Mois + sélecteur à 3 boutons illisibles sur un écran de téléphone
  // (tâche 5.2, §14) : vue Jour par défaut et barre d'outils condensée en
  // dessous de `sm`. Ne s'applique qu'au montage (FullCalendar ne réagit pas
  // à un changement d'`initialView` après coup), ce qui couvre le cas
  // principal — ouverture de la page sur mobile.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogState, setDialogState] = useState({ open: false, event: null, initialRange: null });
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Chargement par plage visible (mois/semaine/jour affiché) plutôt que tout
  // l'historique de l'élève, pour limiter la charge réseau (§14).
  function fetchEvents(info, successCallback, failureCallback) {
    getEvents({ start: info.startStr, end: info.endStr })
      .then((events) => {
        successCallback(
          events.map((e) => ({
            id: e._id,
            title: e.title,
            start: e.start,
            end: e.end,
            backgroundColor: e.color || EVENT_TYPE_COLORS[e.type],
            borderColor: e.color || EVENT_TYPE_COLORS[e.type],
            extendedProps: { raw: e },
          }))
        );
      })
      .catch((err) => {
        setError('Impossible de charger vos événements pour le moment.');
        failureCallback(err);
      });
  }

  function handleSelect(selectionInfo) {
    setDialogState({ open: true, event: null, initialRange: { start: selectionInfo.start, end: selectionInfo.end } });
    calendarRef.current?.getApi().unselect();
  }

  function handleEventClick(clickInfo) {
    setDialogState({ open: true, event: clickInfo.event.extendedProps.raw, initialRange: null });
  }

  function closeDialog() {
    setDialogState({ open: false, event: null, initialRange: null });
  }

  function refetch() {
    calendarRef.current?.getApi().refetchEvents();
  }

  async function handleSubmit(values) {
    if (dialogState.event) {
      await updateEvent(dialogState.event._id, values);
    } else {
      await createEvent(values);
    }
    closeDialog();
    refetch();
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteEvent(eventToDelete._id);
      setEventToDelete(null);
      closeDialog();
      refetch();
    } catch {
      setError("La suppression a échoué. Réessayez.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.35), rgba(76, 201, 240, 0.25))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'primary.light',
            flexShrink: 0,
          }}
        >
          <CalendarMonthRoundedIcon />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Calendrier
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Organisez vos révisions, quiz et échéances.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* `Paper` (pas un `Box` brut) pour hériter du verre translucide flouté
          du thème (MuiPaper, theme/index.js) — sans ça la carte reste un
          simple rectangle plat, en rupture avec le reste de l'app. */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          p: { xs: 1, sm: 2.5 },
          '& .fc': { fontFamily: 'inherit' },
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
          headerToolbar={
            isMobile
              ? { left: 'prev,next', center: 'title', right: 'today' }
              : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
          }
          locale={frLocale}
          selectable
          select={handleSelect}
          eventClick={handleEventClick}
          events={fetchEvents}
          height="auto"
        />
      </Paper>

      <EventFormDialog
        open={dialogState.open}
        event={dialogState.event}
        initialRange={dialogState.initialRange}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={setEventToDelete}
      />

      <ConfirmDialog
        open={Boolean(eventToDelete)}
        title="Supprimer l'événement ?"
        description={eventToDelete ? `« ${eventToDelete.title} » sera définitivement supprimé.` : ''}
        onCancel={() => setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </Box>
  );
}
