// src/modules/flow/components/templates/alternative/Header.tsx
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

const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  totalSteps,
  nodeName,
  onClose,
}) => {
  // Get current workspace information
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <CardHeader className="relative border-b border-border p-6">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-4 top-4 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Workspace info */}
      {currentWorkspace && (
        <div className="mb-4">
          <Badge
            variant="outline"
            className="mb-2 text-xs font-medium border-border bg-secondary/40 text-secondary-foreground"
          >
            {currentWorkspace.title}
          </Badge>
          {currentWorkspace.description && (
            <CardDescription className="text-xs text-muted-foreground max-w-md">
              {currentWorkspace.description}
            </CardDescription>
          )}
        </div>
      )}

      {/* Progress indicator and step title */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
          >
            {currentStepIndex + 1}/{totalSteps}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete
          </span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          {nodeName || `Step ${currentStepIndex + 1}`}
        </CardTitle>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 mt-4 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </CardHeader>
  );
};

export default Header;