import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Play, HelpCircle } from "lucide-react";
import { useDialog } from '@/context/DialogContext';


export const NewScenarioButton: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const { openDialog } = useDialog();

  return (
    <Button onClick={() => openDialog('newScenario', { workspaceId })}>
      <Plus className="h-4 w-4 mr-2" />
      New Scenario
    </Button>
  );
};

export const EditScenarioButton: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const { openDialog } = useDialog();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => openDialog('editScenario', { scenarioId })}
      className="flex items-center gap-2"
    >
      <Edit className="h-4 w-4" />
      Edit Details
    </Button>
  );
};

export const ExecuteScenarioButton: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const { openDialog } = useDialog();

  return (
    <Button 
      onClick={() => openDialog('execution', { 
        scenarioId,
        // The actual content will be determined based on scenarioId
      })}
    >
      <Play className="h-4 w-4 mr-2" />
      Execute
    </Button>
  );
};

export const FilterHelpButton: React.FC = () => {
  const { openDialog } = useDialog();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => openDialog('filterHelp')}
      className="h-8 w-8 text-slate-500 hover:text-slate-700"
      title="Filtering Help"
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
};