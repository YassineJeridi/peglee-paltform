import { Box, Button, Chip, Container, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BACKGROUND_IMAGES } from '../../constants/backgroundImages';
import { iconSparkles } from '../../assets/icons';
import heroCube from '../../assets/hero.png';
import Reveal from '../Reveal';

const TRUST_ITEMS = ['100 % gratuit', 'Programme officiel', 'Sans carte bancaire'];

// Halo ambiant décoratif complémentaire à la photo de fond (§5 du design
// system) — un dégradé radial flouté et animé (liquidFloat/ambientGlowPulse,
// index.css) renforce la teinte de marque sur les bords de l'image.
function GlowBlob({ sx }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        animation: 'liquidFloat 9s ease-in-out infinite, ambientGlowPulse 7s ease-in-out infinite',
        ...sx,
      }}
    />
  );
}

// Section d'accroche : proposition de valeur + CTA principal vers l'inscription.
export default function Hero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bgImage = BACKGROUND_IMAGES.hero[theme.palette.mode];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderBottom: 1, borderColor: 'divider' }}>
      {/* Rendu "liquid glass" fourni par le client, adapté au mode. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isDark ? 0.5 : 0.45,
        }}
      />
      {/* Voile en dégradé : garde le texte lisible par-dessus la photo sans la masquer complètement. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.background.default, 0.3)} 0%, ${alpha(t.palette.background.default, 0.7)} 55%, ${t.palette.background.default} 100%)`,
        }}
      />

      <GlowBlob
        sx={{
          width: 420,
          height: 420,
          top: -100,
          left: '8%',
          background: `radial-gradient(circle, ${isDark ? '#9D4EDD' : '#C8B6FF'} 0%, transparent 70%)`,
          opacity: isDark ? 0.6 : 0.5,
        }}
      />

      {/* Petit rendu 3D décoratif (cube filaire) flottant près du titre. */}
      <Box
        component="img"
        src={heroCube}
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          display: { xs: 'none', sm: 'block' },
          width: { sm: 90, md: 120 },
          top: { sm: 28, md: 44 },
          right: { sm: '6%', md: '12%' },
          opacity: isDark ? 0.55 : 0.35,
          animation: 'liquidFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <Box
        component="img"
        src={iconSparkles}
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          display: { xs: 'none', md: 'block' },
          width: 64,
          bottom: '18%',
          left: '6%',
          opacity: isDark ? 0.7 : 0.55,
          animation: 'liquidFloat 7s ease-in-out infinite',
          animationDelay: '-2s',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Reveal sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            icon={<VerifiedRoundedIcon sx={{ fontSize: 16 }} />}
            label="Nouveau — Préparation Bac 2026"
            size="small"
            sx={{
              mb: 3,
              fontWeight: 600,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
              border: 1,
              borderColor: (t) => alpha(t.palette.secondary.main, 0.35),
              color: 'secondary.main',
              '& .MuiChip-icon': { color: 'secondary.main' },
            }}
          />
        </Reveal>

        <Reveal delay={80}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
            Spécial Bac — Section Informatique
          </Typography>
          <Typography
            variant="h1"
            className="text-iridescent"
            sx={{ mt: 1, fontSize: { xs: '2.25rem', sm: '3rem', md: '4rem' }, lineHeight: 1.1 }}
          >
            Révise l'informatique du Bac, leçon par leçon
          </Typography>
        </Reveal>

        <Reveal delay={160}>
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 400, maxWidth: 620, mx: 'auto', color: 'text.secondary' }}>
            Cours structurés, quiz interactifs et exercices corrigés en algorithmique. Progresse à ton
            rythme et débloque chaque étape en validant tes acquis.
          </Typography>
        </Reveal>

        <Reveal delay={240}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mt: 5 }}>
            <Button
              component={RouterLink}
              to="/inscription"
              size="large"
              variant="contained"
              disableElevation
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Commencer gratuitement
            </Button>
            <Button component={RouterLink} to="/connexion" size="large" variant="outlined" sx={{ px: 4, py: 1.5 }}>
              J'ai déjà un compte
            </Button>
          </Stack>
        </Reveal>

        <Reveal delay={320}>
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 3.5 }}
            sx={{ justifyContent: 'center', mt: 4, flexWrap: 'wrap', rowGap: 1 }}
          >
            {TRUST_ITEMS.map((item) => (
              <Stack key={item} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Reveal>
      </Container>
    </Box>
  );
}
