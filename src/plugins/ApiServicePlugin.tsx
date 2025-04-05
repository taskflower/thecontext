/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Service Plugin
 * Provides API call capabilities with options
 */
import React, { useState } from 'react';


interface ApiServicePluginProps {
  nodeData: any;
}

const ApiServicePlugin: React.FC<ApiServicePluginProps> = ({ 
  nodeData
}) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Extract plugin data
  const pluginData = nodeData.pluginKey && 
    nodeData.pluginData?.[nodeData.pluginKey] || {};
  
  const {
    buttonText = 'Send API Request',
    apiUrl = 'https://api.example.com/demo',
    autoAdvanceOnSuccess = false,
  } = pluginData;
  
  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - would be real fetch in production
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        status: 'success',
        data: {
          message: 'API request completed successfully',
          timestamp: new Date().toISOString(),
          requestId: `req-${Math.random().toString(36).substring(2, 9)}`
        }
      };
      
      setResponse(JSON.stringify(mockResponse, null, 2));
      
      // Auto-advance to next node if enabled
      if (autoAdvanceOnSuccess) {
        // Would implement auto-advance in production
        console.log('Auto-advance would happen here');
      }
    } catch (err) {
      setError(`API Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="api-service-plugin p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">API Service</h3>
        <div className="text-xs text-gray-500">
          {apiUrl}
        </div>
      </div>
      
      <button
        onClick={handleSendRequest}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white ${
          loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Sending...' : buttonText}
      </button>
      
      {response && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Response:</h4>
          <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-40">
            {response}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

// Register the plugin with the plugin system
// This auto-registration would happen in production
const pluginDefinition = {
  key: 'api-service',
  name: 'API Service',
  description: 'Makes API requests with customizable settings',
  version: '1.0.0',
  component: ApiServicePlugin
};

try {
  // Auto-registration when imported
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      // Access plugin registry in browser environment
      const anyWindow = window as any;
      if (anyWindow.__PLUGIN_REGISTRY__) {
        anyWindow.__PLUGIN_REGISTRY__.registerPlugin(pluginDefinition);
      }
    }
  }, 0);
} catch (error) {
  console.warn('Could not auto-register ApiServicePlugin:', error);
}

export default ApiServicePlugin;