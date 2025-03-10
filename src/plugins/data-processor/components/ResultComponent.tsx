// src/plugins/data-processor/components/ResultComponent.tsx
import React from 'react';
import { DataProcessorPlugin } from '..';


export const ResultComponent: React.FC = () => {
  const plugin = DataProcessorPlugin.getInstance();
  const pluginState = plugin.getState();
  const result = pluginState?.result;
  
  return (
    <div className="plugin-result">
      {result ? (
        <>
          <h4>Processed Result:</h4>
          <pre className="result-display">{result}</pre>
        </>
      ) : (
        <p>No results yet. Click "Process Data" to generate results.</p>
      )}
    </div>
  );
};
    