import React, { useState } from 'react';
import { usePlugin } from '../hooks/use-plugin';


interface PluginExecutorProps {
  pluginId: string;
  initialInput?: string;
}

export const PluginExecutor: React.FC<PluginExecutorProps> = ({
  pluginId,
  initialInput = ''
}) => {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  const { plugin, execute, isExecuting, activate, deactivate, addToQueue } = usePlugin(pluginId);
  
  if (!plugin) {
    return <div>Plugin nie został znaleziony</div>;
  }
  
  const handleExecute = async () => {
    const result = await execute(input);
    setOutput(result.output);
    setExecutionTime(result.executionTime);
  };
  
  return (
    <div className="plugin-executor">
      <div className="plugin-header">
        <h3>{plugin.config.name}</h3>
        <p>{plugin.config.description}</p>
        <div className="plugin-controls">
          <button 
            onClick={() => plugin.isActive ? deactivate() : activate()}
          >
            {plugin.isActive ? 'Deaktywuj' : 'Aktywuj'}
          </button>
          <button onClick={addToQueue}>
            Dodaj do kolejki
          </button>
        </div>
      </div>
      
      <div className="plugin-content">
        <div className="input-section">
          <label>
            Input:
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              rows={5}
            />
          </label>
        </div>
        
        <div className="actions">
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? 'Przetwarzanie...' : 'Wykonaj'}
          </button>
        </div>
        
        {output && (
          <div className="output-section">
            <label>
              Output:
              <textarea 
                value={output}
                readOnly
                rows={5}
              />
            </label>
            {executionTime !== null && (
              <div className="execution-info">
                Czas wykonania: {executionTime}ms
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};