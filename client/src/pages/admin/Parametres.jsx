import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Collapse, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { getSettings, updateSettings } from '../../api/adminSettingsApi';
import { settingsSchema } from '../../validation/adminSettingsSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import FormTextField from '../../components/form/FormTextField';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfileSettings from '../../components/ProfileSettings';

const KNOWN_FIELDS = ['defaultPassingScore', 'defaultMaxAttempts'];

export default function Parametres() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [globalFormError, setGlobalFormError] = useState(null);
  const [snackbar, setSnackbar] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: { defaultPassingScore: 60, defaultMaxAttempts: 0 },
  });

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        reset({ defaultPassingScore: data.defaultPassingScore, defaultMaxAttempts: data.defaultMaxAttempts });
      })
      .catch(() => setError('Impossible de charger les paramètres pour le moment.'));
  }, [reset]);

  async function onSubmit(values) {
    setGlobalFormError(null);
    try {
      const updated = await updateSettings(values);
      setSettings(updated);
      setSnackbar('Paramètres mis à jour.');
    } catch (err) {
      setGlobalFormError(extractServerErrors(err, { setError: setFormError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Paramètres
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Réglages généraux de la plateforme et votre profil administrateur.
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 560, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Paramètres pédagogiques
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Valeurs proposées par défaut à la création d'un nouveau quiz — n'affectent jamais les quiz déjà créés.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!settings ? (
            <LoadingSpinner minHeight={100} />
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Collapse in={Boolean(globalFormError)} sx={{ mb: globalFormError ? 1 : 0 }}>
                <Alert severity="error" onClose={() => setGlobalFormError(null)}>
                  {globalFormError}
                </Alert>
              </Collapse>
              <Stack direction="row" spacing={2}>
                <FormTextField
                  label="Seuil de réussite par défaut (%)"
                  type="number"
                  registration={register('defaultPassingScore', { valueAsNumber: true })}
                  error={errors.defaultPassingScore}
                />
                <FormTextField
                  label="Tentatives max par défaut (0 = illimité)"
                  type="number"
                  registration={register('defaultMaxAttempts', { valueAsNumber: true })}
                  error={errors.defaultMaxAttempts}
                />
              </Stack>
              <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 1 }}>
                Enregistrer
              </Button>
            </Box>
          )}
        </Paper>
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Mon profil
      </Typography>
      <ProfileSettings />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
