import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer, useTheme } from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import LoadingSpinner from '../components/LoadingSpinner';
import LevelUpToast from '../components/LevelUpToast';
import { BACKGROUND_IMAGES } from '../constants/backgroundImages';
import { LevelUpProvider } from '../context/LevelUpContext';

const DRAWER_WIDTH = 260;

// Titre de la page dérivé de l'URL : on prend l'item de nav dont la route est
// le plus long préfixe de l'URL courante.
function deriveTitle(items, pathname) {
  const match = items
    .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match ? match.label : '';
}

// Layout partagé des espaces connectés : sidebar (Drawer permanent desktop +
// temporaire mobile) + barre supérieure + zone de contenu (<Outlet />).
function DashboardLayout({ items }) {
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = deriveTitle(items, location.pathname);
  const bgImage = BACKGROUND_IMAGES.shell[theme.palette.mode];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Accent ambiant fixe, très discret : le rendu "liquid glass" apparaît
          dans un coin derrière les panneaux de verre (sidebar/topbar/cartes),
          sans jamais gêner la lecture du contenu. */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'right top' },
          opacity: theme.palette.mode === 'dark' ? 0.16 : 0.14,
        }}
      />

      {/* Drawer permanent (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider' },
        }}
        open
      >
        <Sidebar items={items} />
      </Drawer>

      {/* Drawer temporaire (mobile / tablette) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Sidebar items={items} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Colonne principale */}
      <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          {/* Certaines pages (notamment admin) sont chargées à la demande
              via React.lazy — ce Suspense est un no-op pour les pages
              importées normalement. LevelUpProvider est monté ici (pas plus
              haut) : seules les pages élève déclenchent notifyLevelUp, et ça
              couvre aussi bien le shell élève qu'admin sans coût côté admin. */}
          <LevelUpProvider>
            <Suspense fallback={<LoadingSpinner label="Chargement…" minHeight={300} />}>
              <Outlet />
            </Suspense>
            <LevelUpToast />
          </LevelUpProvider>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
