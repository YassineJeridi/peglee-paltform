import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useAuth } from '../context/AuthContext';

// Un item est actif si l'URL courante correspond exactement à sa route,
// ou en est une sous-route (ex. /app/cours/:id garde « Cours » actif).
function isItemActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

// Contenu du panneau latéral, réutilisé tel quel dans le Drawer permanent
// (desktop) et le Drawer temporaire (mobile).
function Sidebar({ items, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (to) => {
    navigate(to);
    if (onNavigate) onNavigate(); // ferme le drawer mobile après navigation
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, gap: 1 }}>
        <SchoolRoundedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Bac Informatique
        </Typography>
      </Toolbar>

      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {items.map((item) => {
          const active = isItemActive(location.pathname, item.to);
          return (
            <ListItemButton
              key={item.to}
              selected={active}
              onClick={() => handleClick(item.to)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                // Dégradé volontairement opaque (pas un simple tint à faible alpha) :
                // le texte reste blanc quel que soit le mode, donc le fond composite
                // doit rester assez sombre même en mode clair (fond de tiroir clair
                // derrière) pour garder le contraste — cf. bug Footer.jsx (résumé
                // de session précédent) pour le même piège.
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(123, 44, 191, 0.92), rgba(58, 12, 163, 0.85))',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 20px rgba(123, 44, 191, 0.35)',
                  '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                  '&:hover': { background: 'linear-gradient(135deg, rgba(123, 44, 191, 1), rgba(58, 12, 163, 0.95))' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { fontWeight: active ? 600 : 500 } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {user && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}
        >
          <Avatar src={user.profilePicture || undefined} sx={{ width: 36, height: 36 }}>
            {user.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.role === 'admin' ? 'Administrateur' : 'Élève'}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

export default Sidebar;
