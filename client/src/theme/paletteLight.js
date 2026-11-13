// Liquid Glass Design System — variante claire. Mêmes teintes de marque que
// paletteDark.js, mais recalibrées : les tons "main" servent directement de
// couleur de texte/icône dans plusieurs écrans (ex. Hero, PublicNavbar), donc
// on utilise des nuances plus saturées/foncées pour rester lisibles sur fond
// clair plutôt qu'un simple alpha-flip des valeurs sombres.
const palette = {
  mode: 'light',
  primary: { main: '#7B2CBF', light: '#9D4EDD', dark: '#5A189A', contrastText: '#FFFFFF' },
  secondary: { main: '#0B7285', light: '#4CC9F0', dark: '#075364', contrastText: '#FFFFFF' },
  error: { main: '#D6236B' },
  warning: { main: '#B45F06' },
  success: { main: '#0B7285' },
  background: { default: '#F6F4FB', paper: '#FFFFFF' },
  text: { primary: 'rgba(10, 8, 20, 0.90)', secondary: 'rgba(10, 8, 20, 0.62)', disabled: 'rgba(10, 8, 20, 0.36)' },
  divider: 'rgba(10, 8, 20, 0.10)',
  action: {
    hover: 'rgba(10, 8, 20, 0.045)',
    selected: 'rgba(123, 44, 191, 0.12)',
    disabled: 'rgba(10, 8, 20, 0.24)',
    disabledBackground: 'rgba(10, 8, 20, 0.08)',
  },
};

export default palette;
