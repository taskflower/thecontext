// src/components/frontApp/FilterDialog.tsx

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiltersList } from "@/modules/filters";
import { FilterDialogProps } from "./types";



const FilterDialog: React.FC<FilterDialogProps> = ({ isOpen, onClose, scenarioId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Filters</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <FiltersList scenarioId={scenarioId} />
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;    