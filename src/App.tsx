import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

// Harmonized Material UI Theme matching Ant Design 5 token system
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1677ff',
      light: '#e6f4ff',
      dark: '#0958d9',
    },
    secondary: {
      main: '#4f46e5',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
});

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 38,
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 14,
          },
          Table: {
            borderRadius: 10,
          },
        },
      }}
    >
      <MuiThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </MuiThemeProvider>
    </ConfigProvider>
  );
};

export default App;
