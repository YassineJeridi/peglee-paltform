import { Box, Button, Container, Paper, Stack, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { BACKGROUND_IMAGES } from '../../constants/backgroundImages';
import { iconRingKnot } from '../../assets/icons';
import Reveal from '../Reveal';

// Pied de page public : bandeau CTA final en verre + rappel de marque et copyright.
export default function Footer() {
  const year = new Date().getFullYear();
  const theme = useTheme();
  const bgImage = BACKGROUND_IMAGES.cta[theme.palette.mode];

  return (
    <Box component="footer" sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Reveal>
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 4,
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
                opacity: theme.palette.mode === 'dark' ? 0.14 : 0.16,
              }}
            />
            <Box
              component="img"
              src={iconRingKnot}
              alt=""
              aria-hidden
              sx={{
                position: 'absolute',
                display: { xs: 'none', sm: 'block' },
                width: 110,
                top: '10%',
                right: '6%',
                opacity: 0.8,
                animation: 'liquidFloat 8.5s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                Prêt à booster ta moyenne en informatique ?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 480, mx: 'auto' }}>
                Rejoins la plateforme gratuitement et commence dès aujourd'hui ta préparation au Bac.
              </Typography>
              <Button
                component={RouterLink}
                to="/inscription"
                variant="contained"
                disableElevation
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 3.5, px: 4 }}
              >
                Créer mon compte gratuitement
              </Button>
            </Box>
          </Paper>
        </Reveal>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mt: 6 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SchoolRoundedIcon sx={{ color: 'primary.light' }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Bac Informatique
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            © {year} Bac Informatique — Projet pédagogique.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
