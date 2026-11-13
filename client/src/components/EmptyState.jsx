import { Box, Typography } from '@mui/material';

function EmptyState({ icon, title, description, action, minHeight = 240 }) {
  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        px: 3,
        py: 4,
      }}
    >
      {icon && (
        <Box sx={{ fontSize: 48, lineHeight: 1, color: 'text.secondary', mb: 1 }}>{icon}</Box>
      )}
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}

export default EmptyState;
