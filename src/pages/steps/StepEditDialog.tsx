// src/pages/steps/StepEditDialog.tsx
import { Step } from "@/types";
import { useStepStore } from "@/store/stepStore";
import { StepEditor } from "@/pages/stepsPlugins";
import { FormModal } from "@/components/ui/form-modal";

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

  // Empty submit handler since the StepEditor handles its own state changes
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClose();
  };

  return (
    <FormModal
      title={`Edit step: ${step.title}`}
      isOpen={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Close"
      size="xl"
    >
      <div className="py-2">
        <StepEditor step={step} onChange={handleUpdateStep} />
      </div>
    </FormModal>
  );
}

export default StepEditDialog;