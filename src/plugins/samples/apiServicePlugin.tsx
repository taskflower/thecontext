/**
 * API Service Plugin
 * Sample plugin for interacting with external APIs
 */
import React, { useState } from 'react';
import { PluginRegistration, StepPluginProps } from '../types';

/**
 * API Service Step Component
 * Displays a button for triggering API calls
 */
const ApiServiceStepComponent: React.FC<StepPluginProps> = ({
  data = {},
  onContinue,
  onContextUpdate,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Extract plugin configuration from data
  const {
    buttonText = 'Execute API Call',
    apiUrl = 'https://api.example.com',
    autoAdvanceOnSuccess = false,
    responseMessage = 'API call completed successfully'
  } = data;
  
  // Handle API call
  const handleApiCall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would make an actual API call
      // For demo purposes, we simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate API response
      const simulatedResponse = {
        success: true,
        data: {
          message: responseMessage,
          timestamp: new Date().toISOString()
        }
      };
      
      // Set the result
      setResult(simulatedResponse);
      
      // Update context if a handler is provided
      if (onContextUpdate) {
        onContextUpdate('api_result', simulatedResponse);
      }
      
      // Auto-advance if enabled
      if (autoAdvanceOnSuccess && onContinue) {
        setTimeout(onContinue, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="mb-3">
        <button
          onClick={handleApiCall}
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : buttonText}
        </button>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="text-sm text-gray-600 flex items-center">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Executing API call...
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
          Error: {error}
        </div>
      )}
      
      {/* Result display */}
      {result && !loading && (
        <div className="mt-2 p-3 bg-green-50 rounded text-green-800">
          <div className="font-medium">Success!</div>
          <div className="text-sm mt-1">{result.data.message}</div>
          <div className="text-xs text-green-600 mt-1">
            Timestamp: {result.data.timestamp}
          </div>
        </div>
      )}
      
      {/* API URL display */}
      <div className="mt-3 text-xs text-gray-500">
        API URL: {apiUrl}
      </div>
    </div>
  );
};

/**
 * API Service Plugin Registration
 */
export const apiServicePlugin: PluginRegistration = {
  manifest: {
    id: 'api-service',
    name: 'API Service',
    description: 'A plugin for making API calls',
    version: '1.0.0',
    author: 'Context App Team',
    type: 'step',
  },
  components: {
    StepComponent: ApiServiceStepComponent
  }
};

export default apiServicePlugin;