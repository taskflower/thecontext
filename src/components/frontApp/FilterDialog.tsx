// src/components/frontApp/FilterDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FiltersList } from "@/modules/filters";
import { useAppStore } from "@/modules/store";
import { X, Filter } from "lucide-react";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId?: string; // Make this optional since we can get it from the store
}

const FilterDialog: React.FC<FilterDialogProps> = ({ 
  isOpen, 
  onClose, 
  scenarioId 
}) => {
  // Always call Hooks at the top level, regardless of conditions
  const selectedScenario = useAppStore(state => state.selected.scenario);
  const getCurrentWorkspace = useAppStore(state => state.getCurrentWorkspace);
  
  // Use provided scenarioId or fallback to the selected one from store
  const currentScenarioId = scenarioId || selectedScenario;
  
  // Get scenario name for the dialog title
  const workspace = getCurrentWorkspace();
  const scenario = workspace?.children.find(s => s.id === currentScenarioId);
  const scenarioName = scenario?.name || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Edit Filters
          </DialogTitle>
          <DialogDescription>
            Configure filters for {scenarioName ? `"${scenarioName}"` : "this scenario"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto border rounded-md p-2 bg-muted/30">
          <FiltersList scenarioId={currentScenarioId} />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button onClick={onClose} className="sm:ml-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;