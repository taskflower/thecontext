// src/components/TemplateForm.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTaskStore } from "@/store/taskStore";
import { ITaskTemplate } from "@/utils/tasks/taskTypes";


type StepType = "retrieval" | "processing" | "generation" | "validation" | "custom";

interface Step {
  order: number;
  type: StepType;
  description: string;
}

const TemplateForm: React.FC = () => {
  const addTemplate = useTaskStore((state) => state.addTemplate);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultPriority, setDefaultPriority] = useState<"low" | "medium" | "high">("medium");
  const [steps, setSteps] = useState<Step[]>([]);

  // Pola pomocnicze do dodawania kroku
  const [stepType, setStepType] = useState<StepType>("retrieval");
  const [stepDescription, setStepDescription] = useState("");

  const handleAddStep = () => {
    if (!stepDescription.trim()) return;
    const newStep: Step = {
      order: steps.length + 1,
      type: stepType,
      description: stepDescription,
    };
    setSteps([...steps, newStep]);
    setStepDescription("");
    setStepType("retrieval");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const templateData: Omit<ITaskTemplate, "id"> = {
      name,
      description,
      defaultPriority,
      defaultSteps: steps,
    };
    addTemplate(templateData);
    // Czyścimy formularz
    setName("");
    setDescription("");
    setDefaultPriority("medium");
    setSteps([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Dodaj Szablon</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowy szablon</DialogTitle>
          <DialogDescription>
            Uzupełnij pola, aby utworzyć nowy szablon zadania.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium">
              Nazwa szablonu
            </label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa szablonu"
            />
          </div>
          <div>
            <label htmlFor="template-description" className="block text-sm font-medium">
              Opis szablonu
            </label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis szablonu"
            />
          </div>
          <div>
            <label htmlFor="default-priority" className="block text-sm font-medium">
              Domyślny priorytet
            </label>
            <Select
              value={defaultPriority}
              onValueChange={(value) => setDefaultPriority(value as "low" | "medium" | "high")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz priorytet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niski</SelectItem>
                <SelectItem value="medium">Średni</SelectItem>
                <SelectItem value="high">Wysoki</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border p-4 rounded">
            <h4 className="font-medium mb-2">Kroki szablonu</h4>
            {steps.length > 0 && (
              <ul className="mb-2">
                {steps.map((step, index) => (
                  <li key={index}>
                    {step.order}. {step.type} – {step.description}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-sm font-medium">Typ kroku</label>
                <Select
                  value={stepType}
                  onValueChange={(value) => setStepType(value as StepType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ kroku" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retrieval">retrieval</SelectItem>
                    <SelectItem value="processing">processing</SelectItem>
                    <SelectItem value="generation">generation</SelectItem>
                    <SelectItem value="validation">validation</SelectItem>
                    <SelectItem value="custom">custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">Opis kroku</label>
                <Input
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  placeholder="Opis kroku"
                />
              </div>
              <Button variant="secondary" onClick={handleAddStep}>
                Dodaj krok
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit}>Zapisz szablon</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateForm;
