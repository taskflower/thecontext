// src/plugins/api-connector/components/ApiConnectorView.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import { useNodeStore } from '@/stores/nodeStore';
import { apiConnectorService } from '../services/apiConnectorService';
import type { PluginComponentProps } from '../../PluginInterface';

interface ApiConnectorViewProps extends PluginComponentProps {
  onProcessComplete?: (output: string) => void;
}

const ApiConnectorView: React.FC<ApiConnectorViewProps> = ({ 
  config, 
  onConfigChange,
  onProcessComplete,
  nodeId
}) => {
  const [waiting, setWaiting] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('API request paused. Click button to send request.');
  const [error, setError] = useState<string | null>(null);
  const [customContent, setCustomContent] = useState('');
  
  const { user } = useAuthState(); // Get current user from auth state
  
  const buttonText = config?.buttonText || 'Send API Request';
  const apiUrl = config?.apiUrl || '/api/v1/services/chat/completion';
  const showContentInput = config?.showContentInput || false;

  // Helper to signal completion
  const signalCompletion = (message: string, wasSuccessful: boolean) => {
    console.log('API Connector: signalCompletion config before update:', JSON.stringify(config));
    console.log('API Connector: Signaling completion with message:', message);
    
    // Prepare updated configuration
    const updatedConfig = {
      ...config,
      requestSent: true,
      requestSuccessful: wasSuccessful,
      completionMessage: message
    };
    
    // If we have nodeId, update node state directly
    if (nodeId) {
      console.log('API Connector: Updating node state directly:', nodeId);
      useNodeStore.getState().updateNodePluginConfig(nodeId, updatedConfig);
    }
    
    // Update plugin state
    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }
    
    // Signal execution component
    if (onProcessComplete) {
      console.log('API Connector: Calling onProcessComplete with:', message);
      onProcessComplete(message);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomContent(e.target.value);
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
      const nodeResponse = config?.nodeResponse || '';
      const nodePrompt = config?.nodePrompt || '';
      
      // Use custom content if available and enabled, otherwise use node prompt
      const requestContent = showContentInput && customContent ? customContent : nodePrompt;
      
      // Use the API Connector Service
      const llmContent = await apiConnectorService.sendLlmRequest(
        requestContent,
        nodeResponse,
        apiUrl,
        user.uid
      );
      
      // Update UI and signal completion with the actual LLM response
      setProcessing(false);
      setResult(`Request completed successfully!\nResponse: ${llmContent}`);

      console.log('API Connector: Updated config after API call:', JSON.stringify({
        ...config,
        requestSent: true,
        requestSuccessful: true,
        completionMessage: llmContent
      }));
      
      // This is the key change - pass the actual LLM content as the output
      signalCompletion(llmContent, true);
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('API Connector: Error during request:', errorMessage);
      setProcessing(false);
      setError(errorMessage);
      setResult('Request failed. See error details.');
      signalCompletion(`API request failed: ${errorMessage}`, false);
    }
  };

  return (
    <div className="space-y-4">
      {showContentInput && waiting && (
        <div className="mb-4">
          <label htmlFor="customContent" className="block mb-1 text-sm font-medium">
            Enter content for the API request:
          </label>
          <Textarea
            id="customContent"
            value={customContent}
            onChange={handleContentChange}
            placeholder="Enter your content here..."
            className="w-full min-h-32"
          />
        </div>
      )}
      
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

export default ApiConnectorView;