// src/components/DynamicRoutes.tsx
import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AppConfig } from "@/core";
import { ScenarioWithStep, WorkspaceOverview } from ".";
import Loading from "./Loading";
import { configService, ConfigSource } from "../config/FirebaseConfigService";

// Hook do wykrywania parametrów aplikacji z routingu
const useAppParams = () => {
  const params = useParams<{ appId?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const isFirebaseRoute = location.pathname.startsWith('/app/') && params.appId;

  return {
    appId: params.appId || searchParams.get("appId") || undefined,
    source: isFirebaseRoute ? ConfigSource.FIREBASE : 
           (searchParams.get("source") as ConfigSource) || ConfigSource.LOCAL,
  };
};

// Komponent dynamicznie ładujący konfigurację na podstawie routingu
export const DynamicAppRoutes: React.FC = () => {
  const { appId, source } = useAppParams();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`[DynamicAppRoutes] Ładowanie konfiguracji - źródło: ${source}, appId: ${appId || 'brak'}`);

        // Tworzymy opcje konfiguracji na podstawie parametrów
        const configOptions = {
          source: source,
          appId,
        };

        // Pobieramy konfigurację
        const loadedConfig = await configService.getConfig(configOptions);
        console.log("[DynamicAppRoutes] Załadowano konfigurację:", loadedConfig.name);
        console.log("[DynamicAppRoutes] Workspaces:", loadedConfig.workspaces.map(w => w.slug).join(', '));
        
        setConfig(loadedConfig);
      } catch (err: any) {
        console.error("[DynamicAppRoutes] Błąd ładowania konfiguracji:", err);
        setError(err.message || "Błąd ładowania konfiguracji");

        // Próbujemy załadować lokalną konfigurację jako fallback tylko jeśli próbowaliśmy z Firebase
        if (source === ConfigSource.FIREBASE) {
          console.log("[DynamicAppRoutes] Próba załadowania lokalnej konfiguracji jako fallback");
          try {
            const localConfig = await configService.getConfig({
              source: ConfigSource.LOCAL,
            });
            setConfig(localConfig);
            console.log("[DynamicAppRoutes] Załadowano lokalną konfigurację jako fallback");
            setError(null);
          } catch (fallbackErr: any) {
            setError(
              `Nie udało się załadować konfiguracji: ${fallbackErr.message}`
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [appId, source]);

  if (loading) return <Loading message="Ładowanie konfiguracji aplikacji..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-600">Błąd ładowania konfiguracji</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <p className="text-gray-500 text-sm mb-4">
          Sprawdź czy ID aplikacji jest poprawne i czy masz dostęp do tej konfiguracji.
        </p>
        <div className="flex space-x-4">
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Wróć do strony głównej
          </a>
          <button 
            onClick={() => configService.clearCache()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Wyczyść cache
          </button>
        </div>
      </div>
    </div>
  );
  if (!config) return <div className="p-4">Brak konfiguracji</div>;

  // Gdy mamy załadowaną konfigurację, renderujemy standardowe ścieżki
  return <AppRoutes config={config} />;
};

// Standardowe ścieżki aplikacji
export const AppRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  const defaultWorkspace = config.workspaces[0]?.slug || "";
  
  console.log(`[AppRoutes] Renderowanie aplikacji z domyślnym workspace: ${defaultWorkspace}`);
  console.log(`[AppRoutes] Dostępne workspaces: ${config.workspaces.map(w => w.slug).join(', ')}`);

  return (
    <div id="app-content" className="w-full">
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/${defaultWorkspace}`} replace />}
        />

        <Route
          path="/:workspaceSlug"
          element={<WorkspaceOverview config={config} />}
        />

        <Route
          path="/:workspaceSlug/:scenarioSlug/:stepIndex"
          element={<ScenarioWithStep config={config} />}
        />

        <Route
          path="*"
          element={<Navigate to={`/${defaultWorkspace}`} replace />}
        />
      </Routes>
    </div>
  );
};

// Główne ścieżki aplikacji z obsługą dynamicznego ładowania
export const MainRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading message="Ładowanie aplikacji..." />}>
      <Routes>
        {/* Ścieżka dla ładowania konfiguracji z Firebase na podstawie ID aplikacji */}
        <Route path="/app/:appId/*" element={<DynamicAppRoutes />} />

        {/* Domyślna ścieżka używająca lokalnej konfiguracji */}
        <Route path="/*" element={<DynamicAppRoutes />} />
      </Routes>
    </Suspense>
  );
};