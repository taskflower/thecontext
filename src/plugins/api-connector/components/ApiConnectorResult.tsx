// src/plugins/api-connector/components/ApiConnectorResult.tsx
import React from 'react';
import type { PluginComponentProps } from '../../PluginInterface';

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

export default ApiConnectorResult;