import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, dashboardPathForRole } from '../context/AuthContext';

// Garde de rôle : n'autorise que les rôles listés. Si le rôle ne correspond pas,
// on renvoie l'utilisateur vers SON propre dashboard plutôt qu'une page d'erreur
// générique (évite de « perdre » l'utilisateur — cf. tâche 1.3).
export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // Cas normalement déjà traité par ProtectedRoute en amont ; ceinture + bretelles.
    return <Navigate to="/connexion" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
