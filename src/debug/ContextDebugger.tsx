// src/debug/ContextDebugger.tsx
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Database, X, List, ArrowRight, Activity, User, Globe, Upload, FolderOutput } from "lucide-react";
import { useFlowStore } from "../core/context";
import JsonTreeRenderer from "./components/JsonTreeRenderer";
import { AppConfig } from "../core/types";
import { useAuth } from "../auth/useAuth";

// Lazy loading komponentów tab
const SchemaTab = lazy(() => import("./tabs/SchemaTab"));
const LogsTab = lazy(() => import("./tabs/LogsTab"));
const UserTab = lazy(() => import("./tabs/UserTab"));
const FirebaseAppsTab = lazy(() => import("./tabs/FirebaseAppsTab"));
const ExporterTab = lazy(() => import("./tabs/ExporterTab"));

// Komponent do wyświetlania ładowania
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="animate-pulse text-gray-500">Ładowanie...</div>
  </div>
);

export const ContextDebugger: React.FC<{ config?: AppConfig }> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(localStorage.getItem("debuggerVisible") === "true");
  const [activeTab, setActiveTab] = useState("user");
  const [expandedPaths, setExpandedPaths] = useState({});
  const [loadedTabs, setLoadedTabs] = useState<string[]>(["user"]); // Śledzenie załadowanych zakładek
  const { user, loading } = useAuth();
  const { data: contextData } = useFlowStore();
  const prevContextRef = useRef({});
  
  // Ekstrakcja informacji o ścieżce
  const { workspaceSlug, scenarioSlug, stepIdx } = useFlowStore(state => {
    const path = state.data.currentPath?.split("/") || [];
    return {
      workspaceSlug: path[1] || "",
      scenarioSlug: path[2] || "",
      stepIdx: path[3] ? parseInt(path[3]) : 0
    };
  });

  // Połączony efekt zarządzający widocznością i skrótem klawiaturowym
  useEffect(() => {
    localStorage.setItem("debuggerVisible", isVisible.toString());
    const appContent = document.getElementById("app-content");
    if (appContent) {
      appContent.classList.toggle("w-1/2", isVisible);
      appContent.classList.toggle("w-full", !isVisible);
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    prevContextRef.current = JSON.parse(JSON.stringify(contextData));
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, contextData]);

  // Efekt śledzący zmianę aktywnej zakładki
  useEffect(() => {
    // Dodaj aktywną zakładkę do listy załadowanych, jeśli jeszcze jej tam nie ma
    if (!loadedTabs.includes(activeTab)) {
      setLoadedTabs(prev => [...prev, activeTab]);
    }
  }, [activeTab, loadedTabs]);

  // Przycisk toggle gdy debugger jest ukryty
  if (!isVisible) {
    return (
      <button
        className="fixed right-4 bottom-20 z-50 px-2.5 py-1.5 text-xs rounded-md bg-white text-gray-800 font-semibold flex items-center shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsVisible(true)}
        title="Ctrl+Shift+D aby włączyć/wyłączyć debugger"
      >
        <FolderOutput className="w-3.5 h-3.5" />
      </button>
    );
  }

  // Funkcja do zmiany aktywnej zakładki
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Renderowanie zawartości aktywnej zakładki
  const renderTabContent = () => {
    // Renderuj tylko jeśli debugger jest widoczny
    if (!isVisible) return null;

    return (
      <Suspense fallback={<LoadingFallback />}>
        <div className="h-full" style={{ display: activeTab === "user" ? "block" : "none" }}>
          {loadedTabs.includes("user") && <UserTab />}
        </div>
        <div className="h-full" style={{ display: activeTab === "firebase" ? "block" : "none" }}>
          {loadedTabs.includes("firebase") && <FirebaseAppsTab />}
        </div>
        <div className="h-full" style={{ display: activeTab === "schema" ? "block" : "none" }}>
          {loadedTabs.includes("schema") && <SchemaTab contextData={contextData} config={config} />}
        </div>
        <div className="h-full" style={{ display: activeTab === "data" ? "block" : "none" }}>
          {loadedTabs.includes("data") && (
            <div className="p-4 h-full overflow-auto">
              <div className="rounded-md border border-gray-200 p-3 bg-gray-50 h-full overflow-auto">
                {Object.keys(contextData).length > 0 ? (
                  <JsonTreeRenderer
                    data={contextData}
                    expandedPaths={expandedPaths}
                    setExpandedPaths={setExpandedPaths}
                  />
                ) : (
                  <div className="text-gray-500 italic text-center p-4">Kontekst jest pusty</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-full" style={{ display: activeTab === "logs" ? "block" : "none" }}>
          {loadedTabs.includes("logs") && <LogsTab />}
        </div>
        {/* Nowa zakładka dla eksportera */}
        <div className="h-full" style={{ display: activeTab === "exporter" ? "block" : "none" }}>
          {loadedTabs.includes("exporter") && config && <ExporterTab config={config} />}
        </div>
      </Suspense>
    );
  };

  // Definicja przycisków zakładek
  const tabs = [
    { id: "user", label: "Użytkownik", icon: <User className="w-3.5 h-3.5 mr-1.5" />, always: true },
    { id: "firebase", label: "Firebase", icon: <Globe className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "schema", label: "Schema", icon: <List className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "data", label: "Dane", icon: <Database className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "logs", label: "Logs", icon: <Activity className="w-3.5 h-3.5 mr-1.5" />, always: false },
    // Dodajemy nową zakładkę dla eksportera Firebase
    { id: "exporter", label: "Eksport", icon: <Upload className="w-3.5 h-3.5 mr-1.5" />, always: false }
  ];

  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center text-sm">
          <Database className="w-4 h-4 mr-1.5" />Context Inspector
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={() => setIsVisible(false)}
          title="Ukryj debugger (Ctrl+Shift+D)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Path info */}
      {scenarioSlug && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center">
          <span>{workspaceSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>{scenarioSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>Step {stepIdx}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(tab => 
            (tab.always || (!loading && user)) && (
              <button
                key={tab.id}
                className={`px-3 py-2 text-sm font-semibold flex items-center transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.icon}{tab.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500">
        Skrót: Ctrl+Shift+D (pokaż/ukryj)
      </div>
    </div>
  );
};

export default ContextDebugger;