// src/modules/flowPlayer/components/MessageProcessors/AssistantMessageProcessor.tsx
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlowPlayer } from "../../context/FlowContext";
import { useWorkspaceContext } from "../../../context/hooks/useContext";
import { useAppStore } from "../../../store";
import { usePluginStore } from "@/modules/plugin";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";

export const AssistantMessageProcessor: React.FC = React.memo(() => {
  // State and context hooks
  const { currentNode, isNodeProcessed, markNodeAsProcessed } = useFlowPlayer();
  const { processTemplate } = useWorkspaceContext();
  const { plugins } = usePluginStore();
  const { addToConversation } = useAppStore();
  
  // UI state
  const [activeTab, setActiveTab] = useState("message");
  const [copied, setCopied] = useState(false);
  
  // Refs for preventing duplicate processing
  const processedNodeRef = useRef<string | null>(null);
  const processingRef = useRef(false);
  const renderCountRef = useRef(0);
  
  // Debug: track renders
  renderCountRef.current += 1;
  
  // Process assistant message when node changes
  useEffect(() => {
    // Skip if no node, already processed, or currently processing
    if (
      !currentNode || 
      !currentNode.assistant || 
      isNodeProcessed(currentNode.id) || 
      processedNodeRef.current === currentNode.id ||
      processingRef.current
    ) {
      return;
    }
    
    // Set refs to prevent duplicate processing
    processedNodeRef.current = currentNode.id;
    processingRef.current = true;
    
    // Mark node as processed immediately
    markNodeAsProcessed(currentNode.id);
    
    // Process template based on context variables
    const processedMessage = processTemplate(currentNode.assistant);
    
    // Add to conversation
    addToConversation({
      role: "assistant",
      message: processedMessage
    });
    
    // Reset processing flag
    processingRef.current = false;
  }, [
    currentNode?.id, 
    currentNode?.assistant, 
    isNodeProcessed, 
    markNodeAsProcessed,
    processTemplate,
    addToConversation
  ]);

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!currentNode?.assistant) return;
    
    const processedMessage = processTemplate(currentNode.assistant);
    navigator.clipboard.writeText(processedMessage);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Return null if no current node
  if (!currentNode) {
    return null;
  }
  
  // Get plugin info if available
  const pluginName = currentNode.plugin
    ? plugins[currentNode.plugin]?.name || currentNode.plugin
    : null;
  
  // Process message for display (doesn't add to conversation)
  const displayMessage = currentNode.assistant
    ? processTemplate(currentNode.assistant)
    : "";
  
  return (
    <Card className="assistant-message-processor border shadow-none mb-2">
      <CardContent className="pt-3 px-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
              Assistant
            </span>
            {currentNode.plugin && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
                Plugin: {pluginName}
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!displayMessage}
            className="h-7 px-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList className="mb-2 h-8 bg-muted/60">
            <TabsTrigger value="message" className="text-xs h-6">Message</TabsTrigger>
            <TabsTrigger value="debug" className="text-xs h-6">Debug Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="message">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-900/50 min-h-[100px]">
              {displayMessage ? (
                <p className="whitespace-pre-wrap text-sm">{displayMessage}</p>
              ) : (
                <p className="text-muted-foreground italic text-sm">This node has no assistant message.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="debug">
            <div className="bg-background p-4 rounded-md border border-border overflow-auto max-h-[300px]">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify({
                  nodeId: currentNode.id,
                  nodeLabel: currentNode.label,
                  isProcessed: isNodeProcessed(currentNode.id),
                  plugin: currentNode.plugin,
                  contextSaveKey: currentNode.contextSaveKey,
                  renderCount: renderCountRef.current
                }, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

AssistantMessageProcessor.displayName = 'AssistantMessageProcessor';