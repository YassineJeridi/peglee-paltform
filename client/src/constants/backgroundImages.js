// Renders "liquid glass" fournis par le client (client/src/assets/*.jpeg),
// mappés par zone d'usage plutôt que par nom de fichier — un seul point à
// modifier si un rendu est remplacé. Chaque zone a une variante par mode ;
// `cta` n'a pas de 4e rendu sombre distinct, on réutilise donc l'asset du
// Hero (recadré différemment via backgroundPosition côté composant).
import heroDark from '../assets/Dark-Background-1.webp';
import heroLight from '../assets/Light-Background-1.webp';
import authDark from '../assets/Dark-Background-2.webp';
import authLight from '../assets/Light-Background-2.webp';
import shellDark from '../assets/Dark-Background-3.webp';
import shellLight from '../assets/Light-Background-4.webp';
import ctaLight from '../assets/Light-Background-3.webp';

export const BACKGROUND_IMAGES = {
  hero: { dark: heroDark, light: heroLight },
  auth: { dark: authDark, light: authLight },
  shell: { dark: shellDark, light: shellLight },
  cta: { dark: heroDark, light: ctaLight },
};
