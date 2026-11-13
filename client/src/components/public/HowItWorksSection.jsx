import { Box, Container, Typography } from '@mui/material';
import Reveal from '../Reveal';

const STEPS = [
  { n: 1, title: 'Crée ton compte', text: 'Inscris-toi gratuitement en quelques secondes, sans carte bancaire.' },
  { n: 2, title: 'Suis les leçons', text: 'Avance module par module avec des cours clairs et progressifs.' },
  { n: 3, title: 'Valide les quiz', text: 'Obtiens au moins 60 % pour débloquer les exercices du sous-module.' },
  { n: 4, title: "Entraîne-toi", text: "Résous les exercices corrigés et gagne de l'XP à chaque réussite." },
];

// Section « Comment ça marche » (ancre #comment-ca-marche).
export default function HowItWorksSection() {
  return (
    <Box id="comment-ca-marche" component="section" sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: '72px' }}>
      <Container maxWidth="lg">
        <Reveal sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Comment ça marche
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
            Un parcours en quatre étapes, du premier cours à la maîtrise.
          </Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          }}
        >
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} sx={{ textAlign: 'center', px: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9D4EDD, #4CC9F0)',
                  color: '#fff',
                  boxShadow: '0 10px 24px rgba(157, 78, 221, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 22,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {s.n}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {s.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.text}
              </Typography>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
