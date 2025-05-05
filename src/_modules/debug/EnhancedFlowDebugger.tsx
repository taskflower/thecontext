// src/_modules/debug/EnhancedFlowDebugger.tsx
import { useState, useEffect, useRef } from "react";
import { 
  RefreshCw, 
  Clock, 
  List, 
  Database, 
  X, 


  AppWindowMac
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/hooks";

// Import Tabs
import ContextTab from "./tabs/ContextTab";
import LogsTab from "./tabs/LogsTab";
import ScenarioTab from "./tabs/ScenarioTab";

import AppManager from "../admin/components/AppManager";

export const EnhancedFlowDebugger = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem("debuggerVisible") === "true"
  );
  const [context, setContext] = useState({});
  const [logEntries, setLogEntries] = useState<
    { id: number; timestamp: Date; changes: any; type: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState("context");
  const [expandedPaths, setExpandedPaths] = useState({});
  
  const appStore = useAppStore();
  const { getCurrentScenario, getCurrentWorkspace, getContextPath } = appStore;
  
  const prevContextRef = useRef({});
  const logContainerRef = useRef(null);
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();

  // Context change tracking
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Get the current context from the workspace ID
      const workspaceId = appStore.data.currentWorkspaceId;
      if (!workspaceId) {
        setContext({});
        return;
      }
      
      const currentContext = appStore.data.contexts[workspaceId] || {};
      setContext(currentContext);

      // Detecting changes
      const prevContext = prevContextRef.current;
      const changes = findChanges(prevContext, currentContext);

      if (Object.keys(changes).length > 0) {
        setLogEntries((prev) => {
          const newEntries = [
            ...prev,
            {
              id: Date.now(),
              timestamp: new Date(),
              changes,
              type: "context-change",
            },
          ];
          // Limit to 100 most recent entries
          return newEntries.slice(-100);
        });
      }

      prevContextRef.current = JSON.parse(JSON.stringify(currentContext));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [appStore]);

  // Save settings to localStorage and manage split screen layout
  useEffect(() => {
    localStorage.setItem("debuggerVisible", isVisible.toString());

    // Apply Tailwind classes to the main content via DOM manipulation
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
  }, [isVisible]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key === "D" || e.key === "d") {
          e.preventDefault();
          setIsVisible((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Function to find changes between objects
  const findChanges = (oldObj: any, newObj: any, path = "") => {
    const changes: any = {};

    // Check for removed or modified keys
    for (const key in oldObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in newObj)) {
        changes[currentPath] = {
          oldValue: oldObj[key],
          newValue: undefined,
          type: "removed",
        };
      } else if (
        typeof oldObj[key] === "object" &&
        oldObj[key] !== null &&
        typeof newObj[key] === "object" &&
        newObj[key] !== null
      ) {
        // Recursively check nested objects
        const nestedChanges = findChanges(
          oldObj[key],
          newObj[key],
          currentPath
        );
        Object.assign(changes, nestedChanges);
      } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        changes[currentPath] = {
          oldValue: oldObj[key],
          newValue: newObj[key],
          type: "modified",
        };
      }
    }

    // Check for new keys
    for (const key in newObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in oldObj)) {
        changes[currentPath] = {
          oldValue: undefined,
          newValue: newObj[key],
          type: "added",
        };
      }
    }

    return changes;
  };

  // Toggle debugger visibility
  const toggleDebugger = () => {
    setIsVisible((prev) => !prev);
  };

  // Handle tab change
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Render toggle button when debugger is hidden
  if (!isVisible) {
    return (
      <button
        className="fixed right-6 bottom-6 z-50 px-3 py-2 text-xs rounded-md bg-white text-gray-900 font-medium flex items-center shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={toggleDebugger}
        title="Ctrl+Shift+D aby włączyć/wyłączyć debugger"
      >
        <AppWindowMac className="w-4 h-4 mr-1.5" />
        App Inspector
      </button>
    );
  }

  // Render debugger in split screen mode
  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="font-semibold flex items-center">
          <AppWindowMac className="w-4 h-4 mr-2" />
          App Inspector
          <span className="ml-2 text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-700">v2.0</span>
        </div>
        <div className="flex space-x-1">
          <button
            className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={toggleDebugger}
            title="Ukryj debugger (Ctrl+Shift+D)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center transition-colors ${
              activeTab === "context"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("context")}
          >
            <Database className="w-4 h-4 mr-2" />
            Kontekst
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center transition-colors ${
              activeTab === "logs"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("logs")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Logi zmian {logEntries.length > 0 && `(${logEntries.length})`}
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center transition-colors ${
              activeTab === "scenario"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("scenario")}
          >
            <List className="w-4 h-4 mr-2" />
            Scenariusz
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium flex items-center transition-colors ${
              activeTab === "admin"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("admin")}
          >
            <AppWindowMac className="w-4 h-4 mr-2" />
            Applications
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "context" && (
          <ContextTab
            context={context}
            expandedPaths={expandedPaths}
            setExpandedPaths={setExpandedPaths}
          />
        )}
        {activeTab === "logs" && (
          <LogsTab
            logEntries={logEntries}
            setLogEntries={setLogEntries}
            logContainerRef={logContainerRef}
          />
        )}
        {activeTab === "scenario" && (
          <ScenarioTab
            currentScenario={currentScenario}
            currentWorkspace={currentWorkspace}
          />
        )}
        {activeTab === "admin" && (
          <AppManager />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center">
        <div>Skrót: Ctrl+Shift+D (pokaż/ukryj)</div>
        <div className="flex items-center">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Monitorowanie aktywne
        </div>
      </div>
    </div>
  );
};

export default EnhancedFlowDebugger;