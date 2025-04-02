// src/modules/flow/components/templates/bigballs/ContextUpdateInfo.tsx
import React from "react";
import { ContextUpdateInfoProps } from "../../interfaces";
import { Bot } from "lucide-react";

const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({
  contextKey,
  isVisible,
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <div className="px-5 mt-2 mb-4">
      <div className="flex items-center">
        <Bot className="w-5 h-5 mr-2 text-primary" />
        <div className="text-xs text-muted-foreground">
          <span>Wygeneruję teraz dla Ciebie </span>
          <span className="font-medium text-foreground">{contextKey}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextUpdateInfo;
