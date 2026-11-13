import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link } from '@mui/material';

import AuthCard from '../../components/auth/AuthCard';
import FormTextField from '../../components/form/FormTextField';
import { resetPasswordSchema } from '../../validation/authSchemas';
import { resetPassword } from '../../api/authApi';
import { extractServerErrors } from '../../api/handleApiError';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = async (values) => {
    setGlobalError(null);
    try {
      await resetPassword({ token, ...values });
      navigate('/connexion', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setGlobalError(extractServerErrors(err));
    }
  };

  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe d'au moins 8 caractères."
      footer={
        <Link component={RouterLink} to="/connexion" underline="hover">
          Retour à la connexion
        </Link>
      }
    >
      {!token ? (
        <Alert severity="error">
          Lien invalide.{' '}
          <Link component={RouterLink} to="/mot-de-passe-oublie">
            Faire une nouvelle demande
          </Link>
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {globalError && (
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}
          <FormTextField
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            autoFocus
            registration={register('newPassword')}
            error={errors.newPassword}
          />
          <FormTextField
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            registration={register('confirmNewPassword')}
            error={errors.confirmNewPassword}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ mt: 1 }}
          >
            {isSubmitting ? 'Enregistrement…' : 'Réinitialiser'}
          </Button>
        </Box>
      )}
    </AuthCard>
  );
}
