import { Box, Container, Paper, Typography, Stack, alpha, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { BACKGROUND_IMAGES } from '../../constants/backgroundImages';

// Conteneur visuel partagé par les pages Connexion / Inscription :
// carte centrée, coins arrondis, logo + titre (charte §12), sur fond photo
// "liquid glass" adapté au mode.
function AuthCard({ title, subtitle, children, footer }) {
  const theme = useTheme();
  const bgImage = BACKGROUND_IMAGES.auth[theme.palette.mode];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
        py: 6,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: theme.palette.mode === 'dark' ? 0.4 : 0.4,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: (t) =>
            `radial-gradient(ellipse 700px 600px at 50% 50%, transparent 0%, ${alpha(t.palette.background.default, 0.55)} 60%, ${t.palette.background.default} 100%)`,
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Retour à l'accueil"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'primary.main',
            }}
          >
            <SchoolRoundedIcon fontSize="large" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Bac Informatique
            </Typography>
          </Box>
        </Stack>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>

        {footer && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            {footer}
          </Typography>
        )}
      </Container>
    </Box>
  );
}

export default AuthCard;
