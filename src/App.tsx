// src/App.tsx
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext"; 
import AppLoading from "./components/Loading";
import { AppConfig } from "./core/types";
import { WorkspaceOverview, ScenarioWithStep } from "./components";
import { ContextDebugger } from "./debug";
import { simpleConfigLoader } from "./config/SimpleFirebaseConfig";

/**
 * Główny komponent aplikacji ładujący konfigurację
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

/**
 * Komponent aplikacji z obsługą ładowania konfiguracji
 */
const AppContent: React.FC = () => {
  // Pobierz appId z URL, jeśli istnieje
  const params = useParams<{ appId?: string }>();
  const pathname = window.location.pathname;
  
  // Sprawdź, czy mamy appId w URL
  const appIdMatch = pathname.match(/^\/app\/([^\/]+)/);
  const firebaseAppId = appIdMatch ? appIdMatch[1] : undefined;
  
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ładuj konfigurację przy pierwszym renderowaniu
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ładuj konfigurację z Firebase lub lokalnie
        const loadedConfig = await simpleConfigLoader.loadConfig(firebaseAppId);
        setConfig(loadedConfig);
        
        console.log(`Załadowano konfigurację: ${loadedConfig.name}`);
        console.log(`Źródło: ${firebaseAppId ? 'Firebase' : 'Lokalne'}`);
      } catch (err: any) {
        console.error("Błąd ładowania konfiguracji:", err);
        setError(err.message || "Wystąpił nieoczekiwany błąd");
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [firebaseAppId]);
  
  // Gdy ładujemy konfigurację
  if (loading) {
    return <AppLoading message={`Ładowanie ${firebaseAppId ? 'konfiguracji z Firebase' : 'aplikacji'}...`} />;
  }
  
  // Gdy wystąpił błąd
  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-red-600">Błąd ładowania aplikacji</h2>
          <p className="mb-4 text-gray-700">{error || "Nie można załadować konfiguracji"}</p>
          <a href="/" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Wróć do strony głównej
          </a>
        </div>
      </div>
    );
  }
  
  // Gdy załadowaliśmy konfigurację
  return (
    <>
      <Suspense fallback={<AppLoading message="Renderowanie aplikacji..." />}>
        <AppRoutes config={config} />
        <ContextDebugger />
        
        {/* Wskaźnik konfiguracji Firebase */}
        {firebaseAppId && (
          <div className="fixed left-4 bottom-4 z-50 px-3 py-2 text-xs rounded-md bg-blue-100 text-blue-800 font-semibold flex items-center shadow-md border border-blue-200">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Firebase: {firebaseAppId.substring(0, 8)}...
          </div>
        )}
      </Suspense>
    </>
  );
};

/**
 * Komponent z routingiem aplikacji
 */
const AppRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  // Pobierz pierwszy dostępny workspace jako domyślny
  const defaultWorkspace = config.workspaces[0]?.slug || "";
  
  // Sprawdź, czy mamy appId w URL
  const pathname = window.location.pathname;
  const appIdMatch = pathname.match(/^\/app\/([^\/]+)(\/.*)?$/);
  const prefix = appIdMatch ? `/app/${appIdMatch[1]}` : '';
  
  if (!defaultWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-amber-600">Brak przestrzeni roboczych</h2>
          <p className="mb-4 text-gray-700">
            Konfiguracja nie zawiera żadnych przestrzeni roboczych (workspaces).
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="app-content" className="w-full">
      <Routes>
        {/* Firebase routes */}
        <Route path="/app/:appId" element={<Navigate to={`${prefix}/${defaultWorkspace}`} replace />} />
        <Route path="/app/:appId/:workspaceSlug" element={<WorkspaceOverview config={config} />} />
        <Route path="/app/:appId/:workspaceSlug/:scenarioSlug/:stepIndex" element={<ScenarioWithStep config={config} />} />
        
        {/* Standard routes */}
        <Route path="/" element={<Navigate to={`/${defaultWorkspace}`} replace />} />
        <Route path="/:workspaceSlug" element={<WorkspaceOverview config={config} />} />
        <Route path="/:workspaceSlug/:scenarioSlug/:stepIndex" element={<ScenarioWithStep config={config} />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={`/${defaultWorkspace}`} replace />} />
      </Routes>
    </div>
  );
};

export default App;