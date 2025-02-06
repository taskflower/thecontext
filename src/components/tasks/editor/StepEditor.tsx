// StepEditor.tsx
import { FC, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { plugins } from "@/plugins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step } from "@/types/template";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface StepEditorProps {
  step?: Step;
  onSubmit: (step: Step) => void;
  onCancel: () => void;
}

export const StepEditor: FC<StepEditorProps> = ({ step, onSubmit, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stepData, setStepData] = useState<Step>({
    id: step?.id || Date.now().toString(),
    name: step?.name || "",
    description: step?.description || "",
    pluginId: step?.pluginId || "",
    config: step?.config || {},
    data: step?.data || {},
  });
  const [isValid, setIsValid] = useState(false);

  const selectedPlugin = plugins[stepData.pluginId];
  const ConfigComponent = selectedPlugin?.ConfigComponent;

  useEffect(() => {
    if (selectedPlugin?.initialize) {
      selectedPlugin.initialize(stepData.config).catch((err) =>
        console.error("Plugin initialization error:", err)
      );
    }
  }, [selectedPlugin, stepData.config]);

  useEffect(() => {
    if (selectedPlugin?.validate) {
      selectedPlugin.validate(stepData.config).then(setIsValid);
    } else {
      setIsValid(true);
    }
  }, [selectedPlugin, stepData.config]);

  const handlePluginChange = (pluginId: string) => {
    setStepData((prev) => ({ ...prev, pluginId, config: {}, data: {} }));
    setIsOpen(false);
  };

  const handleConfigChange = (newConfig: Record<string, unknown>) =>
    setStepData((prev) => ({ ...prev, config: { ...prev.config, ...newConfig } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(stepData);
    }
  };

  const pluginsList = Object.entries(plugins);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={stepData.name}
          onChange={(e) =>
            setStepData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Step name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={stepData.description}
          onChange={(e) =>
            setStepData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Step description"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Plugin</label>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                {stepData.pluginId && plugins[stepData.pluginId].icon}
                {stepData.pluginId ? plugins[stepData.pluginId].name : "Select plugin"}
              </div>
              <span className="ml-2 text-muted-foreground">⌘K</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>Select Plugin</SheetTitle>
              <SheetDescription>
                Select a plugin to process this step
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
              <div className="space-y-2">
                {pluginsList.map(([id, plugin]) => (
                  <div 
                    key={id}
                    className={`cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                      stepData.pluginId === id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handlePluginChange(id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {plugin.icon}
                        <span className="font-medium">{plugin.name}</span>
                      </div>
                      {stepData.pluginId === id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {plugin.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{plugin.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {ConfigComponent && (
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Plugin configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ConfigComponent
              config={stepData.config}
              onConfigChange={handleConfigChange}
              onStatusChange={setIsValid}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          {step ? "Save changes" : "Add step"}
        </Button>
      </div>
    </form>
  );
};

export default StepEditor;
