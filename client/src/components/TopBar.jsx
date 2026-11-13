import {
  AppBar,
  Box,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';
import ThemeModeToggle from './ThemeModeToggle';

// Barre supérieure commune (§6) : bouton menu (mobile), titre de page,
// recherche (visuelle en Phase 1), cloche de notifications, menu profil.
// Pas de bgcolor ici : on laisse l'override MuiAppBar (theme/index.js) faire
// son travail de verre translucide flouté plutôt que de le neutraliser avec
// un fond opaque "background.paper".
function TopBar({ title, onMenuClick }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          sx={{ display: { md: 'none' } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 600, flexShrink: 0 }}>
          {title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Recherche visuelle (branchement transverse reporté, tâche 1.4) */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
            width: 220,
          }}
        >
          <SearchRoundedIcon fontSize="small" color="disabled" />
          <InputBase placeholder="Rechercher…" sx={{ fontSize: 14, flex: 1 }} inputProps={{ 'aria-label': 'Rechercher' }} />
        </Box>

        <ThemeModeToggle />

        <NotificationBell />

        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
