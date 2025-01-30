import { FC, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { plugins } from "@/plugins";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step } from "@/types/template";
import { Textarea } from "@/components/ui/textarea";

interface StepEditorProps {
  step?: Step;
  onSubmit: (step: Step) => void;
}

export const StepEditor: FC<StepEditorProps> = ({ step, onSubmit }) => {
  const [stepData, setStepData] = useState<Step>(() => ({
    id: step?.id || Date.now().toString(),
    name: step?.name || "",
    description: step?.description || "",
    pluginId: step?.pluginId || "",
    config: step?.config || {},
    data: step?.data || {},  // Dodane brakujące pole data
  }));

  const [isValid, setIsValid] = useState(false);
  const selectedPlugin = plugins[stepData.pluginId];

  useEffect(() => {
    const initializePlugin = async () => {
      if (selectedPlugin?.initialize) {
        try {
          await selectedPlugin.initialize(stepData.config);
        } catch (error) {
          console.error("Plugin initialization error:", error);
        }
      }
    };
    initializePlugin();
  }, [selectedPlugin, stepData.config]);

  useEffect(() => {
    const validateStep = async () => {
      if (selectedPlugin?.validate) {
        const isValid = await selectedPlugin.validate(stepData.config);
        setIsValid(isValid);
      } else {
        setIsValid(true);
      }
    };
    validateStep();
  }, [selectedPlugin, stepData.config]);

  const handlePluginChange = (pluginId: string) => {
    setStepData((prev) => ({
      ...prev,
      pluginId,
      config: {}, // Reset config when plugin changes
      data: {},   // Reset data when plugin changes
    }));
  };

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    setStepData((prev) => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(stepData);
    }
  };

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
        <Select value={stepData.pluginId} onValueChange={handlePluginChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select plugin" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(plugins).map((plugin) => (
              <SelectItem key={plugin.id} value={plugin.id}>
                {plugin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlugin?.ConfigComponent && (
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Plugin Configuration</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <selectedPlugin.ConfigComponent
              config={stepData.config}
              onConfigChange={handleConfigChange}
              onStatusChange={setIsValid}
            />
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" disabled={!isValid}>
        {step ? "Save Changes" : "Add Step"}
      </Button>
    </form>
  );
};