// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import type { AppConfig } from "./core/types";
import FlowRoutes from "./components/FlowRoutes";
import { AuthProvider } from "./auth/useAuth";

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
      } catch (err) {
        console.error("Failed to load config:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load configuration"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [configUrl, initialConfig]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-center text-gray-700">Ładowanie konfiguracji...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <div className="text-red-500 text-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Błąd</h2>
          <p className="text-center text-gray-700">{error}</p>
        </div>
      </div>
    );
  if (!config)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-center text-gray-700">Brak konfiguracji</p>
        </div>
      </div>
    );

  return (
    <AuthProvider>
      <BrowserRouter>
        <FlowRoutes config={config} />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
