// Police Inter (importée via @fontsource dans main.jsx) — correspond au choix
// primaire du design system (§3.1). Échelle/graisse/tracking alignés sur §3.2.
const typography = {
  fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  h1: { fontWeight: 800, fontSize: '3rem', lineHeight: 1.1, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.015em' },
  h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
  h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
  h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
  h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
  body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
  body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  caption: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' },
  button: { fontWeight: 600, textTransform: 'none' },
};

export default typography;
