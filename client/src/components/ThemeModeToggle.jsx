import { IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useThemeMode } from '../context/ThemeModeContext';

// Bascule clair/sombre réutilisée dans PublicNavbar et TopBar — l'état vit
// dans ThemeModeContext (persisté en localStorage) pour rester synchronisé
// partout où ce bouton apparaît.
function ThemeModeToggle({ sx }) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
      <IconButton onClick={toggleMode} aria-label="Changer de thème" sx={sx}>
        {isDark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeModeToggle;
