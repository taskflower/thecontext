// src/pages/steps/StepEditDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Step } from "@/types";
import { useStepStore } from "@/store/stepStore";
import { StepEditor } from "@/pages/stepsPlugins";

interface StepEditDialogProps {
  step: Step;
  open: boolean;
  onClose: () => void;
}

export function StepEditDialog({ step, open, onClose }: StepEditDialogProps) {
  const { updateStep } = useStepStore();

  const handleUpdateStep = (updates: Partial<Step>) => {
    updateStep(step.id, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edytuj krok: {step.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <StepEditor step={step} onChange={handleUpdateStep} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StepEditDialog;
