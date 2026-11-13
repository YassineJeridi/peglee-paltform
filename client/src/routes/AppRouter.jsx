import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Gardes (tâche 1.3)
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts (tâche 1.4)
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages publiques
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

// Pages élève (§4)
import StudentOverview from '../pages/student/Overview';
import Cours from '../pages/student/Cours';
import ModuleDetail from '../pages/student/ModuleDetail';
import SubModuleDetail from '../pages/student/SubModuleDetail';
import Kanban from '../pages/student/Kanban';
import Notes from '../pages/student/Notes';
import Calendrier from '../pages/student/Calendrier';
import Profil from '../pages/student/Profil';

// Pages admin (§4) — chargées à la demande : réservées au rôle admin (donc
// jamais visitées par un élève) et certaines embarquent des dépendances
// lourdes (ex. @mui/x-data-grid) qu'il serait dommage d'imposer à toute
// l'app, y compris la landing page publique.
const AdminOverview = lazy(() => import('../pages/admin/Overview'));
const Utilisateurs = lazy(() => import('../pages/admin/Utilisateurs'));
const Modules = lazy(() => import('../pages/admin/Modules'));
const Lecons = lazy(() => import('../pages/admin/Lecons'));
const Quiz = lazy(() => import('../pages/admin/Quiz'));
const Exercices = lazy(() => import('../pages/admin/Exercices'));
const Parametres = lazy(() => import('../pages/admin/Parametres'));
const ImportContent = lazy(() => import('../pages/admin/Import'));
const Badges = lazy(() => import('../pages/admin/Badges'));

// Cartographie des routes (§4 / §5.1). Les gardes et layouts sont des routes
// parentes qui rendent un <Outlet /> ; les slugs suivent le sitemap canonique.
export default function AppRouter() {
  return (
    <Routes>
      {/* Zone publique : un utilisateur connecté est renvoyé vers son dashboard. */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      </Route>

      {/* Espace élève (rôle student), sous ProtectedRoute + RoleRoute. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/app" element={<Navigate to="/app/overview" replace />} />
            <Route path="/app/overview" element={<StudentOverview />} />
            <Route path="/app/cours" element={<Cours />} />
            <Route path="/app/cours/:module" element={<ModuleDetail />} />
            <Route path="/app/cours/:module/:subModuleId" element={<SubModuleDetail />} />
            <Route path="/app/kanban" element={<Kanban />} />
            <Route path="/app/notes" element={<Notes />} />
            <Route path="/app/calendrier" element={<Calendrier />} />
            <Route path="/app/profil" element={<Profil />} />
          </Route>
        </Route>
      </Route>

      {/* Espace admin (rôle admin), sous ProtectedRoute + RoleRoute. Les
          pages admin sont chargées à la demande (React.lazy ci-dessus) ;
          AdminLayout fournit le <Suspense> autour de son <Outlet />. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/overview" element={<AdminOverview />} />
            <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
            <Route path="/admin/modules" element={<Modules />} />
            <Route path="/admin/lecons" element={<Lecons />} />
            <Route path="/admin/quiz" element={<Quiz />} />
            <Route path="/admin/exercices" element={<Exercices />} />
            <Route path="/admin/import" element={<ImportContent />} />
            <Route path="/admin/badges" element={<Badges />} />
            <Route path="/admin/parametres" element={<Parametres />} />
          </Route>
        </Route>
      </Route>

      {/* Route inconnue → accueil. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
