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
import FormTextField from '../form/FormTextField';
import { taskSchema } from '../../validation/taskSchemas';
import { extractServerErrors } from '../../api/handleApiError';

const COLOR_OPTIONS = ['', '#9D4EDD', '#4CC9F0', '#F72585', '#FF9E00', '#480CA8'];
const KNOWN_FIELDS = ['title', 'description', 'priority', 'dueDate', 'color'];

function toDateInputValue(dueDate) {
  if (!dueDate) return '';
  return new Date(dueDate).toISOString().slice(0, 10);
}

function TaskFormDialog({ open, task, onClose, onSubmit }) {
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', priority: 'medium', dueDate: '', color: '' },
  });

  useEffect(() => {
    if (open) {
      setGlobalError(null);
      reset({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        dueDate: toDateInputValue(task?.dueDate),
        color: task?.color || '',
      });
    }
  }, [open, task, reset]);

  async function submit(values) {
    setGlobalError(null);
    try {
      await onSubmit({ ...values, dueDate: values.dueDate || null });
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
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
            minRows={3}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormTextField label="Priorité" select registration={field} error={errors.priority}>
                <MenuItem value="low">Basse</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
              </FormTextField>
            )}
          />

          <FormTextField
            label="Date d'échéance"
            type="date"
            registration={register('dueDate')}
            error={errors.dueDate}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {COLOR_OPTIONS.map((c) => (
                  <Box
                    key={c || 'none'}
                    onClick={() => field.onChange(c)}
                    role="button"
                    aria-label={c || 'Aucune couleur'}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor: c || 'action.hover',
                      border: 2,
                      borderColor: field.value === c ? 'text.primary' : 'transparent',
                      outline: '1px solid',
                      outlineColor: 'divider',
                    }}
                  />
                ))}
              </Stack>
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {task ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default TaskFormDialog;
