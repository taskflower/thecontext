// src/modules/flow/components/templates/default/ContextUpdateInfo.tsx
import React from "react";
import { Layers } from "lucide-react";
import { ContextUpdateInfoProps } from "../../interfaces";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({ 
  contextKey, 
  isVisible 
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <Alert className="mt-3 bg-accent/30 border-border text-accent-foreground">
      <AlertDescription className="text-xs flex items-center gap-1">
        <Layers className="h-4 w-4 text-muted-foreground mr-1" />
        <span>Your response will be saved in context</span> 
        <span className="font-semibold text-foreground">{contextKey}</span>
      </AlertDescription>
    </Alert>
  );
};

export default ContextUpdateInfo;