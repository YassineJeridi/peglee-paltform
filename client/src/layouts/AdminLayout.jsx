import DashboardLayout from './DashboardLayout';
import { adminNav } from './navConfig';

// Espace admin : sidebar avec les items d'administration (§4).
export default function AdminLayout() {
  return <DashboardLayout items={adminNav} />;
}
