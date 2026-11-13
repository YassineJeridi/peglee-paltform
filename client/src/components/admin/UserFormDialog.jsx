import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormTextField from '../form/FormTextField';
import { createUserSchema, editUserSchema } from '../../validation/adminUserSchemas';
import { extractServerErrors } from '../../api/handleApiError';

const KNOWN_FIELDS = ['username', 'email', 'password', 'role'];

// Seul endroit de toute l'interface où `role` est éditable (§3.2) : aucune
// interface publique ne permet l'auto-promotion en admin.
function UserFormDialog({ open, user, onClose, onSubmit }) {
  const isEdit = Boolean(user);
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: { username: '', email: '', password: '', role: 'student' },
  });

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    reset({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'student',
    });
  }, [open, user, reset]);

  async function submit(values) {
    setGlobalError(null);
    try {
      const payload = isEdit ? { username: values.username, email: values.email, role: values.role } : values;
      await onSubmit(payload);
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEdit ? "Modifier l'utilisateur" : 'Créer un utilisateur'}
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

          <FormTextField label="Nom d'utilisateur" registration={register('username')} error={errors.username} autoFocus />
          <FormTextField label="E-mail" registration={register('email')} error={errors.email} />
          {!isEdit && (
            <FormTextField
              label="Mot de passe"
              type="password"
              registration={register('password')}
              error={errors.password}
            />
          )}

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormTextField label="Rôle" select registration={field} error={errors.role}>
                <MenuItem value="student">Élève</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
              </FormTextField>
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

export default UserFormDialog;
