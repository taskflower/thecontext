// src/modules/flowPlayer/components/MessageProcessors/UserMessageProcessor.tsx
import React from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export const UserMessageProcessor: React.FC = () => {
  const { currentNode, userMessage, updateUserMessage } = useFlowPlayer();
  
  if (!currentNode) {
    return null;
  }
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="mb-2 font-medium text-sm">User Message</div>
        <Textarea
          value={userMessage}
          onChange={(e) => updateUserMessage(e.target.value)}
          placeholder="Enter your message..."
          className="min-h-32 font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};