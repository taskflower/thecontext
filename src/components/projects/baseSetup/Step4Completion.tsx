// Step4Completion.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Step4Props {
  onResetSetup: () => void;
}

export const Step4Completion: React.FC<Step4Props> = ({
  onResetSetup
}) => {
  const navigate = useNavigate();

  const goToTasks = () => {
    navigate('/tasks');
  };

  return (
    <div className="space-y-6 text-center py-12">
      <h2 className="text-2xl font-bold">Project Setup Completed!</h2>
      <p className="text-muted-foreground">
        Your project has been successfully configured. You can now proceed to work on tasks.
      </p>
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={onResetSetup}>
          Configure New Project
        </Button>
        <Button onClick={goToTasks}>
          Go to Tasks
        </Button>
      </div>
    </div>
  );
};