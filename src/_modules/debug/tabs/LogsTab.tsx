// src/_modules/debug/tabs/LogsTab.tsx
import React from "react";
import { RefreshCw, Clock, Trash2 } from "lucide-react";
import ChangeTracker from "../components/ChangeTracker";

interface LogEntry {
  id: number;
  timestamp: Date;
  changes: Record<string, any>;
  type: string;
}

interface LogsTabProps {
  logEntries: LogEntry[];
  setLogEntries: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  logContainerRef: React.RefObject<HTMLDivElement>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ 
  logEntries, 
  setLogEntries, 
  logContainerRef 
}) => {
  // Time formatting
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + `.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <div className="p-4 h-full overflow-hidden">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-800">
            Historia zmian kontekstu
          </h3>
          <button 
            onClick={() => setLogEntries([])}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs flex items-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Wyczyść logi
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4" ref={logContainerRef}>
          {logEntries.length === 0 ? (
            <div className="flex items-center justify-center h-full rounded-md border border-gray-200 p-8 text-center">
              <div className="space-y-2">
                <RefreshCw className="w-6 h-6 mx-auto text-gray-400" />
                <p className="text-gray-500">Brak zmian do wyświetlenia</p>
                <p className="text-xs text-gray-400">
                  Zmiany w kontekście będą pojawiać się tutaj automatycznie
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {logEntries
                .slice()
                .reverse()
                .map((entry) => (
                  <div 
                    key={entry.id} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                            Zmiana kontekstu
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <ChangeTracker changes={entry.changes} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTab;