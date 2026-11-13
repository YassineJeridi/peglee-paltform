import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Garde d'authentification : bloque l'accès aux sous-arbres protégés tant que
// l'utilisateur n'est pas connecté. Rappel sécurité : ceci n'est qu'un confort
// UX — chaque endpoint sensible reste protégé côté serveur (tâche 1.1).
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // On attend la fin de la vérification initiale pour éviter un flash de
  // redirection prématurée (cf. tâche 1.3, cas limites).
  if (isLoading) {
    return <LoadingSpinner label="Chargement de votre session…" fullScreen />;
  }

  if (!isAuthenticated) {
    // On mémorise la page demandée pour un éventuel retour après connexion.
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
