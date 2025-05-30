// src/pages/RedirectToDefault.tsx - Redirect logic for root URL
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { AppConfig } from "@/core/types";

const DEFAULT_CONFIG = "exampleTicketApp";

export default function RedirectToDefault() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        // Próbuj załadować domyślną konfigurację
        const response = await fetch(`/src/_configs/${DEFAULT_CONFIG}/app.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load default config: ${response.status}`);
        }
        
        const appConfig: AppConfig = await response.json();
        
        // Zbuduj URL na podstawie konfiguracji
        const config = DEFAULT_CONFIG;
        const workspace = appConfig.defaultWorkspace || "default";
        const scenario = appConfig.defaultScenario || "default";
        const action = "view"; // Zahardkodowane jak prosiłeś
        
        const url = `/${config}/${workspace}/${scenario}/${action}`;
        console.log(`Redirecting to: ${url}`);
        
        setRedirectUrl(url);
      } catch (err) {
        console.error("Failed to load default config:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        
        // Fallback do podstawowego URL
        setRedirectUrl(`/${DEFAULT_CONFIG}/tickets/default/view`);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-600">Loading default configuration...</div>
      </div>
    );
  }

  if (error) {
    console.warn("Redirect error:", error);
    // Nawet przy błędzie, robimy redirect do fallback URL
  }

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  // Ostateczny fallback
  return <Navigate to={`/${DEFAULT_CONFIG}/tickets/default/view`} replace />;
}