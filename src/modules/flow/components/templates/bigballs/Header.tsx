// src/modules/flow/components/templates/bigballs/Header.tsx
import React from "react";
import { X } from "lucide-react";
import { HeaderProps } from "../../interfaces";
import { useAppStore } from "@/modules/store";
import { Button } from "@/components/ui/button";

const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  nodeName,
  nodeDescription,
  onClose,
}) => {
  // Get current workspace information
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <>
      <div className="px-5 py-6 bg-background">
        {/* Logo/brand area */}
        <div className="w-full flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter text-foreground">
            {currentWorkspace?.title || "WISE.ADS"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main heading */}
        <div className="mt-10 mb-8">
          <div className="text-4xl font-normal text-foreground">
            {/* Node description - obsługa HTML */}
            {nodeDescription && (
              <p dangerouslySetInnerHTML={{ __html: nodeDescription }} />
            )}
          </div>
        </div>

        {/* Current step indicator */}
        <div className="mb-4">
          <h3 className="font-bold text-base text-foreground">
            Krok {currentStepIndex + 1}:{" "}
            {nodeName || `Etap ${currentStepIndex + 1}`}
          </h3>
        </div>
      </div>
      <div className="flex-1"></div>
    </>
  );
};

export default Header;
