import React, { useState, lazy, Suspense, useMemo, useCallback } from "react";
import { useFlowStore } from "../core/context";
import { AppConfig } from "../core/types";
import { useAuth } from "../auth/useAuth";
import { I } from "@/components";
// Importujemy useConfig i EditConfigButton
import { useConfig } from "@/ConfigProvider";
import { EditConfigButton } from "./EditConfigButton";

// Lazy loading komponentów zakładek
const SchemaTab = lazy(() => import("./tabs/SchemaTab"));
const UserTab = lazy(() => import("./tabs/UserTab"));
const FirebaseAppsTab = lazy(() => import("./tabs/FirebaseAppsTab"));
const ExporterTab = lazy(() => import("./tabs/ExporterTab"));
const DataTab = lazy(() => import("./tabs/DataTab"));
const PageTab = lazy(() => import("./tabs/PageTab"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="animate-pulse text-gray-500">Ładowanie...</div>
  </div>
);

const ContextDebugger: React.FC<{ config?: AppConfig }> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem("debuggerVisible") === "true"
  );
  const [activeTab, setActiveTab] = useState("user");
  const { user, loading } = useAuth();
  const { data: contextData } = useFlowStore();
  // Dodajemy useConfig hook
  const { configId } = useConfig();

  const tabs = useMemo(
    () => [
      {
        id: "user",
        label: "Użytkownik",
        icon: "user",
        component: <UserTab />,
        protected: false,
      },
      {
        id: "apps",
        label: "Aplikacje",
        icon: "globe",
        component: <FirebaseAppsTab />,
        protected: true,
      },
      {
        id: "views",
        label: "Widoki",
        icon: "layers",
        component: config && <PageTab config={config} />,
        protected: true,
      },
      {
        id: "schema",
        label: "Schema",
        icon: "list",
        component: <SchemaTab contextData={contextData} config={config} />,
        protected: true,
      },
      {
        id: "data",
        label: "Dane",
        icon: "database",
        component: <DataTab contextData={contextData} />,
        protected: true,
      },
      {
        id: "export",
        label: "Eksport",
        icon: "upload",
        component: config && <ExporterTab config={config} />,
        protected: true,
      },
    ],
    [config, contextData]
  );

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (!isVisible) {
    return (
      <button
        className="fixed right-4 bottom-20 z-50 px-2.5 py-1.5 text-xs rounded-md bg-white text-gray-800 font-semibold flex items-center shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsVisible(true)}
        title="Ctrl+Shift+D: pokaż/ukryj debugger"
      >
        <I name="settings" className="w-4 h-4 mr-1" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center text-sm">
          <I name="settings" className="mr-1.5" />
          RevertContext settings
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={() => setIsVisible(false)}
          title="Ukryj debugger"
        >
          <I name="x" />
        </button>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(
            (tab) =>
              (!tab.protected || (!loading && user)) && (
                <button
                  key={tab.id}
                  className={`px-3 py-2 text-sm font-semibold flex items-center transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <I name={tab.icon} />
                  {tab.label}
                </button>
              )
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </Suspense>
      </div>

      {/* Zmodyfikowany dolny pasek z informacją o konfiguracji */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs flex justify-between items-center">
        {configId && (
          <>
            <EditConfigButton />
            <div className="text-gray-700 flex items-center">
              <span className="mr-1.5">Config:</span>
              <span className="border px-2 py-0.5 rounded bg-white">{configId}</span>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContextDebugger;
