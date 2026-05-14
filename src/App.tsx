import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';
import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SpeedInsights } from '@vercel/speed-insights/react';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
};

export default App;
