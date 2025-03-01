// src/pages/tasks/components/navigator/steps/StepAddDialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStepStore } from "@/store/stepStore";
import { getAllPlugins, getDefaultConfig } from "@/pages/stepsPlugins";
import { StepType } from "@/types";

interface StepAddDialogProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
}

export function StepAddDialog({ taskId, open, onClose }: StepAddDialogProps) {
  const [newStepType, setNewStepType] = useState<string>("");
  const [newStepTitle, setNewStepTitle] = useState<string>("");
  const { addStep } = useStepStore();
  
  // Get all available plugins
  const plugins = getAllPlugins();
  
  // Set default plugin if available
  useEffect(() => {
    if (plugins.length > 0 && !newStepType) {
      setNewStepType(plugins[0].type);
    }
  }, [plugins, newStepType]);
  
  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    
    const defaultConfig = getDefaultConfig(newStepType);
    
    addStep(taskId, {
      title: newStepTitle,
      description: newStepTitle,
      type: newStepType as StepType,
      config: defaultConfig,
      options: {},
      status: 'pending',
      result: null
    });
    
    // Reset and close dialog
    setNewStepTitle("");
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj krok do zadania</DialogTitle>
          <DialogDescription>
            Utwórz nowy krok dla tego zadania.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label
              htmlFor="step-type"
              className="text-sm font-medium mb-1 block"
            >
              Typ kroku
            </label>
            <Select
              value={newStepType}
              onValueChange={(value) => setNewStepType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ kroku" />
              </SelectTrigger>
              <SelectContent>
                {plugins.map((plugin) => (
                  <SelectItem key={plugin.type} value={plugin.type}>
                    {plugin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="step-title"
              className="text-sm font-medium mb-1 block"
            >
              Nazwa kroku
            </label>
            <Input
              id="step-title"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Nazwa kroku"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleAddStep} disabled={!newStepTitle.trim()}>
            Dodaj krok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StepAddDialog;