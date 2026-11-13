import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Avatar, Box, Button, Collapse, Paper, Snackbar, Stack, Typography } from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, uploadAvatar } from '../api/profileApi';
import { profileSchema, passwordSchema } from '../validation/profileSchemas';
import FormTextField from './form/FormTextField';
import { extractServerErrors } from '../api/handleApiError';

const PROFILE_KNOWN_FIELDS = ['username', 'email'];
const PASSWORD_KNOWN_FIELDS = ['currentPassword', 'newPassword', 'confirmNewPassword'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Section « avatar + informations + mot de passe » du profil de l'utilisateur
// connecté — partagée entre /app/profil (tâche 3.4) et /admin/parametres
// (tâche 4.8, « Mon profil »), le rôle n'y change rien : c'est toujours le
// profil de req.user via les mêmes endpoints /api/users/me*.
function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  // Aperçu avant envoi (§6.6) via un object URL local — à révoquer dès qu'il
  // n'est plus affiché pour ne pas fuir de mémoire.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const [profileGlobalError, setProfileGlobalError] = useState(null);
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setError: setProfileError,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user.username, email: user.email },
  });

  const [passwordGlobalError, setPasswordGlobalError] = useState(null);
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    setError: setPasswordError,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de resélectionner le même fichier plus tard
    if (!file) return;

    setAvatarError('');
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Seuls les fichiers JPG, PNG et WEBP sont acceptés.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Le fichier dépasse la taille maximale autorisée (5 Mo).');
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const { profilePicture } = await uploadAvatar(avatarFile);
      updateUser({ profilePicture });
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSnackbar('Photo de profil mise à jour.');
    } catch (err) {
      setAvatarError(err?.response?.data?.message || 'Impossible de mettre à jour la photo pour le moment.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onProfileSubmit(values) {
    setProfileGlobalError(null);
    try {
      const updated = await updateProfile(values);
      updateUser({ username: updated.username, email: updated.email });
      setSnackbar('Profil mis à jour.');
    } catch (err) {
      setProfileGlobalError(extractServerErrors(err, { setError: setProfileError, knownFields: PROFILE_KNOWN_FIELDS }));
    }
  }

  async function onPasswordSubmit(values) {
    setPasswordGlobalError(null);
    try {
      await changePassword(values);
      resetPasswordForm();
      setSnackbar('Mot de passe modifié.');
    } catch (err) {
      setPasswordGlobalError(
        extractServerErrors(err, { setError: setPasswordError, knownFields: PASSWORD_KNOWN_FIELDS })
      );
    }
  }

  return (
    <Box>
      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Photo de profil
          </Typography>
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            <Avatar src={avatarPreview || user.profilePicture || undefined} sx={{ width: 72, height: 72 }}>
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCameraRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choisir une photo
                </Button>
                {avatarFile && (
                  <Button variant="contained" size="small" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                    {uploadingAvatar ? 'Envoi…' : 'Enregistrer'}
                  </Button>
                )}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleFileChange}
              />
              {avatarError && (
                <Typography variant="caption" color="error">
                  {avatarError}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Informations
          </Typography>
          <Collapse in={Boolean(profileGlobalError)} sx={{ mb: profileGlobalError ? 1 : 0 }}>
            <Alert severity="error" onClose={() => setProfileGlobalError(null)}>
              {profileGlobalError}
            </Alert>
          </Collapse>
          <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
            <FormTextField
              label="Nom d'utilisateur"
              registration={registerProfile('username')}
              error={profileErrors.username}
            />
            <FormTextField label="E-mail" registration={registerProfile('email')} error={profileErrors.email} />
            <Button type="submit" variant="contained" disabled={isProfileSubmitting} sx={{ mt: 1 }}>
              Enregistrer
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Mot de passe
          </Typography>
          <Collapse in={Boolean(passwordGlobalError)} sx={{ mb: passwordGlobalError ? 1 : 0 }}>
            <Alert severity="error" onClose={() => setPasswordGlobalError(null)}>
              {passwordGlobalError}
            </Alert>
          </Collapse>
          <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
            <FormTextField
              label="Mot de passe actuel"
              type="password"
              registration={registerPassword('currentPassword')}
              error={passwordErrors.currentPassword}
            />
            <FormTextField
              label="Nouveau mot de passe"
              type="password"
              registration={registerPassword('newPassword')}
              error={passwordErrors.newPassword}
            />
            <FormTextField
              label="Confirmer le nouveau mot de passe"
              type="password"
              registration={registerPassword('confirmNewPassword')}
              error={passwordErrors.confirmNewPassword}
            />
            <Button type="submit" variant="contained" disabled={isPasswordSubmitting} sx={{ mt: 1 }}>
              Modifier le mot de passe
            </Button>
          </Box>
        </Paper>
      </Stack>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}

export default ProfileSettings;
