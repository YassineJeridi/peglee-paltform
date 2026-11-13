import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormTextField from '../form/FormTextField';
import { subModuleSchema } from '../../validation/adminModuleSchemas';
import { extractServerErrors } from '../../api/handleApiError';

const KNOWN_FIELDS = ['title', 'description', 'estimatedDuration'];

function SubModuleFormDialog({ open, subModule, onClose, onSubmit }) {
  const isEdit = Boolean(subModule);
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subModuleSchema),
    defaultValues: { title: '', description: '', estimatedDuration: '' },
  });

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    reset({
      title: subModule?.title || '',
      description: subModule?.description || '',
      estimatedDuration: subModule?.estimatedDuration ?? '',
    });
  }, [open, subModule, reset]);

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
        {isEdit ? 'Modifier le sous-module' : 'Créer un sous-module'}
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
            label="Durée estimée (minutes)"
            type="number"
            registration={register('estimatedDuration')}
            error={errors.estimatedDuration}
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

export default SubModuleFormDialog;
