// src/components/tasks/editor/TemplateEditor.tsx
import { FC, useState } from "react";
import { Template, Step } from "../../../types/template";
import { StepEditor } from "./StepEditor";
import { useTasksStore } from "@/store/tasksStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MessageRole } from "@/types/common";

interface TemplateEditorProps {
  template?: Template;
  onCancel: () => void;
}

export const TemplateEditor: FC<TemplateEditorProps> = ({
  template,
  onCancel,
}) => {
  const { addTemplate, updateTemplate } = useTasksStore();
  const [steps, setSteps] = useState<Step[]>(
    template?.steps.map((step) => ({
      ...step,
      description: step.description ?? "",
    })) || []
  );
  const [templateDetails, setTemplateDetails] = useState({
    name: template?.name || "",
    description: template?.description || "",
  });
  const [dialogState, setDialogState] = useState<{
    type: 'add' | 'edit' | null;
    stepId?: string;
    isOpen: boolean;
  }>({
    type: null,
    isOpen: false
  });

  const handleAddStep = (step: Step) => {
    const newStep: Step = {
      ...step,
      id: step.id || Date.now().toString(),
      data: step.data || {
        question: "",
        answer: "",
        isConfirmed: false,
        role: "user" as MessageRole,
      },
    };
    setSteps((prev) => [...prev, newStep]);
    setDialogState({ type: null, isOpen: false });
  };

  const handleUpdateStep = (updatedStep: Step) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === updatedStep.id ? updatedStep : s))
    );
    setDialogState({ type: null, isOpen: false });
  };

  const handleOpenDialog = (type: 'add' | 'edit', stepId?: string) => {
    setDialogState({ type, stepId, isOpen: true });
  };

  const handleCloseDialog = () => {
    setDialogState({ type: null, isOpen: false });
  };

  const handleSave = () => {
    const currentDate = new Date();
    const templateData: Template = {
      id: template?.id || Date.now().toString(),
      createdAt: template?.createdAt || currentDate,
      updatedAt: currentDate,
      ...templateDetails,
      steps,
    };

    if (template) {
      updateTemplate(templateData);
    } else {
      addTemplate(templateData);
    }
    onCancel();
  };

  const getDialogContent = () => {
    const step = dialogState.stepId 
      ? steps.find(s => s.id === dialogState.stepId)
      : undefined;

    return (
      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'add' ? 'Add New Step' : 'Edit Step'}
            </DialogTitle>
          </DialogHeader>
          <StepEditor 
            step={step}
            onSubmit={dialogState.type === 'add' ? handleAddStep : handleUpdateStep}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader className="px-3 md:px-6 border border-dashed border-t-black md:border-0">
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={templateDetails.name}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Template name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={templateDetails.description}
              onChange={(e) =>
                setTemplateDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Template description"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader className="px-3 md:px-6 space-y-2 *:flex flex-row items-center justify-between border border-dashed border-t-black md:border-0">
          <CardTitle>Steps</CardTitle>
          <Button onClick={() => handleOpenDialog('add')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent className="px-3 md:px-6 space-y-2">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-medium">{step.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plugin ID: {step.pluginId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog('edit', step.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setSteps((prev) => prev.filter((s) => s.id !== step.id))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!templateDetails.name}>
          Save template
        </Button>
      </div>

      {getDialogContent()}
    </div>
  );
};