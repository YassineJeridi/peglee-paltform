// Liquid Glass Design System — voir 3D_Liquid_Glass_Design_System.md à la
// racine du projet. Source de vérité unique : modifier ces valeurs suffit à
// reskinner toute l'app (la quasi-totalité des écrans consomme les tokens de
// thème plutôt que des couleurs codées en dur).
const palette = {
  mode: 'dark',
  primary: { main: '#9D4EDD', light: '#C8B6FF', dark: '#7B2CBF', contrastText: '#FFFFFF' },
  secondary: { main: '#4CC9F0', light: '#8DE4FF', dark: '#3A0CA3', contrastText: '#05050A' },
  error: { main: '#F72585' },
  warning: { main: '#FF9E00' },
  success: { main: '#4CC9F0' },
  background: { default: '#080711', paper: '#111022' },
  text: { primary: 'rgba(255, 255, 255, 0.92)', secondary: 'rgba(255, 255, 255, 0.65)', disabled: 'rgba(255, 255, 255, 0.38)' },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    hover: 'rgba(255, 255, 255, 0.06)',
    selected: 'rgba(157, 78, 221, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.26)',
    disabledBackground: 'rgba(255, 255, 255, 0.08)',
  },
};

export default palette;
