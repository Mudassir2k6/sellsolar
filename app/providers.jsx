'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { ErrorBoundary } from '@/ErrorBoundary';
import DeployVersionWatcher from '@/components/DeployVersionWatcher';

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <ToastProvider>
              <DeployVersionWatcher />
              {children}
            </ToastProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
