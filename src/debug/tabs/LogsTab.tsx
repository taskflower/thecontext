// src/debug/tabs/LogsTab.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Trash } from 'lucide-react';
import { useFlowStore } from '../../core/context';

interface LogEntry {
  timestamp: Date;
  type: 'add' | 'update' | 'remove';
  path: string;
  oldValue?: any;
  newValue?: any;
  source?: 'memory' | 'storage'; // Track source of change
}

const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { data: contextData } = useFlowStore();
  const prevContextRef = useRef<Record<string, any>>({});
  const prevStorageRef = useRef<Record<string, any>>({});

  // Helper function to find changes between two objects
  const findChanges = (oldObj: any, newObj: any, basePath = '', source: 'memory' | 'storage' = 'memory') => {
    const changes: LogEntry[] = [];
    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {})
    ]);

    allKeys.forEach(key => {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];
      
      // Skip if values are identical
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        return;
      }
      
      // Handle nested objects (but avoid circular references)
      if (
        typeof oldValue === 'object' && oldValue !== null &&
        typeof newValue === 'object' && newValue !== null &&
        !Array.isArray(oldValue) && !Array.isArray(newValue)
      ) {
        changes.push(...findChanges(oldValue, newValue, currentPath, source));
        return;
      }
      
      // Determine type of change
      if (oldValue === undefined) {
        changes.push({
          timestamp: new Date(),
          type: 'add',
          path: currentPath,
          newValue,
          source
        });
      } else if (newValue === undefined) {
        changes.push({
          timestamp: new Date(),
          type: 'remove',
          path: currentPath,
          oldValue,
          source
        });
      } else {
        changes.push({
          timestamp: new Date(),
          type: 'update',
          path: currentPath,
          oldValue,
          newValue,
          source
        });
      }
    });
    
    return changes;
  };

  // Track context changes and store in memory (without persistence)
  useEffect(() => {
    // Skip first render
    if (Object.keys(prevContextRef.current).length === 0) {
      prevContextRef.current = JSON.parse(JSON.stringify(contextData));
      return;
    }
    
    // Find changes
    const changes = findChanges(prevContextRef.current, contextData, '', 'memory');
    
    // Add changes to in-memory logs
    if (changes.length > 0) {
      setLogs(prev => [...changes, ...prev].slice(0, 100)); // Keep last 100 logs
    }
    
    // Update previous context
    prevContextRef.current = JSON.parse(JSON.stringify(contextData));
  }, [contextData]);

  // Listen for localStorage changes
  useEffect(() => {
    // Function to handle storage events (from other tabs)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'flow-storage' && event.newValue) {
        processStorageChange(event.newValue);
      }
    };

    // Function to process storage changes
    const processStorageChange = (newValueStr: string) => {
      try {
        // Parse the new storage value
        const newStorageData = JSON.parse(newValueStr).state.data;
        
        // Get the old storage value
        const oldStorageData = prevStorageRef.current;
        
        // Find changes
        const changes = findChanges(oldStorageData, newStorageData, '', 'storage');
        
        // Add changes to logs
        if (changes.length > 0) {
          setLogs(prev => [...changes, ...prev].slice(0, 100)); // Keep last 100 logs
        }
        
        // Update previous storage ref
        prevStorageRef.current = JSON.parse(JSON.stringify(newStorageData));
      } catch (error) {
        console.error('Error parsing localStorage change:', error);
      }
    };

    // Initialize previous storage ref
    try {
      const storedData = localStorage.getItem('flow-storage');
      if (storedData) {
        prevStorageRef.current = JSON.parse(storedData).state.data;
      }
    } catch (error) {
      console.error('Error reading initial localStorage value:', error);
    }

    // Add event listener for other tabs
    window.addEventListener('storage', handleStorageEvent);
    
    // Create a proxy to detect same-tab localStorage changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      // Call original function
      originalSetItem.apply(this, [key, value]);
      
      // Process change if it's our flow-storage
      if (key === 'flow-storage') {
        processStorageChange(value);
      }
    };
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      // Restore original localStorage.setItem
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Clear logs
  const clearLogs = () => setLogs([]);

  // Render a single log entry
  const renderValue = (value: any) => {
    if (value === undefined) return <span className="text-gray-400 italic">undefined</span>;
    if (value === null) return <span className="text-gray-400 italic">null</span>;
    
    if (typeof value === 'string') return <span className="text-green-600">"{value}"</span>;
    if (typeof value === 'number') return <span className="text-blue-600">{value}</span>;
    if (typeof value === 'boolean') return <span className="text-purple-600">{value ? "true" : "false"}</span>;
    
    // For arrays and objects, show a preview
    if (typeof value === 'object') {
      const isArray = Array.isArray(value);
      const preview = isArray 
        ? `Array(${value.length})` 
        : `Object(${Object.keys(value).length})`;
      return <span className="text-yellow-600">{preview}</span>;
    }
    
    return String(value);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
    });
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Context Changes Log</h2>
        <button
          className="px-2 py-1 text-xs text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100 flex items-center"
          onClick={clearLogs}
        >
          <Trash className="w-3 h-3 mr-1" />
          Clear logs
        </button>
      </div>
      
      <div className="border rounded-md overflow-hidden flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="p-4 text-gray-500 italic text-center">
            No context changes detected yet
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{formatTime(log.timestamp)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      log.type === 'add' ? 'bg-green-100 text-green-800' :
                      log.type === 'remove' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      log.source === 'memory' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {log.source || 'memory'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{log.path}</td>
                  <td className="px-3 py-2 text-xs max-w-xs truncate">
                    {log.type !== 'add' && renderValue(log.oldValue)}
                  </td>
                  <td className="px-3 py-2 text-xs max-w-xs truncate">
                    {log.type !== 'remove' && renderValue(log.newValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogsTab;