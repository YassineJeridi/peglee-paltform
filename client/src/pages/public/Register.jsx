import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Collapse, CircularProgress } from '@mui/material';

import AuthCard from '../../components/auth/AuthCard';
import FormTextField from '../../components/form/FormTextField';
import { registerSchema } from '../../validation/authSchemas';
import { useAuth, dashboardPathForRole } from '../../context/AuthContext';
import { extractServerErrors } from '../../api/handleApiError';

const KNOWN_FIELDS = ['username', 'email', 'password', 'confirmPassword'];

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setGlobalError(null);
    try {
      const user = await registerUser(values);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  };

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Rejoignez la plateforme et commencez à réviser dès aujourd'hui."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link component={RouterLink} to="/connexion" underline="hover">
            Se connecter
          </Link>
        </>
      }
    >
      <Collapse in={Boolean(globalError)} sx={{ mb: globalError ? 1 : 0 }}>
        <Alert severity="error" onClose={() => setGlobalError(null)}>
          {globalError}
        </Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          label="Nom d'utilisateur"
          autoComplete="username"
          autoFocus
          registration={register('username')}
          error={errors.username}
        />
        <FormTextField
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email}
        />
        <FormTextField
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password}
        />
        <FormTextField
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Création…' : 'S\'inscrire'}
        </Button>
      </Box>
    </AuthCard>
  );
}
