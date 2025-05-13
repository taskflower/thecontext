// src/debug/ContextDebugger.tsx
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Database, X, List, ArrowRight, User, Globe, Upload, Settings, Layers } from "lucide-react";
import { useFlowStore } from "../core/context";
import { AppConfig } from "../core/types";
import { useAuth } from "../auth/useAuth";

// Lazy loading komponentów zakładek
const SchemaTab = lazy(() => import("./tabs/SchemaTab"));
const UserTab = lazy(() => import("./tabs/UserTab"));
const FirebaseAppsTab = lazy(() => import("./tabs/FirebaseAppsTab"));
const ExporterTab = lazy(() => import("./tabs/ExporterTab"));
const DataTab = lazy(() => import("./tabs/DataTab"));  
const PageTab = lazy(() => import("./tabs/PageTab"));

// Fallback ładowania
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="animate-pulse text-gray-500">Ładowanie...</div>
  </div>
);

export const ContextDebugger: React.FC<{ config?: AppConfig }> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(localStorage.getItem("debuggerVisible") === "true");
  const [activeTab, setActiveTab] = useState("user");
  // Zawsze wczytujemy zakładki 'user' i 'page'
  const [loadedTabs, setLoadedTabs] = useState<string[]>(["user", "page"]);
  const { user, loading } = useAuth();
  const { data: contextData } = useFlowStore();
  const prevContextRef = useRef({});

  // Ekstrakcja ścieżki
  const { workspaceSlug, scenarioSlug, stepIdx } = useFlowStore(state => {
    const parts = state.data.currentPath?.split("/") || [];
    return {
      workspaceSlug: parts[1] || "",
      scenarioSlug: parts[2] || "",
      stepIdx: parts[3] ? parseInt(parts[3], 10) : 0
    };
  });

  // Efekt widoczności i skrótu klawiaturowego
  useEffect(() => {
    localStorage.setItem("debuggerVisible", isVisible.toString());
    const appContent = document.getElementById("app-content");
    if (appContent) {
      appContent.classList.toggle("w-1/2", isVisible);
      appContent.classList.toggle("w-full", !isVisible);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    prevContextRef.current = JSON.parse(JSON.stringify(contextData));
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, contextData]);

  // Ładowanie nowych zakładek dla pozostałych
  useEffect(() => {
    if (!loadedTabs.includes(activeTab)) {
      setLoadedTabs(prev => [...prev, activeTab]);
    }
  }, [activeTab, loadedTabs]);

  if (!isVisible) {
    return (
      <button
        className="fixed right-4 bottom-20 z-50 px-2.5 py-1.5 text-xs rounded-md bg-white text-gray-800 font-semibold flex items-center shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsVisible(true)}
        title="Ctrl+Shift+D: pokaż/ukryj debugger"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    );
  }

  const handleTabChange = (tabId: string) => setActiveTab(tabId);

  const renderContent = () => (
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
        {loadedTabs.includes("data") && <DataTab contextData={contextData} />}
      </div>
      <div className="h-full" style={{ display: activeTab === "exporter" ? "block" : "none" }}>
        {loadedTabs.includes("exporter") && config && <ExporterTab config={config} />}
      </div>
      <div className="h-full" style={{ display: activeTab === "page" ? "block" : "none" }}>
        {loadedTabs.includes("page") && config && <PageTab config={config} />}
      </div>
    </Suspense>
  );

  const tabs = [
    { id: "user", label: "Użytkownik", icon: <User className="w-3.5 h-3.5 mr-1.5" />, always: true },
    { id: "schema", label: "Schema", icon: <List className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "data", label: "Dane", icon: <Database className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "firebase", label: "Apps", icon: <Globe className="w-3.5 h-3.5 mr-1.5" />, always: false },
    { id: "page", label: "Strona", icon: <Layers className="w-3.5 h-3.5 mr-1.5" />, always: true },
    { id: "exporter", label: "Eksport", icon: <Upload className="w-3.5 h-3.5 mr-1.5" />, always: false }
  ];

  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center text-sm">
          <Database className="w-4 h-4 mr-1.5" />Context Inspector
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={() => setIsVisible(false)}
          title="Ukryj debugger"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {scenarioSlug && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center">
          <span>{workspaceSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>{scenarioSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>Step {stepIdx}</span>
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(tab => (
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
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderContent()}</div>

      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500">
        Skrót klawiszowy: Ctrl+Shift+D
      </div>
    </div>
  );
};

export default ContextDebugger;
