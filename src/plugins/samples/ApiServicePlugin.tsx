/**
 * API Service Plugin
 * A sample plugin that demonstrates API service integration
 */
import React, { useState } from 'react';
import { StepPluginProps, PluginRegistration } from '../types';

/**
 * API Service Step Component
 */
const ApiServiceStepComponent: React.FC<StepPluginProps> = ({
  node,
  data,
  onContinue,
  processTemplate,
  onContextUpdate,
  className = ''
}) => {
  // Plugin state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  // Plugin configuration from node data
  const {
    buttonText = 'Send API Request',
    apiUrl = 'https://api.example.com',
    autoAdvanceOnSuccess = false,
    responseMessage = 'API request completed successfully!'
  } = data || {};
  
  // Handle API request
  const handleApiRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      const response = {
        success: true,
        data: {
          message: responseMessage,
          timestamp: new Date().toISOString()
        }
      };
      
      // Update state
      setResult(response);
      
      // Update context if needed
      if (onContextUpdate && node.contextKey) {
        onContextUpdate(node.contextKey, response);
      }
      
      // Auto-advance if configured
      if (autoAdvanceOnSuccess && onContinue) {
        setTimeout(() => {
          onContinue();
        }, 1000);
      }
    } catch (err) {
      console.error('API request failed:', err);
      setError('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">API Service</h3>
        <div className="text-sm text-gray-500">
          {apiUrl}
        </div>
      </div>
      
      {!result ? (
        <div className="text-center py-4">
          <button
            onClick={handleApiRequest}
            disabled={loading}
            className={`px-4 py-2 rounded-md transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : buttonText}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex items-center text-green-700 mb-2">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Success!</span>
          </div>
          <div className="text-green-800">
            {result.data.message}
          </div>
          <div className="text-xs text-green-600 mt-2">
            {result.data.timestamp}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-200 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * API Service Editor Component
 */
const ApiServiceEditorComponent: React.FC<any> = ({
  node,
  data,
  onNodeUpdate,
}) => {
  // Current plugin data
  const {
    buttonText = 'Send API Request',
    apiUrl = 'https://api.example.com',
    autoAdvanceOnSuccess = false,
    responseMessage = 'API request completed successfully!'
  } = data || {};
  
  // Handle field changes
  const handleChange = (field: string, value: any) => {
    if (onNodeUpdate) {
      // Update node plugin data
      onNodeUpdate({
        pluginData: {
          ...node.pluginData,
          [node.pluginKey]: {
            ...data,
            [field]: value
          }
        }
      });
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium mb-4">API Service Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">API URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => handleChange('apiUrl', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Button Text</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Response Message</label>
          <input
            type="text"
            value={responseMessage}
            onChange={(e) => handleChange('responseMessage', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoAdvance"
            checked={autoAdvanceOnSuccess}
            onChange={(e) => handleChange('autoAdvanceOnSuccess', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
          />
          <label htmlFor="autoAdvance" className="ml-2 text-sm">
            Auto-advance on success
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Plugin Registration
 */
export const apiServicePlugin: PluginRegistration = {
  manifest: {
    id: 'api-service',
    name: 'API Service',
    description: 'Provides API service integration for flow steps',
    version: '1.0.0',
    author: 'Context App Team',
    type: 'step',
    hookPoints: []
  },
  components: {
    StepComponent: ApiServiceStepComponent,
    EditorComponent: ApiServiceEditorComponent
  }
};

export default apiServicePlugin;