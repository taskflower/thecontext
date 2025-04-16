import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * An improved component for displaying and analyzing application context 
 * in the debugger panel with better visualization and navigation
 */
const ContextViewer = () => {
  const { getContext } = useAppStore();
  const [expandedPaths, setExpandedPaths] = useState(new Set<string>());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tree"); // "tree", "table" or "relationships"
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  
  // Get current context
  const context = getContext();
  
  // Reset copied path status after a delay
  useEffect(() => {
    if (copiedPath) {
      const timer = setTimeout(() => {
        setCopiedPath(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedPath]);
  
  // Handle path expansion
  const togglePath = (path: string) => {
    const newPaths = new Set(expandedPaths);
    if (newPaths.has(path)) {
      newPaths.delete(path);
    } else {
      newPaths.add(path);
    }
    setExpandedPaths(newPaths);
  };
  
  // Expand all parent paths to make item visible
  const expandToPath = (path: string) => {
    const parts = path.split('.');
    const newPaths = new Set(expandedPaths);
    
    // Add all parent paths
    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join('.');
      newPaths.add(parentPath);
    }
    
    setExpandedPaths(newPaths);
    setSelectedPath(path);
  };
  
  // Copy path to clipboard
  const copyPathToClipboard = (path: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expansion when clicking copy
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
  };
  
  // Get path value from context
  const getPathValue = (path: string): any => {
    if (!path) return null;
    const parts = path.split('.');
    let current: any = context;
    
    for (const part of parts) {
      if (current === undefined || current === null) return null;
      current = current[part];
    }
    
    return current;
  };
  
  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return `[${value.length} items]`;
      }
      return "{...}";
    }
    return String(value);
  };
  
  // Get value type
  const getValueType = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  // Get type color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string": return "text-green-600";
      case "number": return "text-blue-600";
      case "boolean": return "text-purple-600";
      case "object": return "text-amber-600";
      case "array": return "text-indigo-600";
      default: return "text-gray-600";
    }
  };
  
  // Filter paths based on search term
  const filterPaths = (obj: any, parentPath = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];
    
    const result: string[] = [];
    Object.keys(obj).forEach(key => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      
      // Check if the path contains the search term
      if (currentPath.toLowerCase().includes(searchTerm.toLowerCase())) {
        result.push(currentPath);
        
        // Add parent paths to ensure the path is visible
        let parts = currentPath.split('.');
        while (parts.length > 1) {
          parts.pop();
          result.push(parts.join('.'));
        }
      }
      
      // Check child objects recursively
      if (obj[key] && typeof obj[key] === "object") {
        result.push(...filterPaths(obj[key], currentPath));
      }
    });
    
    return [...new Set(result)];
  };
  
  // List of paths matching the search
  const filteredPaths = searchTerm ? filterPaths(context) : [];
  
  // Get all flattened key-value pairs for table view
  const getFlattenedContext = (): Array<{path: string, value: any, type: string}> => {
    const result: Array<{path: string, value: any, type: string}> = [];
    
    const flatten = (obj: any, currentPath = "") => {
      if (!obj || typeof obj !== "object") return;
      
      Object.entries(obj).forEach(([key, value]) => {
        const path = currentPath ? `${currentPath}.${key}` : key;
        
        // Skip if not matching search
        if (searchTerm && !path.toLowerCase().includes(searchTerm.toLowerCase())) {
          // But still process children - they might match
          if (value && typeof value === "object") {
            flatten(value, path);
          }
          return;
        }
        
        // Add current entry
        result.push({
          path,
          value,
          type: getValueType(value)
        });
        
        // Process nested objects
        if (value && typeof value === "object") {
          flatten(value, path);
        }
      });
    };
    
    flatten(context);
    return result;
  };
  
  // Render tree node (recursive)
  const renderTreeNode = (obj: any, path = "", depth = 0) => {
    if (!obj || typeof obj !== "object") return null;
    
    // Filtered view should only show matching paths and their parents
    const filteredView = searchTerm.length > 0;
    
    return (
      <div className="pl-3" key={path}>
        {Object.entries(obj).map(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          const isExpanded = expandedPaths.has(currentPath);
          const isSelected = selectedPath === currentPath;
          const isObject = value && typeof value === "object";
          const valueType = getValueType(value);
          const typeColor = getTypeColor(valueType);
          
          // Skip items not matching search in filtered view
          if (filteredView && !filteredPaths.includes(currentPath)) {
            // Still render if it's a parent of a match
            const isParentOfMatch = filteredPaths.some(p => 
              p.startsWith(currentPath + '.'));
              
            if (!isParentOfMatch) return null;
          }
          
          return (
            <div key={currentPath} className="my-1 animate-fadein">
              <div 
                className={`
                  flex items-center rounded-md px-1.5 py-1 -mx-1 
                  ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
                  ${isObject ? 'cursor-pointer' : ''}
                `}
                onClick={() => {
                  if (isObject) togglePath(currentPath);
                  setSelectedPath(currentPath);
                }}
              >
                {/* Expand/collapse indicator for objects */}
                <div className="w-4 flex-shrink-0">
                  {isObject && (
                    <svg 
                      className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  )}
                </div>
                
                {/* Key name */}
                <div className="mr-1 font-medium text-blue-700">{key}:</div>
                
                {/* Value display */}
                <div className={`${typeColor} max-w-[200px] truncate`}>
                  {isObject ? (
                    <span>
                      {Array.isArray(value) 
                        ? `Array(${value.length})` 
                        : `Object {${Object.keys(value).length}}`}
                    </span>
                  ) : (
                    <span>
                      {value === null ? (
                        <span className="text-gray-500">null</span>
                      ) : value === undefined ? (
                        <span className="text-gray-500">undefined</span>
                      ) : typeof value === "string" ? (
                        <span>"{value}"</span>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </span>
                  )}
                </div>
                
                {/* Copy button */}
                <button 
                  className={`
                    ml-auto px-1.5 py-0.5 text-xs rounded
                    ${copiedPath === currentPath 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                  `}
                  onClick={(e) => copyPathToClipboard(currentPath, e)}
                >
                  {copiedPath === currentPath ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              {/* Render children when expanded */}
              {isExpanded && isObject && (
                <div className="pl-4 border-l border-gray-200">
                  {renderTreeNode(value, currentPath, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render table view
  const renderTableView = () => {
    const flattened = getFlattenedContext();
    
    if (flattened.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No matching context values
        </div>
      );
    }
    
    return (
      <div className="overflow-auto max-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flattened.map((item, index) => (
              <tr 
                key={index} 
                className={`hover:bg-gray-50 ${selectedPath === item.path ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedPath(item.path)}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                  {item.path}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`${getTypeColor(item.type)} px-2 py-0.5 rounded-full text-xs`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm max-w-[200px] truncate">
                  {typeof item.value === "object" 
                    ? item.type === "array" 
                      ? `[${item.value.length} items]`
                      : `{${Object.keys(item.value).length} keys}`
                    : typeof item.value === "string"
                      ? `"${item.value}"`
                      : String(item.value)
                  }
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  <button
                    className={`text-xs px-2 py-0.5 rounded ${
                      copiedPath === item.path 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPathToClipboard(item.path, e as unknown as React.MouseEvent);
                    }}
                  >
                    {copiedPath === item.path ? 'Copied!' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render relationship view (visual map)
  const renderRelationshipsView = () => {
    // Get top-level keys
    const rootKeys = Object.keys(context);
    
    if (rootKeys.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          Context is empty
        </div>
      );
    }
    
    // Filter by search if needed
    const keysToShow = searchTerm 
      ? rootKeys.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
      : rootKeys;
    
    return (
      <div className="p-4 overflow-auto">
        <div className="flex flex-wrap gap-3">
          {keysToShow.map(key => (
            <div 
              key={key}
              className={`
                border rounded-lg overflow-hidden max-w-xs 
                ${selectedPath === key ? 'border-blue-400 shadow-md' : 'border-gray-200'} 
                hover:shadow-sm transition-shadow
              `}
              onClick={() => setSelectedPath(key)}
            >
              <div className="bg-gray-50 border-b p-2 flex justify-between items-center">
                <h3 className="font-medium text-blue-700">{key}</h3>
                <button
                  className={`text-xs px-2 py-0.5 rounded ${
                    copiedPath === key 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  onClick={(e) => copyPathToClipboard(key, e)}
                >
                  {copiedPath === key ? 'Copied!' : 'Copy Path'}
                </button>
              </div>
              
              <div className="p-2">
                {renderContextCard(context[key], key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper for relationship view
  const renderContextCard = (value: any, path: string) => {
    if (value === null || value === undefined) {
      return <div className="text-gray-500">{String(value)}</div>;
    }
    
    if (typeof value !== "object") {
      return (
        <div className={getTypeColor(typeof value)}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div>
          <div className="text-xs text-gray-500 mb-1">Array [{value.length}]</div>
          <div className="pl-2 border-l-2 border-indigo-200 space-y-1">
            {value.length <= 3 
              ? value.map((item, i) => (
                <div key={i} className="text-sm">
                  {typeof item === "object" 
                    ? `[${typeof item}]` 
                    : String(item)}
                </div>
              ))
              : (
                <>
                  <div>{String(value[0])}</div>
                  <div className="text-gray-400">...</div>
                  <div>{String(value[value.length - 1])}</div>
                </>
              )
            }
          </div>
        </div>
      );
    }
    
    // Object
    const entries = Object.entries(value);
    return (
      <div>
        <div className="text-xs text-gray-500 mb-1">
          Object {`{${entries.length}}`}
        </div>
        <div className="pl-2 border-l-2 border-amber-200 space-y-1">
          {entries.length <= 5 
            ? entries.map(([k, v]) => (
              <div key={k} className="flex text-sm">
                <span className="font-medium mr-1">{k}:</span>
                <span className={getTypeColor(getValueType(v))}>
                  {typeof v === "object" 
                    ? `[${Array.isArray(v) ? 'Array' : 'Object'}]`
                    : typeof v === "string" 
                      ? `"${v.substring(0, 15)}${v.length > 15 ? '...' : ''}"`
                      : String(v)}
                </span>
                <button
                  className="ml-1 text-xs text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    expandToPath(`${path}.${k}`);
                  }}
                >
                  go
                </button>
              </div>
            ))
            : (
              <>
                {entries.slice(0, 3).map(([k, v]) => (
                  <div key={k} className="flex text-sm">
                    <span className="font-medium mr-1">{k}:</span>
                    <span className={getTypeColor(getValueType(v))}>
                      {typeof v === "object" 
                        ? `[${Array.isArray(v) ? 'Array' : 'Object'}]`
                        : String(v)}
                    </span>
                    <button
                      className="ml-1 text-xs text-blue-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        expandToPath(`${path}.${k}`);
                      }}
                    >
                      go
                    </button>
                  </div>
                ))}
                <div className="text-gray-400">...</div>
              </>
            )
          }
        </div>
      </div>
    );
  };
  
  // Render value inspector for selected path
  const renderInspector = () => {
    if (!selectedPath) return null;
    
    const value = getPathValue(selectedPath);
    const type = getValueType(value);
    
    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-2 border-b">
          <h3 className="font-medium">Value Inspector</h3>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="text-gray-500">Path:</div>
            <div className="font-mono text-sm break-all">{selectedPath}</div>
            
            <div className="text-gray-500">Type:</div>
            <div className={getTypeColor(type)}>
              {type}
              {type === "array" && value && ` (${value.length} items)`}
              {type === "object" && value && ` (${Object.keys(value).length} keys)`}
            </div>
            
            <div className="text-gray-500">Value:</div>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
              {type === "object" || type === "array" 
                ? (
                  <pre className="text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) 
                : (
                  <span className={getTypeColor(type)}>
                    {value === null || value === undefined 
                      ? String(value)
                      : type === "string" 
                        ? `"${value}"`
                        : String(value)}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header with search */}
      <div className="flex justify-between p-4 border-b items-center">
        <h3 className="font-bold text-lg">Context Explorer</h3>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search context..."
            className="p-1.5 border border-gray-300 rounded text-sm pr-7 w-52"
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* View tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("tree")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "tree"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "table"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setActiveTab("relationships")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "relationships"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Relationship Map
          </button>
        </div>
      </div>
      
      {/* Search filter indicators */}
      {searchTerm && filteredPaths.length > 0 && (
        <div className="m-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
          Found {filteredPaths.length} matching paths
        </div>
      )}
      
      {/* Main content area */}
      <div className="p-3">
        {Object.keys(context).length === 0 ? (
          <div className="text-center p-8 text-gray-500 italic">
            Context is empty
          </div>
        ) : (
          <div className="overflow-auto">
            {/* Different views based on the active tab */}
            {activeTab === "tree" && (
              <div className="bg-white p-2 rounded max-h-[400px] overflow-auto">
                {renderTreeNode(context)}
              </div>
            )}
            
            {activeTab === "table" && renderTableView()}
            
            {activeTab === "relationships" && renderRelationshipsView()}
            
            {/* Inspector for selected path */}
            {selectedPath && renderInspector()}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="p-3 text-xs text-gray-500 border-t">
        <p>
          Click on objects to expand/collapse. Use search to filter paths.
          The view changes depending on the selected tab.
        </p>
      </div>
    </div>
  );
};

export default ContextViewer;

// Add a bit of animation
const css = `
@keyframes fadein {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
.animate-fadein {
  animation: fadein 0.2s ease-in-out;
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);