// src/components/ui/ThemeProvider.tsx
import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Create a custom Material UI theme
const theme = createTheme({
  palette: {
    primary: { main: '#1E3A8A' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

// Wraps the app with MUI theme and baseline styles
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
