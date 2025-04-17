// src/debug/components/JsonTreeRenderer.jsx
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const JsonTreeRenderer = ({ data, basePath = "", level = 0, expandedPaths, setExpandedPaths }) => {
  // Format JSON values
  const formatValue = (value) => {
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
  const togglePath = (path) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
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
        <span
          onClick={() => togglePath(basePath || "root")}
          className="cursor-pointer text-gray-500 hover:text-gray-800 mr-1"
        >
          {expandedPaths[basePath || "root"] ? (
            <ChevronDown className="w-4 h-4 inline" />
          ) : (
            <ChevronRight className="w-4 h-4 inline" />
          )}
        </span>
        <span className="text-gray-700">{isArray ? "[" : "{"}</span>

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
                    className="text-gray-700 mt-1"
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