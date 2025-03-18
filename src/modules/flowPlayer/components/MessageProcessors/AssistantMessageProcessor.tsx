// src/modules/flowPlayer/components/MessageProcessors/AssistantMessageProcessor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "../../../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AssistantMessageProcessor: React.FC = () => {
  const { currentNode } = useFlowPlayer();
  const { addToConversation } = useAppStore();
  const prevNodeIdRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("message");

  // Process message when current node changes
  useEffect(() => {
    if (!currentNode) {
      return;
    }

    // Check if node ID changed
    if (currentNode.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = currentNode.id;
      
      // Add assistant message to conversation if it exists
      if (currentNode.assistant) {
        addToConversation({
          role: "assistant",
          message: currentNode.assistant
        });
      }
    }
  }, [currentNode, addToConversation]);

  if (!currentNode) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList className="mb-2">
            <TabsTrigger value="message">Assistant Response</TabsTrigger>
            <TabsTrigger value="json">Node Data (JSON)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="message">
            <div className=" bg-muted/20 p-3 rounded-md whitespace-pre-wrap">
              {currentNode.assistant ? (
                currentNode.assistant
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