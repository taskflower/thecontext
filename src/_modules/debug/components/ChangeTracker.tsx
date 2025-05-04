// src/_modules/debug/components/ChangeTracker.tsx
import React from "react";

interface ChangeEntry {
  oldValue: any;
  newValue: any;
  type: "added" | "removed" | "modified";
}

interface ChangeTrackerProps {
  changes: Record<string, ChangeEntry>;
}

export const ChangeTracker: React.FC<ChangeTrackerProps> = ({ changes }) => {
  const getBadgeClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-100 text-green-800";
      case "removed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "added":
        return "DODANO";
      case "removed":
        return "USUNIĘTO";
      default:
        return "ZMIENIONO";
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(changes).map(([path, { oldValue, newValue, type }], index) => (
        <div key={path} className="space-y-2">
          {index > 0 && <div className="border-t border-gray-200 my-3"></div>}
          
          <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium mr-2 ${getBadgeClass(type)}`}>
              {getTypeLabel(type)}
            </span>
            <code className="text-sm font-mono break-all">{path}</code>
          </div>

          {type !== "added" && (
            <div className="ml-6 p-2 bg-red-50 rounded-md border border-red-100 relative">
              <div className="absolute -left-3 top-2 w-2 h-2 bg-red-400 rounded-full"></div>
              <pre className="text-xs font-mono break-all overflow-auto max-h-20">
                {typeof oldValue === "object"
                  ? JSON.stringify(oldValue, null, 2)
                  : String(oldValue)}
              </pre>
            </div>
          )}

          {type !== "removed" && (
            <div className="ml-6 p-2 bg-green-50 rounded-md border border-green-100 relative">
              <div className="absolute -left-3 top-2 w-2 h-2 bg-green-400 rounded-full"></div>
              <pre className="text-xs font-mono break-all overflow-auto max-h-20">
                {typeof newValue === "object"
                  ? JSON.stringify(newValue, null, 2)
                  : String(newValue)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChangeTracker;