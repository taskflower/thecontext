// src/modules/flow/components/templates/default/AssistantMessage.tsx
import React from "react";
import { Bot } from "lucide-react";
import { AssistantMessageProps } from "../../interfaces";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="h-10 w-10 rounded-full flex items-center justify-center border border-border bg-secondary text-secondary-foreground flex-shrink-0 shadow-sm">
      <Bot className="h-5 w-5" />
    </div>
    <div className="flex-1 space-y-2 ">
      <div className="flex items-center">
        <span className="text-sm font-semibold text-primary">Assistant</span>
      </div>
      <Card className="bg-card/50 border-border text-card-foreground shadow-md max-h-40 overflow-y-scroll">
        <CardContent className="p-4">
          {message || "Waiting for your response..."}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AssistantMessage;