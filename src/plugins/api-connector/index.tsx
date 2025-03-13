// src/plugins/api-connector/index.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';

// Import types
import type { PluginProcessInput, PluginProcessResult, PluginComponentProps } from '../PluginInterface';

interface ApiConnectorViewProps extends PluginComponentProps {
  onProcessComplete?: (output: string) => void;
}

// Plugin components
const ApiConnectorView: React.FC<ApiConnectorViewProps> = ({ 
  config, 
  onConfigChange,
  onProcessComplete 
}) => {
  const [waiting, setWaiting] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('API request paused. Click button to send request.');
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthState(); // Get current user from auth state
  
  const buttonText = config?.buttonText || 'Send API Request';
  const apiUrl = config?.apiUrl || '/api/v1/services/chat/completion';

  // Helper to signal completion
  const signalCompletion = (message: string, wasSuccessful: boolean) => {
    // Update plugin state
    if (onConfigChange) {
      onConfigChange({
        ...config,
        requestSent: true,
        requestSuccessful: wasSuccessful,
        completionMessage: message
      });
    }
    
    // Signal execution component
    if (onProcessComplete) {
      onProcessComplete(message);
    }
  };

  const handleSendRequest = async () => {
    if (!user) {
      setError('User not authenticated. Cannot send request without authentication token.');
      return;
    }
    
    setWaiting(false);
    setProcessing(true);
    setError(null);
    
    try {
      // Get the authentication token using authService
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      
      // Get the node data to access the prompt
      const nodeResponse = config?.nodeResponse || '';
      const nodePrompt = config?.nodePrompt || '';
      
      // Prepare request payload according to the specified format
      const payload = {
        messages: [
          { role: "assistant", content: nodePrompt },
          { role: "user", content: nodeResponse }
        ],
        userId: user.uid || "user123" // Use actual user ID if available
      };
      
      // Get API URL from environment or config 
      const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const endpoint = apiUrl.startsWith('http') ? apiUrl : `${baseApiUrl}${apiUrl.startsWith('/') ? '' : '/'}${apiUrl}`;
      
      // Send the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Update UI and signal completion
      setProcessing(false);
      setResult(`Request completed successfully!\nResponse: ${JSON.stringify(data)}`);
      signalCompletion(`API request completed. Response: ${JSON.stringify(data)}`, true);
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : String(err);
      setProcessing(false);
      setError(errorMessage);
      setResult('Request failed. See error details.');
      signalCompletion(`API request failed: ${errorMessage}`, false);
    }
  };

  return (
    <div className="space-y-4">
      {waiting ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          {result}
        </div>
      ) : processing ? (
        <div className="p-6 flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p>Sending API request...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="font-semibold text-red-700">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
      
      {waiting && (
        <Button onClick={handleSendRequest} className="w-full">
          {buttonText}
        </Button>
      )}
      
      {!waiting && !processing && !error && (
        <div className="text-green-600 font-semibold text-center">
          API request completed
        </div>
      )}
      
      {!waiting && !processing && error && (
        <Button onClick={handleSendRequest} className="w-full">
          Retry Request
        </Button>
      )}
    </div>
  );
};

const ApiConnectorConfig: React.FC<PluginComponentProps> = ({ config, onConfigChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (onConfigChange) {
      onConfigChange({
        ...config,
        [name]: value
      });
    }
  };

  const handleResetState = () => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        requestSent: false,
        requestSuccessful: false,
        completionMessage: ''
      });
    }
  };

  // Get base API URL from environment
  const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">API Connector Settings</h3>
      
      <div className="mb-2 text-xs text-gray-500">
        Base API URL: {baseApiUrl}
      </div>
      
      <div>
        <label htmlFor="apiUrl" className="block mb-1 text-sm">API Endpoint Path:</label>
        <Input
          type="text"
          id="apiUrl"
          name="apiUrl"
          value={config?.apiUrl || '/api/v1/services/chat/completion'}
          onChange={handleInputChange}
          className="w-full"
          placeholder="e.g., /api/v1/services/chat/completion"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter just the path (e.g., /api/v1/services/chat/completion) or a full URL if connecting to a different service
        </p>
      </div>
      
      <div>
        <label htmlFor="buttonText" className="block mb-1 text-sm">Button Text:</label>
        <Input
          type="text"
          id="buttonText"
          name="buttonText"
          value={config?.buttonText || 'Send API Request'}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      
      {config?.requestSent && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetState}
            className="text-amber-600 border-amber-300"
          >
            Reset Request State
          </Button>
          <p className="text-xs text-slate-500 mt-1">
            This will reset the request state, allowing you to send another request in the next execution.
          </p>
        </div>
      )}
    </div>
  );
};

const ApiConnectorResult: React.FC<PluginComponentProps> = ({ config }) => {
  let status = 'Not Sent';
  if (config?.requestSent) {
    status = config?.requestSuccessful ? 'Success' : 'Failed';
  }
  
  return (
    <div className="p-4 text-center">
      <div className={`inline-block px-3 py-1 rounded-full ${
        status === 'Success' 
          ? 'bg-green-100 text-green-800' 
          : status === 'Failed'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
      }`}>
        Status: {status}
      </div>
      <p className="mt-2 text-gray-600">
        {config?.requestSent 
          ? config?.completionMessage || 'Request has been processed.' 
          : 'API request has not been sent yet.'}
      </p>
    </div>
  );
};

// Processing function for execution flow
const processNode = async (params: PluginProcessInput): Promise<PluginProcessResult> => {
  const { input, config, node } = params;
  
  // Store the input message and prompt for use in the API request
  const updatedConfig = {
    ...config,
    nodeResponse: input,
    nodePrompt: node?.data?.processedPrompt || node?.data?.prompt || ''
  };
  
  // Check if the request should continue immediately
  const canContinue = config?.requestSent === true;
  
  if (!canContinue) {
    // Return a special result to indicate process should be paused
    return {
      output: "API request pending. Waiting for user action.",
      result: {
        status: 'waiting',
        message: 'Process is waiting for user to send the API request.',
        requiresUserAction: true,
        config: updatedConfig
      }
    };
  }
  
  // Process can continue, pass through the input
  return {
    output: input,
    result: {
      status: 'completed',
      message: config?.completionMessage || 'API request completed.',
      requiresUserAction: false
    }
  };
};

// Plugin export
export default {
  id: 'api-connector',
  name: 'API Connector',
  description: 'Sends data from the node to an API endpoint with authentication',
  version: '1.0.0',
  activateByDefault: true,
  defaultConfig: {
    buttonText: 'Send API Request',
    apiUrl: '/api/v1/services/chat/completion',
    requestSent: false,
    requestSuccessful: false
  },
  ViewComponent: ApiConnectorView,
  ConfigComponent: ApiConnectorConfig,
  ResultComponent: ApiConnectorResult,
  processNode
};