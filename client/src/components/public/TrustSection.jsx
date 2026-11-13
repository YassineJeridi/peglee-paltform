import { Box, Container, Stack, Typography } from '@mui/material';
import { iconAtom, iconGear, iconStarChrome, iconChatGlass } from '../../assets/icons';
import Reveal from '../Reveal';

// Bandeau de crédibilité juste après le Hero. Volontairement basé sur des
// capacités réelles de la plateforme plutôt que des chiffres d'usage
// fabriqués (nombre d'élèves, avis...) — la plateforme n'a pas encore
// d'utilisateurs réels à citer, mieux vaut une preuve honnête (ce qu'elle
// fait vraiment) qu'une fausse preuve sociale.
const HIGHLIGHTS = [
  { icon: iconAtom, stat: '100 %', label: 'Programme officiel du Bac Informatique' },
  { icon: iconGear, stat: '3 étapes', label: 'Leçon → Quiz → Exercices, débloquées à ton rythme' },
  { icon: iconStarChrome, stat: 'Gamifié', label: "Système de niveaux et d'XP à chaque réussite" },
  { icon: iconChatGlass, stat: 'Tout-en-un', label: 'Kanban, notes et calendrier de révision intégrés' },
];

export default function TrustSection() {
  return (
    <Box component="section" sx={{ py: { xs: 5, md: 6 }, borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 2 },
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          }}
        >
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.label} delay={i * 90}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  component="img"
                  src={h.icon}
                  alt=""
                  aria-hidden
                  sx={{ width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, flexShrink: 0, objectFit: 'contain' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {h.stat}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>
                    {h.label}
                  </Typography>
                </Box>
              </Stack>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
