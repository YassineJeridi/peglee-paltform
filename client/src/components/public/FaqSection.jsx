import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { iconQuestionMark } from '../../assets/icons';
import Reveal from '../Reveal';

const FAQS = [
  {
    q: 'Est-ce vraiment gratuit ?',
    a: "Oui. La création de compte et l'accès à l'ensemble des cours, quiz et exercices sont gratuits, sans carte bancaire requise.",
  },
  {
    q: 'Le contenu suit-il le programme officiel ?',
    a: "Oui, les modules (Algorithmique, Programmation, Structures de données, Bases de données, Réseaux & Web...) suivent le programme officiel de la section Informatique du Bac.",
  },
  {
    q: 'Comment fonctionne le déverrouillage des exercices ?',
    a: "Chaque sous-module suit le même parcours : la leçon débloque le quiz, et il faut obtenir au moins 60 % au quiz pour débloquer les exercices corrigés correspondants.",
  },
  {
    q: "Puis-je utiliser la plateforme sur mobile ?",
    a: "Oui, l'interface s'adapte au mobile et à la tablette. L'expérience reste toutefois la plus confortable sur ordinateur, notamment pour l'éditeur de code.",
  },
  {
    q: "Qu'est-ce que le système de niveaux ?",
    a: "Chaque leçon terminée, quiz réussi et exercice résolu rapporte de l'XP. Accumuler de l'XP fait monter ton niveau, une façon ludique de visualiser ta progression.",
  },
];

// Section FAQ — renforce la crédibilité perçue en répondant directement aux
// objections/questions les plus probables d'un visiteur, sans avis fabriqués.
export default function FaqSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="md">
        <Reveal sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            component="img"
            src={iconQuestionMark}
            alt=""
            aria-hidden
            sx={{ width: 56, height: 56, objectFit: 'contain', mb: 1.5 }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Questions fréquentes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            Tout ce qu'il faut savoir avant de commencer.
          </Typography>
        </Reveal>

        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 60}>
            <Accordion
              elevation={0}
              disableGutters
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1.5,
                overflow: 'hidden',
                '&::before': { display: 'none' },
                '&.Mui-expanded': { margin: '0 0 12px 0' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Reveal>
        ))}
      </Container>
    </Box>
  );
}
