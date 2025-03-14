// src/components/app/AppDialogs.tsx
import React from 'react';
import { NewScenarioDialog } from '../scenarios/NewScenarioDialog';
import { FilteringHelpComponent } from '../scenarios/FilteringHelpComponent';
import { ScenarioEditor } from '../scenarios/ScenarioEditor';
import { useDialog } from '@/context/DialogContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const AppDialogs: React.FC = () => {
  const { isDialogOpen, closeDialog, getDialogProps } = useDialog();
  
  // For certain special case dialogs like filterHelp that use a different pattern
  const filterHelpOpen = isDialogOpen('filterHelp');
  
  const handleFilterHelpOpenChange = (open: boolean) => {
    if (!open) closeDialog('filterHelp');
  };

  return (
    <>
      {/* New Scenario Dialog */}
      <NewScenarioDialog />
      
      {/* Edit Scenario Dialog */}
      {isDialogOpen('editScenario') && (
        <ScenarioEditor 
          scenarioId={getDialogProps('editScenario').scenarioId} 
          onClose={() => closeDialog('editScenario')} 
        />
      )}
      
      {/* Filter Help Dialog */}
      <Dialog  open={filterHelpOpen} onOpenChange={handleFilterHelpOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <FilteringHelpComponent />
        </DialogContent>
      </Dialog>
      
      {/* Add other dialogs as needed */}
    </>
  );
};