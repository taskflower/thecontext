// src/modules/flowPlayer/components/MessageProcessors/UserMessageProcessor.tsx
import React from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useWorkspaceContext } from "../../../context/hooks/useContext"; // Dodana importacja

export const UserMessageProcessor: React.FC = () => {
  const { currentNode, userMessage, updateUserMessage, nextNode } = useFlowPlayer();
  const { processTemplate } = useWorkspaceContext(); // Użycie hooka
  
  const handleSendMessage = () => {
    if (userMessage.trim()) {
      nextNode();
    }
  };
  
  if (!currentNode) {
    return null;
  }
  
  return (
    <Card className="flex-shrink-0 mt-auto">
      <CardContent className="pt-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={userMessage}
            onChange={(e) => updateUserMessage(processTemplate(e.target.value))}
            placeholder="Type your message..."
            className="min-h-20 flex-1"
          />
          <Button onClick={handleSendMessage} className="mb-1">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};