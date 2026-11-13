import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, dashboardPathForRole } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Pages publiques (landing, connexion, inscription) : un utilisateur déjà
// connecté est renvoyé vers son dashboard (§5.1). On attend la fin de la
// vérification initiale pour éviter tout clignotement.
export default function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Chargement…" fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
