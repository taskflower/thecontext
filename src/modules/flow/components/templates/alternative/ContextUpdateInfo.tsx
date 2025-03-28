// src/modules/flow/components/templates/alternative/ContextUpdateInfo.tsx
import React from "react";
import { Layers } from "lucide-react";
import { ContextUpdateInfoProps } from "../../interfaces";

const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({
  contextKey,
  isVisible
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <div className="mt-2 py-1.5 px-2 bg-primary/10 text-primary text-xs rounded-md flex items-center">
      <Layers className="mr-2 h-4 w-4" />
      <span>
        Twoja odpowiedź zostanie zapisana w kontekście{" "}
        <strong>{contextKey}</strong>
      </span>
    </div>
  );
};

export default ContextUpdateInfo;