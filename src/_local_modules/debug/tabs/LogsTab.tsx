// src/debug/tabs/LogsTab.jsx

import { RefreshCw, Clock, Trash2 } from "lucide-react";
import ChangeTracker from "../components/ChangeTracker";


export const LogsTab = ({ logEntries, setLogEntries, logContainerRef }:any) => {
  // Time formatting
  const formatTime = (date:any) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      millisecond: true,
      hour12: false,
    });
  };

  return (
    <div className="p-3 h-full overflow-hidden flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Historia zmian kontekstu
        </h3>
        <button
          onClick={() => setLogEntries([])}
          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs flex items-center"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Wyczyść logi
        </button>
      </div>

      <div
        ref={logContainerRef}
        className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto flex-grow"
      >
        {logEntries.length === 0 ? (
          <div className="text-gray-500 italic flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <p>Brak zmian do wyświetlenia</p>
              <p className="text-xs mt-1">
                Zmiany w kontekście będą pojawiać się tutaj automatycznie
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {logEntries
              .slice()
              .reverse()
              .map((entry:any) => (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        Zmiana kontekstu
                      </span>
                      <span className="ml-2 text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <ChangeTracker changes={entry.changes} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsTab;