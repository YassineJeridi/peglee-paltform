import { Box, Typography } from '@mui/material';
import ProfileSettings from '../../components/ProfileSettings';

export default function Profil() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Profil
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gérez vos informations personnelles et votre sécurité.
      </Typography>

      <ProfileSettings />
    </Box>
  );
}
