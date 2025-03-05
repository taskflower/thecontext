// src/pages/stepsPlugins/scenarioCreator/components/CreateButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, Loader2 } from 'lucide-react';

interface CreateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  onClick,
  disabled,
  loading
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Creating Scenarios...
        </>
      ) : (
        <>
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Selected Scenarios
        </>
      )}
    </Button>
  );
};