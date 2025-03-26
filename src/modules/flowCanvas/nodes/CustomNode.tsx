/* eslint-disable @typescript-eslint/no-explicit-any */

import { Handle, Position } from 'reactflow';

// Interfejs dla typów danych przekazywanych do węzła
interface NodeData {
  label?: string;
  nodeType?: string;
  value?: string | number;
  prompt?: string;
  message?: string;
  pluginKey?: string;
}

const CustomNode: React.FC<{ data: NodeData }> = ({ data }) => {
  return (
    <div className="relative group">
      {/* Main node container */}
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 w-72">
        {/* Header section */}
        <div className="p-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <h3 className="text-sm font-medium truncate">
              {data.nodeType || 'Input'}
            </h3>
          </div>
          {data.value && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
              {data.value}
            </span>
          )}
        </div>
        
        {/* Content section */}
        <div className="p-3">
          {/* Prompt display */}
          <div className="mb-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Prompt:</p>
            <div className="text-xs font-mono bg-muted/30 dark:bg-muted/10 rounded p-2 max-h-24 overflow-auto border border-border">
              {data.prompt ? (
                <span>{data.prompt}</span>
              ) : (
                <span className="text-muted-foreground italic">No prompt</span>
              )}
            </div>
          </div>
          
          {/* Message display (conditional) */}
          {data.message && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Message:</p>
              <div className="text-xs bg-muted/30 dark:bg-muted/10 border-l-2 border-primary p-2 max-h-20 overflow-auto rounded-r">
                {data.message}
              </div>
            </div>
          )}
          
          {/* Plugin info (if exists) */}
          {data.pluginKey && (
            <div className="mt-2 flex items-center">
              <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full flex items-center">
                {data.pluginKey}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 border-2 bg-background border-muted-foreground rounded-full opacity-80 hover:opacity-100 hover:border-primary transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 border-2 bg-background border-muted-foreground rounded-full opacity-80 hover:opacity-100 hover:border-primary transition-colors"
      />
    </div>
  );
};

export default CustomNode;