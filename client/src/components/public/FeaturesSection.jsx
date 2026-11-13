import { Box, Container, Paper, Typography } from '@mui/material';
import { iconBrain, iconQuestionMark, iconGear, iconAtom, iconChatGlass, iconStarChrome } from '../../assets/icons';
import Reveal from '../Reveal';

const FEATURES = [
  {
    icon: iconBrain,
    title: 'Cours structurés',
    text: 'Des leçons claires organisées en modules et sous-modules, fidèles au programme officiel.',
  },
  {
    icon: iconQuestionMark,
    title: 'Quiz interactifs',
    text: 'Valide chaque leçon avec un quiz. Il faut 60 % pour débloquer les exercices.',
  },
  {
    icon: iconGear,
    title: 'Exercices corrigés',
    text: "Des exercices d'algorithmique avec correction pour t'entraîner en conditions réelles.",
  },
  {
    icon: iconAtom,
    title: 'Suivi de progression',
    text: 'Visualise ton avancement module par module et reprends là où tu t\'es arrêté.',
  },
  {
    icon: iconChatGlass,
    title: 'Kanban & Notes',
    text: 'Organise tes révisions avec un tableau Kanban et prends des notes personnelles.',
  },
  {
    icon: iconStarChrome,
    title: 'Gamification',
    text: "Gagne de l'XP et monte de niveau au fil de tes réussites pour rester motivé.",
  },
];

// Section « Fonctionnalités » (ancre #fonctionnalites).
export default function FeaturesSection() {
  return (
    <Box id="fonctionnalites" component="section" sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: '72px' }}>
      <Container maxWidth="lg">
        <Reveal sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Tout ce qu'il faut pour réussir
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
            Une méthode complète, du cours à l'exercice, pensée pour le Bac Informatique.
          </Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          }}
        >
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(10, 8, 20, 0.18)'),
                    boxShadow: '0 30px 60px rgba(157, 78, 221, 0.25)',
                    '& .feature-icon': { transform: 'scale(1.1) rotate(-4deg)' },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    background: (t) =>
                      t.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.18), rgba(76, 201, 240, 0.12))'
                        : 'linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(76, 201, 240, 0.08))',
                  }}
                >
                  <Box
                    component="img"
                    src={f.icon}
                    alt=""
                    aria-hidden
                    className="feature-icon"
                    sx={{ width: 42, height: 42, objectFit: 'contain', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.text}
                </Typography>
              </Paper>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
