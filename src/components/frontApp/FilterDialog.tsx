// src/components/frontApp/FilterDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiltersList } from "@/modules/filters";
import { useAppStore } from "@/modules/store";

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
  // Get current scenario ID from store if not provided via props
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const currentScenarioId = scenarioId || useAppStore(state => state.selected.scenario);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edycja filtrów</DialogTitle>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <FiltersList scenarioId={currentScenarioId} />
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Zamknij</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;