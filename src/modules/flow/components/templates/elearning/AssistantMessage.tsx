// src/modules/flow/components/templates/elearning/AssistantMessage.tsx
import React from "react";
import { MessageCircle } from "lucide-react";
import { AssistantMessageProps } from "../../interfaces";

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => (
  <div className="p-4 bg-primary/5 rounded-xl mb-6 max-w-lg mx-auto">
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="flex-1">
        {message ? (
          <div className="text-foreground leading-relaxed text-sm">
            {message}
          </div>
        ) : (
          <div className="flex items-center justify-center h-12">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default AssistantMessage;