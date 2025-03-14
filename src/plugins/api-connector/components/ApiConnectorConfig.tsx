// src/plugins/api-connector/components/ApiConnectorConfig.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PluginComponentProps } from '../../PluginInterface';

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

export default ApiConnectorConfig;