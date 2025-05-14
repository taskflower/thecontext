import React, { useState, lazy, Suspense, useMemo, useCallback } from "react";
import { LuIcon } from "../components/LuIcon";
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
        <LuIcon name="settings" size={14} />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center text-sm">
          <LuIcon name="settings" size={16} className="mr-1.5" />
          RevertContext settings
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={() => setIsVisible(false)}
          title="Ukryj debugger"
        >
          <LuIcon name="x" size={16} />
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
                  {/* @ts-ignore */}
                  <LuIcon name={tab.icon} size={14} className="mr-1.5" />
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

      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500">
        Skrót klawiszowy: Ctrl+Shift+D
      </div>
    </div>
  );
};

export default ContextDebugger;
