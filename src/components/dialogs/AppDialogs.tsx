import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { NewScenarioDialog } from '../scenarios/NewScenarioDialog';
import { ScenarioEditor } from '../scenarios/ScenarioEditor';
import { FilteringHelpComponent } from '../scenarios/FilteringHelpComponent';
import { useDialog } from '@/context/DialogContext';

export const AppDialogs: React.FC = () => {
  const { isDialogOpen, closeDialog, getDialogProps } = useDialog();

  return (
    <>
      {/* New Scenario Dialog */}
      <Dialog 
        open={isDialogOpen('newScenario')} 
        onOpenChange={(open) => !open && closeDialog('newScenario')}
      >
        <DialogContent>
          <NewScenarioDialog 
            workspaceId={getDialogProps('newScenario').workspaceId} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Scenario Dialog */}
      <Dialog 
        open={isDialogOpen('editScenario')} 
        onOpenChange={(open) => !open && closeDialog('editScenario')}
      >
        <DialogContent className="max-w-4xl">
          <ScenarioEditor 
            scenarioId={getDialogProps('editScenario').scenarioId} 
            onClose={() => closeDialog('editScenario')} 
          />
        </DialogContent>
      </Dialog>

      {/* Scenario Execution Dialog */}
      <Dialog 
        open={isDialogOpen('execution')} 
        onOpenChange={(open) => !open && closeDialog('execution')}
      >
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          {/* We'll need to extract the execution dialog content from ScenarioExecution.tsx */}
          {getDialogProps('execution').content}
        </DialogContent>
      </Dialog>

      {/* Filter Help Dialog */}
      <Dialog 
        open={isDialogOpen('filterHelp')} 
        onOpenChange={(open) => !open && closeDialog('filterHelp')}
      >
        <DialogContent className="sm:max-w-4xl">
          <FilteringHelpComponent />
        </DialogContent>
      </Dialog>
    </>
  );
};