// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppLoading from './components/Loading';
import WorkspaceOverview from './components/WorkspaceOverview';
import ScenarioWithStep from './components/ScenarioWithStep';
import FirebaseAppIndicator from './components/FirebaseAppIndicator';
import { useAppConfig } from './config/useAppConfig';
import { ContextDebugger } from './debug';
import { ThemeProvider } from '@/themes/ThemeContext';

const AppContent: React.FC = () => {
  const { config, loading, error, usingFirebase } = useAppConfig();

  if (loading) return <AppLoading message="Wczytywanie konfiguracji..." />;
  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600">
            {error || 'Brak konfiguracji'}
          </h2>
        </div>
      </div>
    );
  }

  const defaultWorkspace = config.workspaces[0]?.slug || '';

  return (
    <ThemeProvider value={config.tplDir}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/${defaultWorkspace}`} replace />} />
          <Route path="/:workspaceSlug" element={<WorkspaceOverview config={config} />} />
          <Route
            path="/:workspaceSlug/:scenarioSlug/:stepIndex"
            element={<ScenarioWithStep config={config} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {usingFirebase && <FirebaseAppIndicator />}
      </BrowserRouter>
      <ContextDebugger config={config}/>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
