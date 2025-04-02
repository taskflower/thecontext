// src/modules/flow/components/templates/bigballs/AssistantMessage.tsx
import React from "react";
import { Bot } from "lucide-react";
import { AssistantMessageProps } from "../../interfaces";

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => (
  <div className="px-5 py-3">
    <div className="mb-2 flex items-center">
      <div className="flex-shrink-0 w-6 h-6 mr-2 text-primary">
        <Bot className="w-full h-full" />
      </div>
      <p className="text-sm font-medium text-foreground">AI Asystent:</p>
    </div>
    <div className="bg-secondary rounded-md p-4 mt-1">
      <p className="text-sm text-secondary-foreground">
        {message || "Czekam na Twoją odpowiedź..."}
      </p>
    </div>
  </div>
);

export default AssistantMessage;