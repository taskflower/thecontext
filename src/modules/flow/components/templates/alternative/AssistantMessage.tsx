// src/modules/flow/components/templates/alternative/AssistantMessage.tsx
import React from "react";
import { Bot } from "lucide-react";
import { AssistantMessageProps } from "../../interfaces";

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => (
  <div className="flex items-start mb-6 max-w-2xl">
    <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
      <Bot className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Asystent:
      </p>
      <div className="bg-muted rounded-lg py-2 px-3 max-h-40 overflow-y-scroll">
        {message || "Czekam na Twoją odpowiedź..."}
      </div>
    </div>
  </div>
);

export default AssistantMessage;