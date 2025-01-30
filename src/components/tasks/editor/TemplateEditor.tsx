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
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

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
    setIsAddStepOpen(false);
  };

  const handleUpdateStep = (updatedStep: Step) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === updatedStep.id ? updatedStep : s))
    );
    setEditingStepId(null);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {template ? "Edit" : "New"} Task Template
          </h2>
          <p className="text-muted-foreground">
            Create or modify task template details and steps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!templateDetails.name}>
            Save template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task template details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Steps</CardTitle>
          <Button onClick={() => setIsAddStepOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    onClick={() => setEditingStepId(step.id)}
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
        <Button variant={'outline'} onClick={handleSave} disabled={!templateDetails.name}>
          Save template
        </Button>
      </div>

      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
          </DialogHeader>
          <StepEditor onSubmit={handleAddStep} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingStepId}
        onOpenChange={() => setEditingStepId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          <StepEditor
            step={steps.find((s) => s.id === editingStepId)}
            onSubmit={handleUpdateStep}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
