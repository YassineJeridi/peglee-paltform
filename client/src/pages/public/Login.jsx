import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Collapse, CircularProgress, Stack } from '@mui/material';

import AuthCard from '../../components/auth/AuthCard';
import FormTextField from '../../components/form/FormTextField';
import { loginSchema } from '../../validation/authSchemas';
import { useAuth, dashboardPathForRole } from '../../context/AuthContext';
import { extractServerErrors } from '../../api/handleApiError';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState(null);
  const resetSuccess = Boolean(location.state?.passwordReset);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setGlobalError(null);
    try {
      const user = await login(values);
      // Retour vers la page initialement demandée si elle existe, sinon dashboard.
      const from = location.state?.from?.pathname;
      const target = from && from.startsWith('/') ? from : dashboardPathForRole(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      // On reprend tel quel le message serveur (générique volontairement, tâche 1.1).
      setGlobalError(extractServerErrors(err));
    }
  };

  return (
    <AuthCard
      title="Se connecter"
      subtitle="Content de vous revoir ! Accédez à votre espace de révision."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link component={RouterLink} to="/inscription" underline="hover">
            Créer un compte
          </Link>
        </>
      }
    >
      <Collapse in={Boolean(globalError)} sx={{ mb: globalError ? 1 : 0 }}>
        <Alert severity="error" onClose={() => setGlobalError(null)}>
          {globalError}
        </Alert>
      </Collapse>

      <Collapse in={resetSuccess} sx={{ mb: resetSuccess ? 1 : 0 }}>
        <Alert severity="success">Mot de passe réinitialisé. Vous pouvez vous connecter.</Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          autoFocus
          registration={register('email')}
          error={errors.email}
        />
        <FormTextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password}
        />

        <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1 }}>
          <Link
            component={RouterLink}
            to="/mot-de-passe-oublie"
            variant="body2"
            underline="hover"
          >
            Mot de passe oublié ?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ mt: 1 }}
        >
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </Box>
    </AuthCard>
  );
}
