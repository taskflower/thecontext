// src/App.tsx
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import type { AppConfig } from "./core/types";
import FlowRoutes from "./components/FlowRoutes";
import { AuthProvider } from "./auth/useAuth";
import AppLoading from "./components/LoadingSpinner";

const App: React.FC<{ configUrl?: string; initialConfig?: AppConfig }> = ({
  configUrl = "/api/config",
  initialConfig,
}) => {
  const [config, setConfig] = useState<AppConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfig) return;
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(configUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setConfig(data);
      } catch (err: any) {
        console.error("Failed to load config:", err);
        setError(err.message || "Błąd ładowania konfiguracji");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [configUrl, initialConfig]);

  if (loading) return <AppLoading message="Ładowanie konfiguracji..." />;
  if (error) return <AppLoading message={`Błąd: ${error}`} />;
  if (!config) return <AppLoading message="Brak konfiguracji" />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<AppLoading message="Ładowanie aplikacji..." />}>
          <FlowRoutes config={config} />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
