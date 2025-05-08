// src/debug/ContextDebugger.tsx
import React, { useState, useEffect, useRef } from "react";
import { Database, X, List, ArrowRight } from "lucide-react";
import { useFlowStore } from "../core/context";
import JsonTreeRenderer from "./components/JsonTreeRenderer";
import SchemaTab from "./tabs/SchemaTab";
import { AppConfig } from "../core/types";

export const ContextDebugger: React.FC<{ config?: AppConfig }> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem("debuggerVisible") === "true"
  );
  const [activeTab, setActiveTab] = useState("data");
  const [expandedPaths, setExpandedPaths] = useState({});
  
  const { data: contextData } = useFlowStore();
  const prevContextRef = useRef({});
  const nodeInfo = useFlowStore((state) => {
    // Attempt to extract current node and scenario info from context
    const currentPath = state.data.currentPath || '';
    const pathParts = currentPath.split('/');
    return {
      workspaceSlug: pathParts[1],
      scenarioSlug: pathParts[2],
      stepIdx: pathParts[3] ? parseInt(pathParts[3]) : 0
    };
  });

  // Track context changes and apply split screen layout
  useEffect(() => {
    localStorage.setItem("debuggerVisible", isVisible.toString());

    // Apply layout classes
    const appContent = document.getElementById("app-content");
    if (appContent) {
      if (isVisible) {
        appContent.classList.add("w-1/2");
        appContent.classList.remove("w-full");
      } else {
        appContent.classList.add("w-full");
        appContent.classList.remove("w-1/2");
      }
    }
    
    prevContextRef.current = JSON.parse(JSON.stringify(contextData));
  }, [isVisible, contextData]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle debugger
  const toggleDebugger = () => setIsVisible((prev) => !prev);

  // Render toggle button when debugger is hidden
  if (!isVisible) {
    return (
      <button
        className="fixed right-4 bottom-4 z-50 px-2.5 py-1.5 text-xs rounded-md bg-white text-gray-800 font-medium flex items-center shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={toggleDebugger}
        title="Ctrl+Shift+D aby włączyć/wyłączyć debugger"
      >
        <Database className="w-3.5 h-3.5 mr-1.5" />
        Context Inspector
      </button>
    );
  }

  // Render debugger
  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center text-sm">
          <Database className="w-4 h-4 mr-1.5" />
          Context Inspector
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={toggleDebugger}
          title="Ukryj debugger (Ctrl+Shift+D)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Path info (optional) */}
      {nodeInfo.scenarioSlug && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center">
          <span>{nodeInfo.workspaceSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>{nodeInfo.scenarioSlug}</span>
          <ArrowRight className="w-3 h-3 mx-1" />
          <span>Step {nodeInfo.stepIdx}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-3 py-2 text-sm font-medium flex items-center transition-colors ${
              activeTab === "data"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("data")}
          >
            <Database className="w-3.5 h-3.5 mr-1.5" />
            Dane
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium flex items-center transition-colors ${
              activeTab === "schema"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("schema")}
          >
            <List className="w-3.5 h-3.5 mr-1.5" />
            Schema
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "data" && (
          <div className="p-4 h-full overflow-auto">
            <div className="rounded-md border border-gray-200 p-3 bg-gray-50 h-full overflow-auto">
              {Object.keys(contextData).length > 0 ? (
                <JsonTreeRenderer 
                  data={contextData} 
                  expandedPaths={expandedPaths} 
                  setExpandedPaths={setExpandedPaths} 
                />
              ) : (
                <div className="text-gray-500 italic text-center p-4">
                  Kontekst jest pusty
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "schema" && (
          <SchemaTab 
            
            contextData={contextData}
            config={config}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500">
        <div>Skrót: Ctrl+Shift+D (pokaż/ukryj)</div>
      </div>
    </div>
  );
};

export default ContextDebugger;