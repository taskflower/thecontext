// src/components/DynamicRoutes.tsx
import React, { Suspense, useEffect, useState, lazy } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AppConfig } from "@/core";
import { ScenarioWithStep, WorkspaceOverview } from ".";
import Loading from "./Loading";
import { configService, ConfigSource } from "../config/services/ConfigService";

// Lazy-loading dla stron administracyjnych
const AdminPage = lazy(() => import('../config/pages/AdminPage'));
const ConfigPage = lazy(() => import('../config/pages/ConfigPage'));

// Hook do wykrywania parametrów aplikacji z routingu
const useAppParams = () => {
  const params = useParams<{ appId?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  return {
    appId: params.appId || searchParams.get("appId") || undefined,
    source: (searchParams.get("source") as ConfigSource) || ConfigSource.LOCAL
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
        
        // Tworzymy opcje konfiguracji na podstawie parametrów
        const configOptions = {
          source: source || ConfigSource.LOCAL,
          appId
        };
        
        // Pobieramy konfigurację
        const loadedConfig = await configService.getConfig(configOptions);
        setConfig(loadedConfig);
      } catch (err: any) {
        console.error("Failed to load config:", err);
        setError(err.message || "Błąd ładowania konfiguracji");
        
        // Próbujemy załadować lokalną konfigurację jako fallback
        if (source !== ConfigSource.LOCAL) {
          try {
            const localConfig = await configService.getConfig({ source: ConfigSource.LOCAL });
            setConfig(localConfig);
            setError(null);
          } catch (fallbackErr: any) {
            setError(`Nie udało się załadować konfiguracji: ${fallbackErr.message}`);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [appId, source]);
  
  if (loading) return <Loading message="Ładowanie konfiguracji aplikacji..." />;
  if (error) return <div className="p-4 text-red-500">Błąd: {error}</div>;
  if (!config) return <div className="p-4">Brak konfiguracji</div>;
  
  // Gdy mamy załadowaną konfigurację, renderujemy standardowe ścieżki
  return <AppRoutes config={config} />;
};

// Standardowe ścieżki aplikacji
export const AppRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  const defaultWorkspace = config.workspaces[0]?.slug || "";

  return (
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
  );
};

// Główne ścieżki aplikacji z obsługą dynamicznego ładowania
export const MainRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading message="Ładowanie aplikacji..." />}>
      <Routes>
        {/* Strona zarządzania konfiguracją */}
        <Route 
          path="/config" 
          element={
            <Suspense fallback={<Loading message="Ładowanie strony konfiguracji..." />}>
              <ConfigPage />
            </Suspense>
          } 
        />
        
        {/* Panel administracyjny */}
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<Loading message="Ładowanie panelu administracyjnego..." />}>
              <AdminPage />
            </Suspense>
          } 
        />
        
        <Route 
          path="/admin/:appId" 
          element={
            <Suspense fallback={<Loading message="Ładowanie panelu administracyjnego..." />}>
              <AdminPage />
            </Suspense>
          } 
        />
        
        {/* Ścieżka dla ładowania konfiguracji z Firebase na podstawie ID aplikacji */}
        <Route path="/app/:appId/*" element={<DynamicAppRoutes />} />
        
        {/* Domyślna ścieżka używająca lokalnej konfiguracji */}
        <Route path="/*" element={<DynamicAppRoutes />} />
      </Routes>
    </Suspense>
  );
};