import { Box, Typography } from '@mui/material';

function Placeholder({ label }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Page en cours de construction (Phase 1).
      </Typography>
    </Box>
  );
}

export default Placeholder;
