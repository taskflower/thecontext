// src/components/shared/DialogButtons.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface NewScenarioButtonProps {
  workspaceId: string;
}

export const NewScenarioButton: React.FC<NewScenarioButtonProps> = ({
  workspaceId,
}) => {
  const { openDialog } = useDialog();

  const handleClick = () => {
    openDialog('newScenario', { workspaceId });
  };

  return (
    <Button onClick={handleClick}>
      <Plus className="h-4 w-4 mr-2" />
      New Scenario
    </Button>
  );
};