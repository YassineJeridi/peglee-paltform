import { Box } from '@mui/material';
import PublicNavbar from '../../components/public/PublicNavbar';
import Hero from '../../components/public/Hero';
import TrustSection from '../../components/public/TrustSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import ModulesSection from '../../components/public/ModulesSection';
import HowItWorksSection from '../../components/public/HowItWorksSection';
import FaqSection from '../../components/public/FaqSection';
import Footer from '../../components/public/Footer';

// Page d'accueil publique (§5.1, tâche 1.5). Vitrine statique : aucune donnée
// protégée n'est chargée ici. Les visiteurs connectés sont redirigés en amont
// par PublicRoute vers leur dashboard.
export default function Landing() {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <PublicNavbar />
      <Hero />
      <TrustSection />
      <FeaturesSection />
      <ModulesSection />
      <HowItWorksSection />
      <FaqSection />
      <Footer />
    </Box>
  );
}
