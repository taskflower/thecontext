// src/modules/flowPlayer/components/FlowPlayer.tsx
import React from "react";
import { FlowControls } from "./Controls/FlowControls";
import { useFlowPlayer } from "../hooks/useFlowPlayer";
import { ConversationPanel } from "../../conversation/ConversationPanel";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const FlowPlayer: React.FC = () => {
  const { 
    currentNode, 
    userMessage, 
    updateUserMessage, 
    nextNode 
  } = useFlowPlayer();
  
  const handleSendMessage = () => {
    if (userMessage.trim()) {
      nextNode();
    }
  };
  
  return (
    <div className="flow-player p-4">
      <FlowControls />
      
      {currentNode && (
        <Card className="mb-6" key={currentNode.id}>
          <CardContent className="pt-4">
            <h3 className="text-lg font-medium mb-1">{currentNode.label || "Unnamed Node"}</h3>
            {currentNode.type && (
              <div className="text-xs bg-muted inline-block px-2 py-0.5 rounded-full mb-2">
                {currentNode.type}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex-1 mb-6 overflow-auto">
        <ConversationPanel />
      </div>
      
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={userMessage}
              onChange={(e) => updateUserMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-20 flex-1"
            />
            <Button onClick={handleSendMessage} className="mb-1">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};