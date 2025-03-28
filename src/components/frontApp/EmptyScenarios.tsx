// src/components/frontApp/EmptyScenarios.tsx
import React from "react";
import { Button } from "../ui/button";

// Props can be reduced since we're only using onCreateNew
interface EmptyScenariosProps {
  onCreateNew: () => void;
}

const EmptyScenarios: React.FC<EmptyScenariosProps> = ({ onCreateNew }) => {
  return (
    <div className="col-span-full text-center p-4 sm:p-12 border rounded-lg bg-card">
      <div className="text-sm sm:text-base text-muted-foreground mb-4">
        No scenarios with filters found
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-xs sm:text-sm"
        onClick={onCreateNew}
      >
        Create New Scenario
      </Button>
    </div>
  );
};

export default EmptyScenarios;