import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';
import { getToken, setToken, clearToken } from '../api/tokenStorage';
import { setUnauthorizedHandler } from '../api/axiosInstance';

const AuthContext = createContext(null);

// Cible de redirection post-authentification selon le rôle (§5.3).
// eslint-disable-next-line react-refresh/only-export-components
export function dashboardPathForRole(role) {
  return role === 'admin' ? '/admin/overview' : '/app/overview';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de session au démarrage : si un token est présent, on tente
  // GET /api/auth/me pour réhydrater l'utilisateur (évite la déconnexion au F5).
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const restored = await authApi.me();
        if (!cancelled) setUser(restored);
      } catch {
        // Token invalide/expiré : l'intercepteur a déjà purgé le token.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Réaction à un 401 renvoyé par n'importe quel appel API : déconnexion locale.
  // ProtectedRoute redirigera automatiquement vers /connexion quand user devient null.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedUser } = await authApi.login(credentials);
    setToken(token);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: newUser } = await authApi.register(data);
    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearToken();
    setUser(null);
  }, []);

  // Fusionne des champs modifiés (profil, avatar) dans l'utilisateur courant,
  // pour que la sidebar/barre supérieure reflètent le changement sans
  // attendre un rechargement (tâche 3.4).
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>.');
  }
  return ctx;
}
