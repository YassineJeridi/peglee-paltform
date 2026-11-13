import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

// Registre partagé (admin + affichage élève) : liste curatée plutôt qu'un
// sélecteur parmi ~2000 icônes MUI, suffisant pour les thématiques d'un
// module scolaire.
export const MODULE_ICON_OPTIONS = {
  Code: CodeRoundedIcon,
  Memory: MemoryRoundedIcon,
  Storage: StorageRoundedIcon,
  Language: LanguageRoundedIcon,
  Functions: FunctionsRoundedIcon,
  Science: ScienceRoundedIcon,
  Public: PublicRoundedIcon,
  Devices: DevicesRoundedIcon,
  Calculate: CalculateRoundedIcon,
  School: SchoolRoundedIcon,
  Build: BuildRoundedIcon,
  Security: SecurityRoundedIcon,
  Cloud: CloudRoundedIcon,
  Terminal: TerminalRoundedIcon,
  DataObject: DataObjectRoundedIcon,
};

export const MODULE_ICON_FALLBACK = MenuBookRoundedIcon;

export const MODULE_COLOR_OPTIONS = ['#9D4EDD', '#4CC9F0', '#F72585', '#FF9E00', '#480CA8', '#22C55E'];
