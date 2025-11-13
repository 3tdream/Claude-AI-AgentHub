import { createTheme } from '@mui/material/styles';

// Retro Gaming Color Palette
const retroColors = {
  primary: '#8B008B',      // Deep Purple/Magenta
  secondary: '#00FFFF',    // Bright Cyan
  accent: '#FFD700',       // Neon Yellow
  background: '#0A0E27',   // Dark Blue-Black
  surface: '#1a1f3a',      // Slightly lighter surface
  error: '#FF006E',        // Hot Pink
  success: '#00FF00',      // Bright Green
  text: '#FFFFFF',         // White
  textSecondary: '#B0B0B0' // Light Gray
};

// Custom Retro MUI Theme
export const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: retroColors.primary,
      light: '#B030B0',
      dark: '#600060',
      contrastText: retroColors.text,
    },
    secondary: {
      main: retroColors.secondary,
      light: '#33FFFF',
      dark: '#00CCCC',
      contrastText: retroColors.background,
    },
    error: {
      main: retroColors.error,
    },
    success: {
      main: retroColors.success,
    },
    background: {
      default: retroColors.background,
      paper: retroColors.surface,
    },
    text: {
      primary: retroColors.text,
      secondary: retroColors.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    h1: {
      fontSize: '3rem',
      fontWeight: 400,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textShadow: `0 0 10px ${retroColors.secondary}, 0 0 20px ${retroColors.primary}`,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 0, // Sharp corners for retro look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          border: `3px solid ${retroColors.secondary}`,
          boxShadow: `0 0 10px ${retroColors.secondary}`,
          padding: '12px 24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 0 20px ${retroColors.secondary}, 0 0 30px ${retroColors.primary}`,
            transform: 'translateY(-2px)',
            backgroundColor: retroColors.primary,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${retroColors.secondary}40, transparent)`,
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        contained: {
          backgroundColor: retroColors.primary,
          color: retroColors.text,
        },
        outlined: {
          borderColor: retroColors.secondary,
          color: retroColors.secondary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `2px solid ${retroColors.secondary}`,
          boxShadow: `0 0 20px ${retroColors.primary}40`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `3px solid ${retroColors.accent}`,
          boxShadow: `0 0 15px ${retroColors.accent}60`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            background: `linear-gradient(45deg, ${retroColors.primary}20, transparent, ${retroColors.secondary}20)`,
            zIndex: -1,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `4px solid ${retroColors.secondary}`,
          boxShadow: `0 0 30px ${retroColors.secondary}, inset 0 0 20px ${retroColors.primary}20`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${retroColors.secondary}40`,
          padding: '16px',
        },
        head: {
          backgroundColor: retroColors.primary,
          color: retroColors.text,
          fontWeight: 'bold',
          borderBottom: `2px solid ${retroColors.secondary}`,
        },
      },
    },
  },
});

export default retroTheme;
