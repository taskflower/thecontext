// src/plugins/api-connector/components/ApiConnectorView.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';
import { useNodeStore } from '@/stores/nodeStore';
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
  
  const { user } = useAuthState(); // Get current user from auth state
  
  const buttonText = config?.buttonText || 'Send API Request';
  const apiUrl = config?.apiUrl || '/api/v1/services/chat/completion';

  // Helper to signal completion
  const signalCompletion = (message: string, wasSuccessful: boolean) => {
    console.log('API Connector: signalCompletion config before update:', JSON.stringify(config));
    console.log('API Connector: Signaling completion with message:', message);
    
    // Przygotuj zaktualizowaną konfigurację
    const updatedConfig = {
      ...config,
      requestSent: true,
      requestSuccessful: wasSuccessful,
      completionMessage: message
    };
    
    // Jeśli mamy nodeId, aktualizuj bezpośrednio stan węzła
    if (nodeId) {
      console.log('API Connector: Aktualizuję stan węzła bezpośrednio:', nodeId);
      useNodeStore.getState().updateNodePluginConfig(nodeId, updatedConfig);
    }
    
    // Update plugin state
    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }
    
    // Signal execution component
    if (onProcessComplete) {
      console.log('API Connector: Wywołuję onProcessComplete z:', message);
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
      
      console.log('API Connector: Sending request with payload:', payload);
      
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
      console.log('API Connector: Received response:', data);
      
      // Extract the actual LLM content from the response
      const llmContent = data.data?.message?.content || "Brak odpowiedzi";
      
      console.log('API Connector: Extracted LLM content:', llmContent);
      
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