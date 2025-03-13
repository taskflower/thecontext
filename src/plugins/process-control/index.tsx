// src/plugins/process-control/index.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

// Import only the type for PluginProcessInput and PluginProcessResult
import type { PluginProcessInput, PluginProcessResult, PluginComponentProps } from '../PluginInterface';


interface ProcessControlViewProps extends PluginComponentProps {
  onProcessComplete?: (output: string) => void;
}

// Plugin components
const ProcessControlView: React.FC<ProcessControlViewProps> = ({ 
  config, 
  onConfigChange,
  onProcessComplete 
}) => {
  const [waiting, setWaiting] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('Process paused. Click button to continue.');


  const buttonText = config?.buttonText || 'Continue Process';

  // Helper to signal completion
  const signalCompletion = (message: string) => {
    // Update plugin state
    if (onConfigChange) {
      onConfigChange({
        ...config,
        processContinued: true,
        completionMessage: message
      });
    }
    
    // Signal execution component
    if (onProcessComplete) {
      onProcessComplete(message);
    }
  };

  const handleContinue = async () => {
    setWaiting(false);
    setProcessing(true);
    
    // Simulate some processing time
    setTimeout(() => {
      setProcessing(false);
      setResult('Process continued successfully!');
      
      // Signal that the process can continue
      signalCompletion('Process continued by user action');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {waiting ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          {result}
        </div>
      ) : processing ? (
        <div className="p-6 flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p>Processing...</p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          {result}
        </div>
      )}
      
      {waiting && (
        <Button onClick={handleContinue} className="w-full">
          {buttonText}
        </Button>
      )}
      
      {!waiting && !processing && (
        <div className="text-green-600 font-semibold text-center">
          Process is now continuing...
        </div>
      )}
    </div>
  );
};

const ProcessControlConfig: React.FC<PluginComponentProps> = ({ config, onConfigChange }) => {
  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        buttonText: e.target.value
      });
    }
  };

  const handleResetProcess = () => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        processContinued: false
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Process Control Settings</h3>
      
      <div>
        <label htmlFor="buttonText" className="block mb-1 text-sm">Button Text:</label>
        <input
          type="text"
          id="buttonText"
          value={config?.buttonText || 'Continue Process'}
          onChange={handleButtonTextChange}
          className="border rounded p-2 w-full"
        />
      </div>
      
      {config?.processContinued && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetProcess}
            className="text-amber-600 border-amber-300"
          >
            Reset Process State
          </Button>
          <p className="text-xs text-slate-500 mt-1">
            This will reset the process state, requiring user confirmation again in the next execution.
          </p>
        </div>
      )}
    </div>
  );
};

const ProcessControlResult: React.FC<PluginComponentProps> = ({ config }) => {
  const status = config?.processContinued ? 'Completed' : 'Waiting';
  
  return (
    <div className="p-4 text-center">
      <div className={`inline-block px-3 py-1 rounded-full ${
        status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        Status: {status}
      </div>
      <p className="mt-2 text-gray-600">
        {status === 'Completed' 
          ? `Process has been continued by user. ${config?.completionMessage || ''}` 
          : 'Waiting for user to continue the process.'}
      </p>
    </div>
  );
};

// Processing function
const processNode = (params: PluginProcessInput): PluginProcessResult => {
  const { input, config } = params;
  
  // Check if the process can continue
  const canContinue = config?.processContinued === true;
  
  if (!canContinue) {
    // Return a special result to indicate process should be paused
    return {
      output: "Process paused. Waiting for user confirmation.",
      result: {
        status: 'waiting',
        message: 'Process is waiting for user to click the continue button.',
        requiresUserAction: true
      }
    };
  }
  
  // Process can continue
  return {
    output: input,
    result: {
      status: 'completed',
      message: 'Process continued successfully.',
      requiresUserAction: false
    }
  };
};

// Plugin export
export default {
  id: 'process-control',
  name: 'Process Control',
  description: 'Stops the process and waits for user confirmation',
  version: '1.0.0',
  activateByDefault: true,
  defaultConfig: {
    buttonText: 'Continue Process',
    processContinued: false
  },
  ViewComponent: ProcessControlView,
  ConfigComponent: ProcessControlConfig,
  ResultComponent: ProcessControlResult,
  processNode
};