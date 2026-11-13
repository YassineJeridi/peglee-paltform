import { createTheme, alpha } from '@mui/material/styles';
import paletteDark from './paletteDark';
import paletteLight from './paletteLight';
import typography from './typography';

// Liquid Glass Design System (voir 3D_Liquid_Glass_Design_System.md).
// Les overrides ci-dessous ciblent les composants de base (Paper, Button,
// AppBar, Drawer...) : comme la quasi-totalité de l'app compose ses écrans à
// partir de ces primitives MUI plutôt que de styles ad hoc, ce fichier seul
// reskinne la grande majorité des pages sans les modifier une par une.
//
// Chaque mode a son propre jeu de tokens "verre" (bg/border/blur en rgba) :
// un verre sombre translucide sur fond noir n'est pas un simple alpha-flip
// d'un verre clair sur fond blanc (il faut inverser la base neutre — blanc vs
// encre — pas seulement l'opacité), d'où GLASS.dark / GLASS.light séparés.
const GLASS = {
  dark: {
    ambient: [
      `radial-gradient(ellipse 900px 600px at 12% -10%, ${alpha('#9D4EDD', 0.28)}, transparent 60%)`,
      `radial-gradient(ellipse 800px 700px at 90% 10%, ${alpha('#4CC9F0', 0.16)}, transparent 55%)`,
      `radial-gradient(ellipse 700px 600px at 50% 100%, ${alpha('#F72585', 0.1)}, transparent 55%)`,
    ].join(', '),
    paperBg: 'rgba(255, 255, 255, 0.045)',
    paperBorder: 'rgba(255, 255, 255, 0.12)',
    paperSheen: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0) 45%)',
    paperInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    solidBg: 'rgba(17, 16, 34, 0.82)',
    solidBorder: 'rgba(255, 255, 255, 0.15)',
    solidShadow: '0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    menuBg: 'rgba(17, 16, 34, 0.88)',
    menuBorder: 'rgba(255, 255, 255, 0.14)',
    backdropBg: 'rgba(3, 3, 7, 0.6)',
    barBg: 'rgba(10, 8, 20, 0.5)',
    barBorder: 'rgba(255, 255, 255, 0.12)',
    drawerBg: 'rgba(10, 8, 20, 0.55)',
    outlinedBg: 'rgba(255, 255, 255, 0.05)',
    outlinedBorder: 'rgba(255, 255, 255, 0.18)',
    outlinedBorderHover: 'rgba(255, 255, 255, 0.3)',
    outlinedBgHover: 'rgba(255, 255, 255, 0.1)',
    textHover: 'rgba(255, 255, 255, 0.06)',
    iconHover: 'rgba(255, 255, 255, 0.08)',
    inputBg: 'rgba(255, 255, 255, 0.03)',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
    inputBorderHover: 'rgba(255, 255, 255, 0.3)',
    chipBg: 'rgba(255, 255, 255, 0.08)',
    chipBorder: 'rgba(255, 255, 255, 0.12)',
    tooltipBg: 'rgba(17, 16, 34, 0.95)',
    tooltipBorder: 'rgba(255, 255, 255, 0.15)',
    tooltipText: 'rgba(255, 255, 255, 0.92)',
    gridBorder: 'rgba(255, 255, 255, 0.12)',
    gridHeaderBg: 'rgba(255, 255, 255, 0.04)',
    gridCellBorder: 'rgba(255, 255, 255, 0.08)',
    gridRowHover: 'rgba(255, 255, 255, 0.04)',
    disabledBg: 'rgba(255, 255, 255, 0.06)',
    disabledBorder: 'rgba(255, 255, 255, 0.08)',
  },
  light: {
    ambient: [
      `radial-gradient(ellipse 900px 600px at 12% -10%, ${alpha('#9D4EDD', 0.14)}, transparent 60%)`,
      `radial-gradient(ellipse 800px 700px at 90% 10%, ${alpha('#4CC9F0', 0.13)}, transparent 55%)`,
      `radial-gradient(ellipse 700px 600px at 50% 100%, ${alpha('#F72585', 0.07)}, transparent 55%)`,
    ].join(', '),
    paperBg: 'rgba(255, 255, 255, 0.55)',
    paperBorder: 'rgba(10, 8, 20, 0.10)',
    paperSheen: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0) 45%)',
    paperInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    solidBg: 'rgba(255, 255, 255, 0.8)',
    solidBorder: 'rgba(10, 8, 20, 0.10)',
    solidShadow: '0 30px 70px rgba(60, 40, 100, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    menuBg: 'rgba(255, 255, 255, 0.85)',
    menuBorder: 'rgba(10, 8, 20, 0.10)',
    backdropBg: 'rgba(30, 20, 50, 0.25)',
    barBg: 'rgba(255, 255, 255, 0.5)',
    barBorder: 'rgba(10, 8, 20, 0.08)',
    drawerBg: 'rgba(255, 255, 255, 0.55)',
    outlinedBg: 'rgba(255, 255, 255, 0.4)',
    outlinedBorder: 'rgba(10, 8, 20, 0.14)',
    outlinedBorderHover: 'rgba(10, 8, 20, 0.28)',
    outlinedBgHover: 'rgba(255, 255, 255, 0.6)',
    textHover: 'rgba(10, 8, 20, 0.05)',
    iconHover: 'rgba(10, 8, 20, 0.06)',
    inputBg: 'rgba(255, 255, 255, 0.5)',
    inputBorder: 'rgba(10, 8, 20, 0.14)',
    inputBorderHover: 'rgba(10, 8, 20, 0.26)',
    chipBg: 'rgba(10, 8, 20, 0.055)',
    chipBorder: 'rgba(10, 8, 20, 0.10)',
    tooltipBg: 'rgba(30, 20, 50, 0.92)',
    tooltipBorder: 'rgba(255, 255, 255, 0.12)',
    tooltipText: 'rgba(255, 255, 255, 0.95)',
    gridBorder: 'rgba(10, 8, 20, 0.10)',
    gridHeaderBg: 'rgba(10, 8, 20, 0.035)',
    gridCellBorder: 'rgba(10, 8, 20, 0.07)',
    gridRowHover: 'rgba(10, 8, 20, 0.035)',
    disabledBg: 'rgba(10, 8, 20, 0.055)',
    disabledBorder: 'rgba(10, 8, 20, 0.08)',
  },
};

export function getTheme(mode = 'dark') {
  const palette = mode === 'light' ? paletteLight : paletteDark;

  return createTheme({
    palette,
    typography,
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: (t) => ({
          body: {
            backgroundColor: t.palette.background.default,
            backgroundImage: GLASS[t.palette.mode].ambient,
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
          },
        }),
      },

      MuiPaper: {
        styleOverrides: {
          root: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundImage: g.paperSheen,
              backgroundColor: g.paperBg,
              backdropFilter: 'blur(26px) saturate(180%)',
              WebkitBackdropFilter: 'blur(26px) saturate(180%)',
              border: `1px solid ${g.paperBorder}`,
            };
          },
          elevation0: ({ theme: t }) => ({
            boxShadow: GLASS[t.palette.mode].paperInset,
          }),
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.solidBg,
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: `1px solid ${g.solidBorder}`,
              boxShadow: g.solidShadow,
              backgroundImage: 'none',
            };
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            backgroundColor: GLASS[t.palette.mode].backdropBg,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }),
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.menuBg,
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid ${g.menuBorder}`,
              backgroundImage: 'none',
            };
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.menuBg,
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid ${g.menuBorder}`,
              backgroundImage: 'none',
            };
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.barBg,
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              backgroundImage: 'none',
            };
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.drawerBg,
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              backgroundImage: 'none',
            };
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            textTransform: 'none',
            fontWeight: 700,
            padding: '9px 22px',
          },
          // Dégradé QUASI OPAQUE (pas un simple tint translucide à 55-75 %
          // d'alpha comme avant) : sur du verre déjà translucide posé sur un
          // fond ambiant, un bouton lui-même translucide se délave et perd
          // toute présence — un CTA doit rester la chose la plus saturée de
          // l'écran. Le liseré + le sheen (::before) gardent la texture
          // "verre" sans sacrifier le punch. Balayage lumineux au survol
          // (::after) pour la touche "liquide" vivante demandée.
          contained: ({ theme: t, ownerState }) => {
            const g = GLASS[t.palette.mode];
            const color = t.palette[ownerState.color] || t.palette.primary;
            return {
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${color.light || color.main} 0%, ${color.main} 55%, ${color.dark || color.main} 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: `0 12px 28px ${alpha(color.main, 0.45)}, inset 0 1px 1px rgba(255, 255, 255, 0.5)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, filter 0.2s ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                left: '-75%',
                width: '50%',
                background: 'linear-gradient(115deg, transparent, rgba(255, 255, 255, 0.55), transparent)',
                transform: 'skewX(-20deg)',
                transition: 'left 0.65s ease',
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 18px 40px ${alpha(color.main, 0.55)}, inset 0 1px 2px rgba(255, 255, 255, 0.6)`,
                filter: 'brightness(1.06)',
                '&::after': { left: '125%' },
              },
              '&:active': { transform: 'translateY(0) scale(0.98)' },
              '&.Mui-disabled': {
                background: g.disabledBg,
                border: `1px solid ${g.disabledBorder}`,
                boxShadow: 'none',
              },
            };
          },
          outlined: ({ theme: t, ownerState }) => {
            const g = GLASS[t.palette.mode];
            const color = t.palette[ownerState.color] || t.palette.primary;
            return {
              backgroundColor: g.outlinedBg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderWidth: 1.5,
              borderColor: g.outlinedBorder,
              transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(color.main, 0.12),
                borderColor: color.main,
                transform: 'translateY(-1px)',
              },
            };
          },
          text: ({ theme: t }) => ({
            '&:hover': { backgroundColor: GLASS[t.palette.mode].textHover },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            '&:hover': { backgroundColor: GLASS[t.palette.mode].iconHover },
          }),
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.inputBg,
              borderRadius: 12,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: g.inputBorder },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: g.inputBorderHover },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9D4EDD', borderWidth: 1 },
            };
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.chipBg,
              border: `1px solid ${g.chipBorder}`,
            };
          },
          outlined: {
            backgroundColor: 'transparent',
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #9D4EDD, #4CC9F0)',
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              backgroundColor: g.tooltipBg,
              color: g.tooltipText,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${g.tooltipBorder}`,
              fontSize: '0.75rem',
            };
          },
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: ({ theme: t }) => {
            const g = GLASS[t.palette.mode];
            return {
              border: `1px solid ${g.gridBorder}`,
              backgroundColor: 'transparent',
              '--DataGrid-containerBackground': 'transparent',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: g.gridHeaderBg,
                borderBottom: `1px solid ${g.gridBorder}`,
              },
              '& .MuiDataGrid-cell': { borderColor: g.gridCellBorder },
              '& .MuiDataGrid-row:hover': { backgroundColor: g.gridRowHover },
              '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${g.gridBorder}` },
            };
          },
        },
      },
    },
  });
}

export default getTheme('dark');
