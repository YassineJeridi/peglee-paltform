import { TextField } from '@mui/material';

// Champ de formulaire réutilisable, branché sur react-hook-form.
// `register` fournit les props (name/onChange/onBlur/ref) ; `error` est l'entrée
// correspondante de formState.errors — son message est affiché sous le champ.
function FormTextField({ registration, error, ...props }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      margin="normal"
      error={Boolean(error)}
      helperText={error?.message || ' '}
      {...registration}
      {...props}
    />
  );
}

export default FormTextField;
