import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';

const REFRESH_MS = 60 * 1000;

// Cloche de la TopBar : compteur de non-lues + menu des notifications récentes.
// Rafraîchissement périodique simple (pas de temps réel, §2.3).
function NotificationBell() {
  const [data, setData] = useState({ unreadCount: 0, items: [] });
  const [anchor, setAnchor] = useState(null);

  const load = useCallback(() => {
    getNotifications()
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  async function handleRead(n) {
    if (n.read) return;
    await markNotificationRead(n._id).catch(() => {});
    load();
  }

  async function handleReadAll() {
    await markAllNotificationsRead().catch(() => {});
    load();
  }

  return (
    <>
      <IconButton
        aria-label={`Notifications (${data.unreadCount} non lues)`}
        onClick={(e) => {
          setAnchor(e.currentTarget);
          load();
        }}
      >
        <Badge color="error" badgeContent={data.unreadCount} max={9}>
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: { xs: 300, sm: 360 }, maxHeight: 420, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            <Button size="small" onClick={handleReadAll} disabled={data.unreadCount === 0}>
              Tout marquer comme lu
            </Button>
          </Box>
          <Divider />
          {data.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
              Aucune notification pour le moment.
            </Typography>
          ) : (
            <List disablePadding>
              {data.items.map((n) => (
                <ListItem
                  key={n._id}
                  onClick={() => handleRead(n)}
                  sx={{ cursor: n.read ? 'default' : 'pointer', bgcolor: n.read ? 'transparent' : 'action.hover' }}
                >
                  <ListItemText
                    primary={n.message}
                    secondary={new Date(n.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                    slotProps={{ primary: { sx: { fontWeight: n.read ? 400 : 600, fontSize: 14 } } }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default NotificationBell;
