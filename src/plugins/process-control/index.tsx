// src/plugins/process-control/index.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// Import tylko typu PluginProcessInput i PluginProcessResult
import type { PluginProcessInput, PluginProcessResult } from '../PluginInterface';

// Komponenty pluginu
const ProcessControlView = ({ config, onConfigChange }) => {
  const [waiting, setWaiting] = useState(true);
  const [result, setResult] = useState('Process paused. Click button to continue.');

  const buttonText = config.buttonText || 'Continue Process';

  const handleContinue = () => {
    setWaiting(false);
    setResult('Process continued!');
    
    // Signal that the process can continue
    if (onConfigChange) {
      onConfigChange({
        ...config,
        processContinued: true
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        {result}
      </div>
      
      {waiting && (
        <Button onClick={handleContinue} className="w-full">
          {buttonText}
        </Button>
      )}
      
      {!waiting && (
        <div className="text-green-600 font-semibold text-center">
          Process is now running...
        </div>
      )}
    </div>
  );
};

const ProcessControlConfig = ({ config, onConfigChange }) => {
  const handleButtonTextChange = (e) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        buttonText: e.target.value
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Process Control Settings</h3>
      
      <div>
        <label htmlFor="buttonText" className="block mb-1">Button Text:</label>
        <input
          type="text"
          id="buttonText"
          value={config.buttonText || 'Continue Process'}
          onChange={handleButtonTextChange}
          className="border rounded p-2 w-full"
        />
      </div>
    </div>
  );
};

const ProcessControlResult = ({ config }) => {
  const status = config.processContinued ? 'Completed' : 'Waiting';
  
  return (
    <div className="p-4 text-center">
      <div className={`inline-block px-3 py-1 rounded-full ${
        status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        Status: {status}
      </div>
      <p className="mt-2 text-gray-600">
        {status === 'Completed' 
          ? 'Process has been continued by user.' 
          : 'Waiting for user to continue the process.'}
      </p>
    </div>
  );
};

// Funkcja przetwarzania
const processNode = (params: PluginProcessInput): PluginProcessResult => {
  const { input, config } = params;
  
  // Check if the process can continue
  const canContinue = config.processContinued === true;
  
  if (!canContinue) {
    // Return a special result to indicate process should be paused
    return {
      output: "Process paused. Waiting for user confirmation.",
      result: {
        status: 'waiting',
        message: 'Process is waiting for user to click the continue button.'
      }
    };
  }
  
  // Process can continue
  return {
    output: input,
    result: {
      status: 'completed',
      message: 'Process continued successfully.'
    }
  };
};

// Eksport pluginu
export default {
  id: 'process-control',
  name: 'Process Control',
  description: 'Stops the process and waits for user confirmation',
  version: '1.0.0',
  activateByDefault: true,
  defaultConfig: {
    buttonText: 'Continue Process'
  },
  ViewComponent: ProcessControlView,
  ConfigComponent: ProcessControlConfig,
  ResultComponent: ProcessControlResult,
  processNode
};