import React from "react";
import { useAppStore } from "../../store";
import { Bot, User } from "lucide-react";

/**
 * Component that displays a preview of the conversation flow
 */
const ConversationPreview: React.FC = () => {
  const calculateFlowPath = useAppStore((state) => state.calculateFlowPath);
  const flowNodes = calculateFlowPath();
  
  if (flowNodes.length === 0) {
    return (
      <div className="p-6 bg-muted/20 rounded-lg text-center text-muted-foreground">
        <p>Brak węzłów w przepływie. Dodaj węzły, aby zobaczyć podgląd konwersacji.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium">Podgląd konwersacji</h3>
      </div>
      
      <div className="p-4 max-h-[400px] overflow-y-auto space-y-6">
        {flowNodes.map((node, index) => (
          <div key={node.id} className="space-y-3">
            {/* Node label as step header */}
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary mr-2">
                {index + 1}
              </div>
              <span className="text-sm font-medium">{node.label}</span>
            </div>
            
            {/* Assistant message */}
            {node.assistantMessage && (
              <div className="flex items-start ml-8">
                <div className="flex-shrink-0 bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted/30 dark:bg-muted/10 border-l-2 border-primary rounded-r-md py-2 px-3 text-sm">
                    {node.assistantMessage}
                  </div>
                </div>
              </div>
            )}
            
            {/* User prompt */}
            {node.userPrompt && (
              <div className="flex items-start ml-8">
                <div className="flex-shrink-0 bg-muted w-6 h-6 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted/10 border border-border rounded-md py-2 px-3 text-sm">
                    {node.userPrompt}
                  </div>
                </div>
              </div>
            )}
            
            {/* Plugin indicator if exists */}
            {node.pluginKey && (
              <div className="ml-8 flex items-center mt-1">
                <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                  Plugin: {node.pluginKey}
                </span>
              </div>
            )}
            
            {/* Separator between nodes */}
            {index < flowNodes.length - 1 && (
              <div className="border-b border-border/50 pt-2" />
            )}
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border bg-muted/10 flex justify-end">
        <button 
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            // Tutaj można dodać funkcję do eksportu konwersacji
          }}
        >
          Eksportuj konwersację
        </button>
      </div>
    </div>
  );
};

export default ConversationPreview;