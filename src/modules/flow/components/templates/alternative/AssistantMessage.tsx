// src/modules/flow/components/templates/alternative/AssistantMessage.tsx
import React from "react";
import { Bot } from "lucide-react";
import { AssistantMessageProps } from "../../interfaces";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-foreground">Assistant</span>
    </div>
    
    {message ? (
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 prose prose-sm max-w-none">
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="rounded-lg border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
        <div className="animate-pulse flex space-x-1">
          <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
          <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
          <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Assistant is preparing a response...
        </p>
      </div>
    )}
  </div>
);

export default AssistantMessage;