// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // you can customize
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    // Customize your font family, sizes, etc.
    fontFamily: ['Roboto', 'sans-serif'].join(','),
  },
  // Add spacing, shape (borderRadius), breakpoints if desired
});