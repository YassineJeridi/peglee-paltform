import DashboardLayout from './DashboardLayout';
import { studentNav } from './navConfig';

// Espace élève : sidebar avec les items étudiant (§4).
export default function StudentLayout() {
  return <DashboardLayout items={studentNav} />;
}
