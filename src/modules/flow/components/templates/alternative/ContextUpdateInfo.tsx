// src/modules/flow/components/templates/alternative/ContextUpdateInfo.tsx
import React from "react";
import { Layers, Info } from "lucide-react";
import { ContextUpdateInfoProps } from "../../interfaces";
import { Alert, AlertDescription } from "@/components/ui/alert";


const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({
  contextKey,
  isVisible,
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <Alert className="mt-4 bg-secondary/30 border-secondary/20 text-secondary-foreground">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-secondary-foreground" />
        <AlertDescription className="text-xs flex items-center gap-1">
          <span>Your response will be saved to context:</span>
          <span className="font-semibold text-foreground bg-secondary/40 px-1.5 py-0.5 rounded">
            {contextKey}
          </span>
          
          
                <button className="ml-1 text-muted-foreground hover:text-foreground">
                  <Info className="h-3 w-3" />
                </button>
             
                <p className="text-xs">
                  Your response will be stored in the workspace context and can be 
                  accessed by other scenarios in this workspace.
                </p>
              
         
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ContextUpdateInfo;