import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Bot, MessageCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/utils';
import { BaseNode } from '@/modules/flow/types';


interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  nodeId: string;
  timestamp: Date;
}

const ConversationHistoryPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  
  // Get data from main app store
  const selectedScenarioId = useAppStore(state => state.selected.scenario);
  const calculateFlowPath = useAppStore(state => state.calculateFlowPath);
  
  // Get flow path for current scenario
  const flowPath = calculateFlowPath();
  
  // Convert flow path to conversation messages
  const conversationMessages: ConversationMessage[] = flowPath
    .filter((node: BaseNode) => node.userPrompt || node.assistantMessage)
    .flatMap((node: BaseNode) => {
      const messages: ConversationMessage[] = [];

      // First add user message, then assistant - this preserves the proper order
      if (node.userPrompt) {
        messages.push({
          id: `user-${node.id}`,
          type: 'user',
          content: node.userPrompt,
          nodeId: node.id,
          timestamp: new Date(Date.now() - 1000) // 1 second older
        });
      }
      
      if (node.assistantMessage) {
        messages.push({
          id: `assistant-${node.id}`,
          type: 'assistant',
          content: node.assistantMessage,
          nodeId: node.id,
          timestamp: new Date()
        });
      }
      
      return messages;
    });
  
  // Handle expanding/collapsing history
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  if (!selectedScenarioId) {
    return (
      <div className="h-full flex items-center justify-center bg-card border border-border rounded-md">
        <p className="text-sm text-muted-foreground">Select a scenario to view conversation history</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          <h2 className="text-sm font-medium">Conversation History</h2>
        </div>
        <button
          onClick={toggleExpanded}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          type="button"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Content - messages */}
      <div className={cn("flex-1 overflow-auto", expanded ? "block" : "hidden")}>
        <div className="p-3">
          {conversationMessages.length > 0 ? (
            <div className="space-y-3">
              {conversationMessages.map(message => (
                <div 
                  key={message.id} 
                  className={cn(
                    "p-3 rounded-lg relative group",
                    message.type === 'assistant' 
                      ? "bg-primary/5 border-l-2 border-primary ml-2" 
                      : "bg-muted/30 ml-6"
                  )}
                >
                  {/* Visual connection to node - shows on hover */}
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center text-xs text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded">Node #{message.nodeId.slice(-4)}</span>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mr-2",
                      message.type === 'assistant' 
                        ? "bg-primary/20" 
                        : "bg-muted"
                    )}>
                      {message.type === 'assistant' ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {message.type === 'assistant' ? 'Assistant' : 'User'}
                    </span>
                  </div>
                  
                  <p className="text-sm ml-8">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  This flow doesn't contain any messages.<br />
                  Add messages to nodes in the editor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistoryPanel;