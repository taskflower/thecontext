// src/debug/EnhancedFlowDebugger.jsx
import { useState, useEffect, useRef } from "react";
import { RefreshCw, Clock, List, Database, EyeOff } from "lucide-react";
import ContextTab from "./tabs/ContextTab";
import LogsTab from "./tabs/LogsTab";
import ScenarioTab from "./tabs/ScenarioTab";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useContextStore } from "@/hooks/useContextStore";

export const EnhancedFlowDebugger = () => {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem("debuggerVisible") === "true"
  );
  const [context, setContext] = useState({});
  const [logEntries, setLogEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("context"); // 'context', 'logs', 'scenario'
  const [expandedPaths, setExpandedPaths] = useState({});
  const { getCurrentScenario, getCurrentWorkspace } = useWorkspaceStore();
  const { getContext } = useContextStore();
  const prevContextRef = useRef({});
  const logContainerRef = useRef(null);
  const currentScenario = getCurrentScenario();
  const currentWorkspace = getCurrentWorkspace();

  // Context change tracking
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentContext = getContext();
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
  }, [getContext]);

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
  const findChanges = (oldObj, newObj, path = "") => {
    const changes = {};

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

  // Render toggle button when debugger is hidden
  if (!isVisible) {
    return (
      <button
        className="fixed right-3 bottom-3 z-50 px-3 py-2 text-xs rounded-md bg-gray-600 text-white font-medium flex items-center shadow-md hover:bg-gray-700 transition-colors"
        onClick={toggleDebugger}
        title="Ctrl+Shift+D aby włączyć/wyłączyć debugger"
      >
        <Database className="w-4 h-4 mr-1.5" />
        Debugger
      </button>
    );
  }

  // Render debugger in split screen mode
  return (
    <div className="fixed top-0 right-0 z-40 w-1/2 h-full bg-white border-l border-gray-300 shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 flex justify-between items-center">
        <div className="font-semibold flex items-center">
          <Database className="w-4 h-4 mr-2" />
          Flow Debugger
          <span className="text-xs bg-blue-900 px-2 py-0.5 rounded ml-2">
            v1.2
          </span>
        </div>
        <div className="flex space-x-1">
          {/* Buttons */}
          <button
            onClick={toggleDebugger}
            className="p-1 rounded hover:bg-blue-700"
            title="Ukryj debugger (Ctrl+Shift+D)"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-100">
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === "context"
              ? "bg-white text-blue-700 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("context")}
        >
          <Database className="w-4 h-4 mr-1.5" />
          Kontekst
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === "logs"
              ? "bg-white text-blue-700 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("logs")}
        >
          <Clock className="w-4 h-4 mr-1.5" />
          Logi zmian {logEntries.length > 0 && `(${logEntries.length})`}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === "scenario"
              ? "bg-white text-blue-700 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("scenario")}
        >
          <List className="w-4 h-4 mr-1.5" />
          Scenariusz
        </button>
      </div>

      {/* Active tab content */}
      <div className="flex-grow overflow-hidden">
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
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center">
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
