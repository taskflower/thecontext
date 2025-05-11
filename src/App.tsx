// src/App.tsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppLoading from './components/Loading';
import WorkspaceOverview from './components/WorkspaceOverview';
import ScenarioWithStep from './components/ScenarioWithStep';
import ConfigIndicator from './components/ConfigIndicator';
import { useAppConfig } from '@/hooks/useAppConfig';
import { ThemeProvider } from '@/themes/ThemeContext';
import { ContextDebugger } from './debug';

const AppContent: React.FC = () => {
  const { config, loading, error, configType, configId } = useAppConfig();

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
      <ConfigIndicator configId={configId} configType={configType} config={config} />
        <Routes>
          {/* 1. Obsługa konfiguracji w URL */}
          <Route
            path="app/:configId/*"
            element={<Navigate to={`/${defaultWorkspace}`} replace />}
          />

          {/* 2. Szczegółowy scenariusz */}
          <Route
            path=":workspaceSlug/:scenarioSlug/:stepIndex"
            element={<ScenarioWithStep config={config} />}
          />

          {/* 3. Przegląd workspace */}
          <Route
            path=":workspaceSlug"
            element={<WorkspaceOverview config={config} />}
          />

          {/* 4. Dokładny root bez workspace */}
          <Route
            index
            element={<Navigate to={`/${defaultWorkspace}`} replace />}
          />

          {/* 5. Pozostałe */}
          <Route
            path="*"
            element={<Navigate to={`/${defaultWorkspace}`} replace />}
          />
        </Routes>
      </BrowserRouter>
      <ContextDebugger config={config} />
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;