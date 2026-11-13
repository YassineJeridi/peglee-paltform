import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner({ minHeight = 200, size = 40, label, fullScreen = false }) {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? '100vh' : minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={size} color="primary" />
      {label && <span>{label}</span>}
    </Box>
  );
}

export default LoadingSpinner;
