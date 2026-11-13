import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

// Pas de système d'e-mail en V1 (§2.3) : le mot de passe temporaire n'est
// affiché qu'une seule fois ici, à charge de l'admin de le transmettre
// manuellement à l'élève.
function ResetPasswordResultDialog({ result, onClose }) {
  return (
    <Dialog open={Boolean(result)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Mot de passe réinitialisé</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Nouveau mot de passe temporaire pour <strong>{result?.username}</strong> — transmettez-le manuellement à
          l'élève, il ne sera plus affiché ensuite.
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '1rem',
            textAlign: 'center',
            userSelect: 'all',
          }}
        >
          {result?.temporaryPassword}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ResetPasswordResultDialog;
