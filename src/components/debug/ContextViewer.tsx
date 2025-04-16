// src/components/debug/ContextViewer.tsx
import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ChevronRight, ArrowLeft, X, Copy, Check } from "lucide-react";

// Helper functions
const getValueType = (value: any): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

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

// Copy button component
type CopyButtonProps = {
  path: string;
  copiedPath: string | null;
  setCopiedPath: (path: string) => void;
  className?: string;
  buttonText?: string;
};

const CopyButton: React.FC<CopyButtonProps> = ({ 
  path, 
  copiedPath, 
  setCopiedPath, 
  className = "",
  buttonText = "Copy" 
}) => {
  const copyPathToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
  };
  
  return (
    <button 
      className={`
        px-1.5 py-0.5 text-xs rounded flex items-center
        ${copiedPath === path 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
        ${className}
      `}
      onClick={copyPathToClipboard}
    >
      {copiedPath === path ? (
        <>
          <Check size={12} className="mr-1" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={12} className="mr-1" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

// Context card component
type ContextCardProps = {
  keyName: string;
  value: any;
  path: string;
  isSelected: boolean;
  onClick: () => void;
  copiedPath: string | null;
  setCopiedPath: (path: string) => void;
};

const ContextCard: React.FC<ContextCardProps> = ({
  keyName,
  value,
  path,
  isSelected,
  onClick,
  copiedPath,
  setCopiedPath
}) => {
  const renderCardContent = () => {
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
          <div className="text-gray-500 mb-1">Array [{value.length}]</div>
          <div className="pl-2 border-l-2 border-indigo-200 space-y-1">
            {value.length <= 3 
              ? value.map((item, i) => (
                <div key={i} className="">
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
        <div className="text-gray-500 mb-1">
          Object {`{${entries.length}}`}
        </div>
        <div className="pl-2 border-l-2 border-amber-200 space-y-1">
          {entries.length <= 5 
            ? entries.map(([k, v]) => (
              <div key={k} className="flex">
                <span className="font-medium mr-1">{k}:</span>
                <span className={getTypeColor(getValueType(v))}>
                  {typeof v === "object" 
                    ? `[${Array.isArray(v) ? 'Array' : 'Object'}]`
                    : typeof v === "string" 
                      ? `"${v.substring(0, 15)}${v.length > 15 ? '...' : ''}"`
                      : String(v)}
                </span>
              </div>
            ))
            : (
              <>
                {entries.slice(0, 3).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="font-medium mr-1">{k}:</span>
                    <span className={getTypeColor(getValueType(v))}>
                      {typeof v === "object" 
                        ? `[${Array.isArray(v) ? 'Array' : 'Object'}]`
                        : String(v)}
                    </span>
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
  
  return (
    <div
      className={`
        border rounded-lg overflow-hidden mb-3
        ${isSelected ? 'border-blue-400 shadow-sm' : 'border-gray-200'} 
        hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer
      `}
      onClick={onClick}
    >
      <div className="bg-gray-50 border-b p-2 flex justify-between items-center">
        <h3 className="font-medium text-blue-700">{keyName}</h3>
        <CopyButton
          path={path}
          copiedPath={copiedPath}
          setCopiedPath={setCopiedPath}
          buttonText="Copy Path"
        />
      </div>
      
      <div className="p-2">
        {renderCardContent()}
      </div>
    </div>
  );
};

// Tree view component
type TreeViewProps = {
  data: any;
  path?: string;
  searchTerm: string;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  onTogglePath: (path: string) => void;
  onSelectPath: (path: string) => void;
  copiedPath: string | null;
  setCopiedPath: (path: string) => void;
};

const TreeView: React.FC<TreeViewProps> = ({
  data,
  path = "",
  searchTerm,
  expandedPaths,
  selectedPath,
  onTogglePath,
  onSelectPath,
  copiedPath,
  setCopiedPath
}) => {
  // Filter paths based on search
  const filterPaths = (obj: any, parentPath = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];
    
    const result: string[] = [];
    Object.keys(obj).forEach(key => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      
      if (currentPath.toLowerCase().includes(searchTerm.toLowerCase())) {
        result.push(currentPath);
        
        // Add parent paths
        let parts = currentPath.split('.');
        while (parts.length > 1) {
          parts.pop();
          result.push(parts.join('.'));
        }
      }
      
      if (obj[key] && typeof obj[key] === "object") {
        result.push(...filterPaths(obj[key], currentPath));
      }
    });
    
    return [...new Set(result)];
  };
  
  const filteredPaths = searchTerm ? filterPaths(data) : [];
  const filteredView = searchTerm.length > 0;
  
  if (!data || typeof data !== "object") return null;
  
  return (
    <div className="pl-3">
      {Object.entries(data).map(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        const isExpanded = expandedPaths.has(currentPath);
        const isSelected = selectedPath === currentPath;
        const isObject = value && typeof value === "object";
        const valueType = getValueType(value);
        const typeColor = getTypeColor(valueType);
        
        // Skip items that don't match the search
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
                if (isObject) onTogglePath(currentPath);
                onSelectPath(currentPath);
              }}
            >
              {/* Expand/collapse indicator */}
              <div className="w-4 flex-shrink-0">
                {isObject ? (
                  <ChevronRight 
                    size={14} 
                    className={`text-gray-500 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                  />
                ) : <></>}
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
              <CopyButton
                path={currentPath}
                copiedPath={copiedPath}
                setCopiedPath={setCopiedPath}
                className="ml-auto"
              />
            </div>
            
          
            {(isExpanded && isObject) ? (
              <div className="pl-4 border-l border-gray-200">
                <TreeView
                  data={value}
                  path={currentPath}
                  searchTerm={searchTerm}
                  expandedPaths={expandedPaths}
                  selectedPath={selectedPath}
                  onTogglePath={onTogglePath}
                  onSelectPath={onSelectPath}
                  copiedPath={copiedPath}
                  setCopiedPath={setCopiedPath}
                />
              </div>
            ): <></>}
          </div>
        );
      })}
    </div>
  );
};

// Table view component
type TableViewProps = {
  data: any;
  searchTerm: string;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  copiedPath: string | null;
  setCopiedPath: (path: string) => void;
};

const TableView: React.FC<TableViewProps> = ({
  data,
  searchTerm,
  selectedPath,
  onSelectPath,
  copiedPath,
  setCopiedPath
}) => {
  // Get all flattened key-value pairs
  const getFlattenedData = (): Array<{path: string, value: any, type: string}> => {
    const result: Array<{path: string, value: any, type: string}> = [];
    
    const flatten = (obj: any, currentPath = "") => {
      if (!obj || typeof obj !== "object") return;
      
      Object.entries(obj).forEach(([key, value]) => {
        const path = currentPath ? `${currentPath}.${key}` : key;
        
        // Skip if doesn't match the search
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
    
    flatten(data);
    return result;
  };
  
  const flattened = getFlattenedData();
  
  if (flattened.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No matching context values
      </div>
    );
  }
  
  return (
    <div className="overflow-auto max-h-[300px]">
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
              onClick={() => onSelectPath(item.path)}
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
                <CopyButton
                  path={item.path}
                  copiedPath={copiedPath}
                  setCopiedPath={setCopiedPath}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Value inspector component
type ValueInspectorProps = {
  path: string;
  value: any;
  onBack: () => void;
};

const ValueInspector: React.FC<ValueInspectorProps> = ({ path, value, onBack }) => {
  const type = getValueType(value);
  const rootPath = path.split('.')[0];
  
  return (
    <div className="border rounded-lg overflow-hidden mb-4 animate-fadein">
      <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
        <h3 className="">Value Inspector</h3>
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to list
        </button>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <div className="text-gray-500">Path:</div>
          <div className="font-mono break-all">{path}</div>
          
          <div className="text-gray-500">Root:</div>
          <div className="font-mono break-all">{rootPath}</div>
          
          <div className="text-gray-500">Type:</div>
          <div className={getTypeColor(type)}>
            {type}
            {type === "array" && value && ` (${value.length} items)`}
            {type === "object" && value && ` (${Object.keys(value).length} keys)`}
          </div>
          
          <div className="text-gray-500">Value:</div>
          <div className="font-mono bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
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

// Detailed view component
type DetailedViewProps = {
  path: string;
  value: any;
  onBack: () => void;
  copiedPath: string | null;
  setCopiedPath: (path: string) => void;
};

const DetailedView: React.FC<DetailedViewProps> = ({ 
  path, 
  value, 
  onBack,
  copiedPath,
  setCopiedPath
}) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set<string>());
  
  // Handle expanding a path
  const togglePath = (path: string) => {
    const newPaths = new Set(expandedPaths);
    if (newPaths.has(path)) {
      newPaths.delete(path);
    } else {
      newPaths.add(path);
    }
    setExpandedPaths(newPaths);
  };
  
  // Get the parts of the path
  const pathParts = path.split('.');
  const rootKey = pathParts[0];
  
  return (
    <div className="animate-fadein">
      
      
      <ValueInspector path={path} value={value} onBack={onBack} />
      
      {/* Children values as tree view */}
      {value && typeof value === "object" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 border-b">
            <h3 className="font-medium">Nested properties</h3>
          </div>
          <div className="p-3 max-h-[400px] overflow-auto">
            {Object.keys(value).length > 0 ? (
              <TreeView
                data={{ [pathParts[pathParts.length - 1]]: value }}
                searchTerm=""
                expandedPaths={expandedPaths}
                selectedPath={null}
                onTogglePath={togglePath}
                onSelectPath={() => {}}
                copiedPath={copiedPath}
                setCopiedPath={setCopiedPath}
              />
            ) : (
              <div className="text-gray-500 text-center p-4">
                No properties to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main ContextViewer component
const ContextViewer: React.FC = () => {
  const { getContext, getContextPath } = useAppStore();
  const [expandedPaths, setExpandedPaths] = useState(new Set<string>());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // Get current context
  const context = getContext();
  
  // Reset copied path status after delay
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
  
  // Expand all parent paths to make element visible
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
  
  // Get path value from context
  const getPathValue = (path: string): any => {
    if (!path) return null;
    return getContextPath(path);
  };
  
  // Handle selecting a path
  const handleSelectPath = (path: string) => {
    setSelectedPath(path);
    setShowDetailedView(true);
  };
  
  // Handle going back to card view
  const handleBackToCards = () => {
    setShowDetailedView(false);
  };
  
  // Get root keys
  const rootKeys = Object.keys(context);
  
  // Filter by search if needed
  const keysToShow = searchTerm 
    ? rootKeys.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    : rootKeys;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header with search */}
      <div className="flex justify-between p-3 border-b items-center">
        <h3 className="">Context Viewer</h3>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in context..."
            className="p-1.5 border border-gray-300 rounded text-sm pr-7 w-52"
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Search filter indicators */}
      {searchTerm && (
        <div className="m-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
          Filtering context: "{searchTerm}"
        </div>
      )}
      
      {/* Main content area */}
      <div className="p-3">
        {Object.keys(context).length === 0 ? (
          <div className="text-center p-8 text-gray-500 italic">
            Context is empty
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show either cards or detailed view */}
            {!showDetailedView ? (
              // Cards view - one below another
              <div className="animate-fadein">
                {keysToShow.map(key => (
                  <ContextCard
                    key={key}
                    keyName={key}
                    value={context[key]}
                    path={key}
                    isSelected={selectedPath === key}
                    onClick={() => handleSelectPath(key)}
                    copiedPath={copiedPath}
                    setCopiedPath={setCopiedPath}
                  />
                ))}
                
                {keysToShow.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    No matching context keys found
                  </div>
                )}
              </div>
            ) : selectedPath ? (
              // Detailed view
              <DetailedView 
                path={selectedPath}
                value={getPathValue(selectedPath)}
                onBack={handleBackToCards}
                copiedPath={copiedPath}
                setCopiedPath={setCopiedPath}
              />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="p-3 text-xs text-gray-500 border-t">
        <p>
          Click on cards to view context details. Use the back button to return to the list.
        </p>
      </div>
    </div>
  );
};

export default ContextViewer;

// Add CSS for animations
const css = `
@keyframes fadein {
  from { opacity: 0.5; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadein {
  animation: fadein 0.2s ease-in-out;
}
`;

// Add CSS to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}