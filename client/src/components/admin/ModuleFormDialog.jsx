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
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormTextField from '../form/FormTextField';
import { moduleSchema } from '../../validation/adminModuleSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import { MODULE_ICON_OPTIONS, MODULE_COLOR_OPTIONS } from '../../constants/moduleIcons';

const KNOWN_FIELDS = ['title', 'slug', 'description', 'icon', 'color'];

function ModuleFormDialog({ open, module, onClose, onSubmit }) {
  const isEdit = Boolean(module);
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: '', description: '', icon: '', color: MODULE_COLOR_OPTIONS[0] },
  });

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    reset({
      title: module?.title || '',
      description: module?.description || '',
      icon: module?.icon || '',
      color: module?.color || MODULE_COLOR_OPTIONS[0],
    });
  }, [open, module, reset]);

  async function submit(values) {
    setGlobalError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEdit ? 'Modifier le module' : 'Créer un module'}
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

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
            Icône
          </Typography>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(MODULE_ICON_OPTIONS).map(([name, Icon]) => (
                  <Tooltip key={name} title={name}>
                    <IconButton
                      onClick={() => field.onChange(name)}
                      sx={{
                        border: 2,
                        borderColor: field.value === name ? 'primary.main' : 'divider',
                        borderRadius: 1.5,
                      }}
                    >
                      <Icon />
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            )}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
            Couleur
          </Typography>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Stack direction="row" spacing={1}>
                {MODULE_COLOR_OPTIONS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => field.onChange(c)}
                    role="button"
                    aria-label={c}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor: c,
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
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ModuleFormDialog;
