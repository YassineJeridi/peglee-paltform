import { Box, Paper, Typography } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

// Placeholder de page pour les routes du sitemap pas encore implémentées.
// Remplacé au fil des phases suivantes par la vraie page.
function PagePlaceholder({ title, phase }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        p: { xs: 4, sm: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'text.disabled' }}>
        <ConstructionRoundedIcon sx={{ fontSize: 48 }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Cette page sera construite {phase ? `en ${phase}` : 'dans une phase ultérieure'}.
      </Typography>
    </Paper>
  );
}

export default PagePlaceholder;
