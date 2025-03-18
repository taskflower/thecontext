// src/modules/flowPlayer/components/MessageProcessors/AssistantMessageProcessor.tsx
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { useAppStore } from "@/modules/store";


export const AssistantMessageProcessor: React.FC = () => {
  const { currentNode, currentNodeIndex } = useFlowPlayer();
  const conversation = useAppStore((state) => state.conversation);
  
  // Get the last assistant message from the conversation
  const lastAssistantMessage = conversation
    .filter(msg => msg.role === "assistant")
    .pop()?.message || "";

  if (!currentNode) {
    return null;
  }
  
  // Use currentNodeIndex as key to force re-render when node changes

  return (
    <Card key={`assistant-message-${currentNodeIndex}`}>
      <CardContent className="pt-4">
        <div className="mb-2 font-medium text-sm">Assistant Response</div>
        <div className="min-h-32 bg-muted/20 p-3 rounded-md whitespace-pre-wrap">
          {lastAssistantMessage ? (
            lastAssistantMessage
          ) : (
            <span className="text-muted-foreground">No content to display</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};