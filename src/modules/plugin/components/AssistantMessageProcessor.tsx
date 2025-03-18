// src/modules/flowPlayer/components/MessageProcessors/AssistantMessageProcessor.tsx
import React, { useEffect, useState } from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "../../../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceContext } from "../../../context/hooks/useContext"; 

export const AssistantMessageProcessor: React.FC = () => {
  const { currentNode, isNodeProcessed, markNodeAsProcessed } = useFlowPlayer();
  const { addToConversation } = useAppStore();
  const { processTemplate } = useWorkspaceContext();
  const [activeTab, setActiveTab] = useState<string>("message");

  // Process message when node changes
  useEffect(() => {
    if (!currentNode) return;

    // Add assistant message only if the node hasn't been processed yet
    if (currentNode.assistant && !isNodeProcessed(currentNode.id)) {
      // Process template based on context
      const processedMessage = processTemplate(currentNode.assistant);
      
      addToConversation({
        role: "assistant",
        message: processedMessage
      });
      
      // Mark node as processed
      markNodeAsProcessed(currentNode.id);
    }
  }, [currentNode, addToConversation, isNodeProcessed, markNodeAsProcessed, processTemplate]);

  if (!currentNode) {
    return null;
  }

  // Process message for display purposes
  const displayMessage = currentNode.assistant 
    ? processTemplate(currentNode.assistant)
    : "";

  return (
    <Card>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList className="mb-2">
            <TabsTrigger value="message">Assistant Response</TabsTrigger>
            <TabsTrigger value="json">Node Data (JSON)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="message">
            <div className="bg-muted/20 p-3 rounded-md whitespace-pre-wrap">
              {displayMessage ? (
                displayMessage
              ) : (
                <span className="text-muted-foreground">No assistant message in this node</span>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="json">
            <div className="min-h-32 bg-muted/20 p-3 rounded-md overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(currentNode, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};