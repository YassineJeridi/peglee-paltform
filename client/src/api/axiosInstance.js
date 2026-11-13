import axios from 'axios';
import { getToken, clearToken } from './tokenStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api'),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Intercepteur de requête : ajoute le JWT (stratégie Bearer) à chaque appel.
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// L'AuthContext enregistre ici un gestionnaire pour réagir à une session expirée
// (mise à null de l'utilisateur + redirection). On garde l'intercepteur découplé
// de React pour éviter les imports circulaires.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Un 401 sur login/register est une erreur d'identifiants attendue, pas une
// session expirée : on ne déclenche pas la déconnexion globale dans ce cas.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

// Intercepteur de réponse : tout 401 (hors login/register) => déconnexion locale propre.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isAuthAttempt = AUTH_ENDPOINTS.some((e) => url.includes(e));
    if (status === 401 && !isAuthAttempt) {
      clearToken();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
