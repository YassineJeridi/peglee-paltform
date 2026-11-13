import { Box, Paper, Typography } from '@mui/material';

// `${color}1A` (alpha suffix) n'est valide que sur un hex — jamais un token
// de thème type "primary.main" (même piège que ModuleCard, tâche 2.6).
function KpiCard({ icon: Icon, label, value, sublabel, color = '#9D4EDD' }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}1A`,
          color,
        }}
      >
        <Icon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" color="text.secondary">
            {sublabel}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default KpiCard;
