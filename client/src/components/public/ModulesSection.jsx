import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import Reveal from '../Reveal';

// Contenu STATIQUE volontaire : la landing est publique, elle ne doit PAS
// appeler l'endpoint protégé GET /api/modules (§5.1). Ces cartes sont une
// vitrine ; le vrai catalogue vit dans l'espace élève.
const MODULES = [
  {
    title: 'Algorithmique',
    text: 'Variables, structures de contrôle, boucles et tableaux en pseudo-code.',
    tag: 'Fondamental',
  },
  {
    title: 'Programmation',
    text: 'Traduction des algorithmes, sous-programmes (fonctions et procédures).',
    tag: 'Fondamental',
  },
  {
    title: 'Structures de données',
    text: 'Tableaux, chaînes de caractères et enregistrements (T.D.O).',
    tag: 'Cœur du programme',
  },
  {
    title: 'Bases de données',
    text: 'Modèle relationnel, requêtes et manipulation de données.',
    tag: 'Cœur du programme',
  },
  {
    title: 'Réseaux & Web',
    text: 'Notions de réseaux, services et création de pages web.',
    tag: 'Culture numérique',
  },
  {
    title: 'Projets & Révisions',
    text: "Sujets types du Bac et exercices de synthèse pour s'entraîner.",
    tag: 'Préparation Bac',
  },
];

// Section « Modules » (ancre #modules).
export default function ModulesSection() {
  return (
    <Box
      id="modules"
      component="section"
      sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.paper', borderTop: 1, borderBottom: 1, borderColor: 'divider', scrollMarginTop: '72px' }}
    >
      <Container maxWidth="lg">
        <Reveal sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Les modules du programme
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
            Un parcours couvrant l'ensemble des notions attendues à l'examen.
          </Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          }}
        >
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={i * 60}>
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
                    boxShadow: '0 30px 60px rgba(76, 201, 240, 0.2)',
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Chip label={m.tag} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.text}
                  </Typography>
                </Stack>
              </Paper>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
