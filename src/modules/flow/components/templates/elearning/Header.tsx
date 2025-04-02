// src/modules/flow/components/templates/elearning/Header.tsx
import React from "react";
import { X, Heart } from "lucide-react";
import { HeaderProps } from "../../interfaces";
import { useAppStore } from "@/modules/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import sanitizeHtml from "@/utils/utils";

const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  totalSteps,
  nodeName,
  nodeDescription,
  onClose,
}) => {
  // Get current workspace information
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <div className="border-b border-border bg-background px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side with close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress dots - centered */}
        <div className="flex-1 flex items-center justify-center gap-1 mx-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all ${
                index === currentStepIndex
                  ? "w-3 h-3 bg-primary animate-pulse"
                  : index < currentStepIndex
                  ? "w-2 h-2 bg-primary/80"
                  : "w-2 h-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Right side with "lives" */}
        <div className="flex items-center space-x-1">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <span className="text-sm font-medium">5</span>
        </div>
      </div>

      {/* Lesson information */}
      <div className="mt-4 mb-2 text-center">
        <h2 className="text-lg font-bold text-foreground">
          {nodeName || `Lesson ${currentStepIndex + 1}`}
        </h2>

        {/* Node description - obsługa HTML */}
        {nodeDescription && (
          <div className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none mx-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(nodeDescription),
              }}
            />
          </div>
        )}

        {currentWorkspace && (
          <p className="text-xs text-muted-foreground mt-1">
            {currentWorkspace.title}
          </p>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mb-2">
        <Badge
          variant="outline"
          className="text-xs bg-primary/10 text-primary border-primary/20"
        >
          {currentStepIndex + 1} of {totalSteps}
        </Badge>
      </div>
    </div>
  );
};

export default Header;
