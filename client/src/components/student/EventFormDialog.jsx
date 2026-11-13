import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FormTextField from '../form/FormTextField';
import { eventSchema } from '../../validation/eventSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../constants/eventTypes';

const KNOWN_FIELDS = ['title', 'description', 'start', 'end', 'type', 'color'];

// `datetime-local` interprète toujours sa valeur en heure LOCALE du
// navigateur — on doit donc formater/parser avec les accesseurs locaux
// (getFullYear/getHours...), jamais les accesseurs UTC, pour éviter le même
// type de décalage de fuseau déjà rencontré tâche 2.9.
function toDateTimeLocalValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventFormDialog({ open, event, initialRange, onClose, onSubmit, onDelete }) {
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', description: '', start: '', end: '', type: 'personnel', color: '' },
  });

  useEffect(() => {
    if (!open) return;

    if (event) {
      reset({
        title: event.title,
        description: event.description || '',
        start: toDateTimeLocalValue(event.start),
        end: toDateTimeLocalValue(event.end),
        type: event.type,
        color: event.color || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        start: initialRange ? toDateTimeLocalValue(initialRange.start) : '',
        end: initialRange ? toDateTimeLocalValue(initialRange.end) : '',
        type: 'personnel',
        color: '',
      });
    }
    setGlobalError(null);
  }, [open, event, initialRange, reset]);

  const selectedType = watch('type');

  async function submit(values) {
    setGlobalError(null);
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        // `new Date('YYYY-MM-DDTHH:mm')` (sans suffixe Z) est toujours parsé
        // en heure locale par le moteur JS ; toISOString() donne ensuite un
        // instant absolu non ambigu pour le serveur.
        start: new Date(values.start).toISOString(),
        end: new Date(values.end).toISOString(),
        type: values.type,
        color: values.color || EVENT_TYPE_COLORS[values.type],
      });
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {event ? "Modifier l'événement" : 'Nouvel événement'}
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <DialogContent dividers>
          {globalError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}

          <FormTextField label="Titre" registration={register('title')} error={errors.title} autoFocus />
          <FormTextField
            label="Description"
            registration={register('description')}
            error={errors.description}
            multiline
            minRows={2}
          />
          <FormTextField
            label="Début"
            type="datetime-local"
            registration={register('start')}
            error={errors.start}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormTextField
            label="Fin"
            type="datetime-local"
            registration={register('end')}
            error={errors.end}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormTextField label="Type" select registration={field} error={errors.type}>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </FormTextField>
            )}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => {
              const effectiveColor = field.value || EVENT_TYPE_COLORS[selectedType];
              return (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {Object.entries(EVENT_TYPE_COLORS).map(([t, c]) => (
                    <Box
                      key={t}
                      onClick={() => field.onChange(c)}
                      role="button"
                      aria-label={EVENT_TYPE_LABELS[t]}
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        bgcolor: c,
                        border: 2,
                        borderColor: effectiveColor === c ? 'text.primary' : 'transparent',
                        outline: '1px solid',
                        outlineColor: 'divider',
                      }}
                    />
                  ))}
                </Stack>
              );
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: event ? 'space-between' : 'flex-end' }}>
          {event && (
            <Button color="error" startIcon={<DeleteRoundedIcon />} onClick={() => onDelete(event)} disabled={isSubmitting}>
              Supprimer
            </Button>
          )}
          <Box>
            <Button onClick={onClose} disabled={isSubmitting} sx={{ mr: 1 }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {event ? 'Enregistrer' : 'Créer'}
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default EventFormDialog;
