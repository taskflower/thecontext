// src/components/StepEditor.tsx
import { FC, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { plugins } from "@/plugins";
import { PluginSelector } from "@/components/PluginSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step } from "@/types/template";
import { Textarea } from "@/components/ui/textarea";

interface StepEditorProps {
  step?: Step;
  onSubmit: (step: Step) => void;
  onCancel: () => void;
}

export const StepEditor: FC<StepEditorProps> = ({ step, onSubmit, onCancel }) => {
  const [stepData, setStepData] = useState<Step>({
    id: step?.id || Date.now().toString(),
    name: step?.name || "",
    description: step?.description || "",
    pluginId: step?.pluginId || "",
    config: step?.config || {},
    data: step?.data || {},
  });
  const [isValid, setIsValid] = useState(false);
  const [showPluginSelector, setShowPluginSelector] = useState(false);

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
    setShowPluginSelector(false);
  };

  const handleConfigChange = (newConfig: Record<string, unknown>) =>
    setStepData((prev) => ({ ...prev, config: { ...prev.config, ...newConfig } }));

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
        {stepData.pluginId ? (
          <div className="flex items-center space-x-2">
            <span>{plugins[stepData.pluginId].name}</span>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPluginSelector(true)}
            >
              Change Plugin
            </Button>
          </div>
        ) : (
          <Button 
            type="button" 
            onClick={() => setShowPluginSelector(true)}
          >
            Select Plugin
          </Button>
        )}
      </div>

      {showPluginSelector && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Select Plugin</CardTitle>
          </CardHeader>
          <CardContent>
            <PluginSelector onSelect={handlePluginChange} />
          </CardContent>
        </Card>
      )}

      {ConfigComponent && (
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Plugin Configuration</CardTitle>
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