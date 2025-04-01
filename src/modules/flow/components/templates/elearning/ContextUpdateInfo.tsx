// src/modules/flow/components/templates/elearning/ContextUpdateInfo.tsx
import React from "react";
import { Star } from "lucide-react";
import { ContextUpdateInfoProps } from "../../interfaces";

const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({
  contextKey,
  isVisible,
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <div className="mt-2 px-4 py-2 max-w-lg mx-auto rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center">
      <Star className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
      <span>
        Your answer will be saved to progress toward your course completion for{" "}
        <span className="font-semibold">{contextKey}</span>
      </span>
    </div>
  );
};

export default ContextUpdateInfo;
