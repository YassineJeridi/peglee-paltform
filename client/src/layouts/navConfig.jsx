import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

// Sitemap des espaces connectés (§4). Chaque item : libellé, route, icône.
export const studentNav = [
  { label: 'Vue d\'ensemble', to: '/app/overview', icon: <DashboardRoundedIcon /> },
  { label: 'Cours', to: '/app/cours', icon: <MenuBookRoundedIcon /> },
  { label: 'Kanban', to: '/app/kanban', icon: <ViewKanbanRoundedIcon /> },
  { label: 'Notes', to: '/app/notes', icon: <StickyNote2RoundedIcon /> },
  { label: 'Calendrier', to: '/app/calendrier', icon: <CalendarMonthRoundedIcon /> },
  { label: 'Profil', to: '/app/profil', icon: <PersonRoundedIcon /> },
];

export const adminNav = [
  { label: 'Vue d\'ensemble', to: '/admin/overview', icon: <DashboardRoundedIcon /> },
  { label: 'Utilisateurs', to: '/admin/utilisateurs', icon: <GroupRoundedIcon /> },
  { label: 'Modules', to: '/admin/modules', icon: <CategoryRoundedIcon /> },
  { label: 'Leçons', to: '/admin/lecons', icon: <ArticleRoundedIcon /> },
  { label: 'Quiz', to: '/admin/quiz', icon: <QuizRoundedIcon /> },
  { label: 'Exercices', to: '/admin/exercices', icon: <FitnessCenterRoundedIcon /> },
  { label: 'Import', to: '/admin/import', icon: <UploadFileRoundedIcon /> },
  { label: 'Badges', to: '/admin/badges', icon: <EmojiEventsRoundedIcon /> },
  { label: 'Paramètres', to: '/admin/parametres', icon: <SettingsRoundedIcon /> },
];
