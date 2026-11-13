import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link } from '@mui/material';

import AuthCard from '../../components/auth/AuthCard';
import FormTextField from '../../components/form/FormTextField';
import { forgotPasswordSchema } from '../../validation/authSchemas';
import { forgotPassword } from '../../api/authApi';
import { extractServerErrors } from '../../api/handleApiError';

export default function ForgotPassword() {
  const [done, setDone] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    setGlobalError(null);
    try {
      await forgotPassword(email);
      setDone(true);
    } catch (err) {
      setGlobalError(extractServerErrors(err));
    }
  };

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Saisissez votre e-mail : nous vous enverrons un lien de réinitialisation."
      footer={
        <Link component={RouterLink} to="/connexion" underline="hover">
          Retour à la connexion
        </Link>
      }
    >
      {done ? (
        <Alert severity="success">
          Si un compte existe avec cette adresse, un e-mail a été envoyé. Le lien est valable 1 heure.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {globalError && (
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}
          <FormTextField
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            autoFocus
            registration={register('email')}
            error={errors.email}
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
            {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
          </Button>
        </Box>
      )}
    </AuthCard>
  );
}
