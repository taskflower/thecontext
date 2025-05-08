// src/debug/components/JsonTreeRenderer.tsx
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface JsonTreeRendererProps {
  data: any;
  basePath?: string;
  level?: number;
  expandedPaths: Record<string, boolean>;
  setExpandedPaths: (paths: Record<string, boolean>) => void;
}

export const JsonTreeRenderer: React.FC<JsonTreeRendererProps> = ({ 
  data, 
  basePath = "", 
  level = 0, 
  expandedPaths, 
  setExpandedPaths 
}) => {
  // Format JSON values
  const formatValue = (value: any) => {
    if (value === undefined)
      return <span className="text-gray-400 italic">undefined</span>;
    if (value === null)
      return <span className="text-gray-400 italic">null</span>;

    if (typeof value === "string")
      return <span className="text-green-600">"{value}"</span>;
    if (typeof value === "number")
      return <span className="text-blue-600">{value}</span>;
    if (typeof value === "boolean")
      return (
        <span className="text-purple-600">{value ? "true" : "false"}</span>
      );

    return JSON.stringify(value);
  };

  // Handle expanding/collapsing JSON nodes
  const togglePath = (path: string) => {
    setExpandedPaths({
      ...expandedPaths,
      [path]: !expandedPaths[path],
    });
  };

  if (!data || typeof data !== "object") return formatValue(data);

  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;
  const indentation = level * 16; // 16px for each nesting level

  if (isEmpty) {
    return <span className="text-gray-500">{isArray ? "[]" : "{}"}</span>;
  }

  return (
    <div className="relative">
      <div
        style={{ marginLeft: `${indentation}px` }}
        className="flex items-center"
      >
        <button
          className="h-5 w-5 p-0 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
          onClick={() => togglePath(basePath || "root")}
        >
          {expandedPaths[basePath || "root"] ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        <span className="text-gray-800">{isArray ? "[" : "{"}</span>

        {!expandedPaths[basePath || "root"] && (
          <span className="text-gray-500 ml-1">
            ...{isArray ? "]" : "}"} {Object.keys(data).length}{" "}
            {isArray ? "elements" : "properties"}
          </span>
        )}
      </div>

      {expandedPaths[basePath || "root"] && (
        <div className="pl-6 border-l border-gray-200 ml-2">
          {Object.entries(data).map(([key, value], idx) => {
            const currentPath = basePath ? `${basePath}.${key}` : key;
            const isLastItem = idx === Object.keys(data).length - 1;

            return (
              <div key={key} className="relative py-1">
                <div className="flex flex-wrap items-start">
                  <span className="font-medium text-gray-800 mr-2">
                    {isArray ? `[${key}]` : key}:
                  </span>

                  {typeof value === "object" && value !== null ? (
                    <JsonTreeRenderer 
                      data={value} 
                      basePath={currentPath} 
                      level={level + 1} 
                      expandedPaths={expandedPaths}
                      setExpandedPaths={setExpandedPaths}
                    />
                  ) : (
                    <span>{formatValue(value)}</span>
                  )}
                </div>

                {isLastItem && expandedPaths[basePath || "root"] && (
                  <div
                    style={{ marginLeft: `${indentation}px` }}
                    className="text-gray-800 mt-1"
                  >
                    {isArray ? "]" : "}"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JsonTreeRenderer;