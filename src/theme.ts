import { createTheme } from '@mui/material/styles';

// Material 3 Expressive color roles and tokens - Bright and vibrant theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Bright Blue - more vibrant than dark green
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#FF4081', // Bright Pink - more vibrant accent
      light: '#FF80AB',
      dark: '#F50057',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#4CAF50', // Brighter green
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    background: {
      default: '#FFFFFF', // Pure white background
      paper: '#FFFFFF',
    },
    surface: {
      main: '#F8F9FA', // Very light neutral
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  shape: {
    borderRadius: 12, // Material 3 Expressive rounded corners
  },
  typography: {
    // Material 3 Expressive typography scale
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.2,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  components: {
    // Material 3 Expressive component overrides - Bright and colorful
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.12), 0px 1px 3px rgba(25, 118, 210, 0.08)',
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(25, 118, 210, 0.08)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.15), 0px 2px 6px rgba(25, 118, 210, 0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: 'none',
        },
        contained: {
          background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
            boxShadow: '0px 4px 8px rgba(25, 118, 210, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#1976D2',
          color: '#1976D2',
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: '#FCE4EC',
            color: '#AD1457',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #F50057 30%, #FF4081 90%)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #1976D2 0%, #42A5F5 100%)',
          color: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.MuiPaper-elevation0': {
            backgroundColor: 'rgba(25, 118, 210, 0.02)',
            border: '1px solid rgba(25, 118, 210, 0.08)',
          },
        },
      },
    },
  },
  spacing: 8,
});

// Custom color roles for Material 3 Expressive
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      main: string;
    };
  }
}

export default theme;