import { Box, Button, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ThemeModeToggle from '../ThemeModeToggle';

// Liens d'ancre vers les sections de la landing (défilement doux).
const SECTIONS = [
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'modules', label: 'Modules' },
  { id: 'comment-ca-marche', label: 'Comment ça marche' },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Barre de navigation publique : pilule flottante en verre dépoli (§4.3 du
// design system), centrée, détachée du bord supérieur. Responsive : menu
// latéral en mobile.
export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  const handleAnchor = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: { xs: 12, md: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: '94%', md: '90%' },
        maxWidth: 1100,
        borderRadius: 99,
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(10, 8, 20, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: 1,
        borderColor: 'divider',
        boxShadow: (t) => (t.palette.mode === 'dark' ? '0 15px 35px rgba(0, 0, 0, 0.4)' : '0 15px 35px rgba(60, 40, 100, 0.15)'),
        zIndex: 1000,
      }}
    >
      <Toolbar disableGutters sx={{ gap: 2, px: { xs: 1.5, md: 2.5 }, minHeight: { xs: 56, md: 64 } }}>
        {/* Logo → retour en haut */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'text.primary', flexShrink: 0 }}
        >
          <SchoolRoundedIcon sx={{ color: 'primary.light' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
            Bac&nbsp;Informatique
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Ancres (desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {SECTIONS.map((s) => (
            <Button
              key={s.id}
              onClick={() => handleAnchor(s.id)}
              sx={{ fontWeight: 500, color: 'text.secondary', borderRadius: 99, '&:hover': { color: 'text.primary' } }}
            >
              {s.label}
            </Button>
          ))}
        </Box>

        {/* Actions auth (desktop) */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: { md: 2 }, alignItems: 'center' }}>
          <ThemeModeToggle />
          <Button component={RouterLink} to="/connexion" sx={{ color: 'text.secondary' }}>
            Connexion
          </Button>
          <Button component={RouterLink} to="/inscription" variant="contained" disableElevation>
            S'inscrire
          </Button>
        </Box>

        {/* Menu mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <ThemeModeToggle />
          <IconButton edge="end" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {SECTIONS.map((s) => (
              <ListItemButton key={s.id} onClick={() => handleAnchor(s.id)}>
                <ListItemText primary={s.label} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button component={RouterLink} to="/connexion" variant="outlined" fullWidth onClick={() => setOpen(false)}>
              Connexion
            </Button>
            <Button component={RouterLink} to="/inscription" variant="contained" disableElevation fullWidth onClick={() => setOpen(false)}>
              S'inscrire
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
