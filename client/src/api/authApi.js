import axiosInstance from './axiosInstance';

// Service d'authentification : chaque fonction renvoie directement les données
// utiles (data) ; la gestion des erreurs est laissée aux appelants (AuthContext,
// pages) qui savent comment les présenter à l'utilisateur.

export async function register({ username, email, password, confirmPassword }) {
  const { data } = await axiosInstance.post('/auth/register', {
    username,
    email,
    password,
    confirmPassword,
  });
  return data; // { token, user }
}

export async function login({ email, password }) {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  return data; // { token, user }
}

export async function logout() {
  try {
    await axiosInstance.post('/auth/logout');
  } catch {
    // La déconnexion est stateless côté serveur : même en cas d'échec réseau,
    // on considère la déconnexion locale comme réussie.
  }
}

export async function me() {
  const { data } = await axiosInstance.get('/auth/me');
  return data; // user
}

export async function forgotPassword(email) {
  const { data } = await axiosInstance.post('/auth/forgot-password', { email });
  return data; // { message }
}

export async function resetPassword({ token, newPassword, confirmNewPassword }) {
  const { data } = await axiosInstance.post('/auth/reset-password', {
    token,
    newPassword,
    confirmNewPassword,
  });
  return data; // { message }
}
