import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reactflow/dist/style.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './contexts/AppContext';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import { initResizeObserverFix } from './utils/resizeObserverFix';

// Initialize ResizeObserver error suppression
const cleanupResizeObserverFix = initResizeObserverFix();

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);