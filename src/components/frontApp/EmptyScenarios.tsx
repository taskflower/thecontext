// src/components/frontApp/EmptyScenarios.tsx
import React from "react";
import { Button } from "../ui/button";
import { PlusCircle, FolderOpen } from "lucide-react";

// Props can be reduced since we're only using onCreateNew
interface EmptyScenariosProps {
  onCreateNew: () => void;
}

const EmptyScenarios: React.FC<EmptyScenariosProps> = ({ onCreateNew }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-8 sm:p-16 border rounded-lg bg-card/50 text-center">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <FolderOpen className="h-7 w-7 text-primary" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">No scenarios found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        You don't have any matching scenarios. Get started by creating your first scenario.
      </p>
      
      <Button
        onClick={onCreateNew}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Create New Scenario
      </Button>
    </div>
  );
};

export default EmptyScenarios;