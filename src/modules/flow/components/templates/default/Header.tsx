// src/modules/flow/components/templates/default/Header.tsx
import React from "react";
import { X } from "lucide-react";
import { HeaderProps } from "../../interfaces";
import { useAppStore } from "@/modules/store";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import sanitizeHtml from "@/utils/utils";

const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  totalSteps,
  nodeName,
  nodeDescription,
  onClose,
}) => {
  // Pobierz informacje o bieżącym workspace
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <CardHeader className="bg-card text-card-foreground border-b border-border pb-6">
      {/* Workspace info section */}
      {currentWorkspace && (
        <div className="mb-2 flex items-center justify-between">
          <div>
            <Badge
              variant="outline"
              className="text-xs font-semibold border-border bg-accent text-accent-foreground mb-2"
            >
              {currentWorkspace.title}
            </Badge>
            {currentWorkspace.description && (
              <CardDescription className="text-muted-foreground text-xs max-w-md">
                {currentWorkspace.description}
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step info section */}
      <div className="flex items-center space-x-2 mt-2">
        <Badge
          variant="secondary"
          className="bg-secondary text-secondary-foreground hover:bg-secondary"
        >
          {currentStepIndex + 1}/{totalSteps}
        </Badge>
        <CardTitle className="text-xl font-bold text-primary tracking-tight">
          {nodeName || `Step ${currentStepIndex + 1}`}
        </CardTitle>
      </div>
      
      {/* Node description - obsługa HTML */}
      {nodeDescription && (
        <div className="mt-2 text-sm text-muted-foreground prose prose-sm max-w-none">
          <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(nodeDescription),
              }}
            />
        </div>
      )}
    </CardHeader>
  );
};

export default Header;