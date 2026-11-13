import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth, dashboardPathForRole } from '../context/AuthContext';

// Menu déroulant du profil, présent dans la barre supérieure de toutes les
// pages connectées (§4). 3 actions : tableau de bord, profil, déconnexion.
function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const goDashboard = () => {
    close();
    navigate(dashboardPathForRole(user.role));
  };

  const goProfile = () => {
    close();
    // Côté admin, la gestion du profil se fait via les paramètres (§7.7).
    navigate(user.role === 'admin' ? '/admin/parametres' : '/app/profil');
  };

  const handleLogout = async () => {
    close();
    await logout();
    navigate('/connexion', { replace: true });
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" aria-label="Menu du profil">
        <Avatar src={user?.profilePicture || undefined} sx={{ width: 36, height: 36 }}>
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={goDashboard}>
          <ListItemIcon>
            <DashboardRoundedIcon fontSize="small" />
          </ListItemIcon>
          Mon tableau de bord
        </MenuItem>
        <MenuItem onClick={goProfile}>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          Mon profil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Se déconnecter
        </MenuItem>
      </Menu>
    </>
  );
}

export default ProfileMenu;
