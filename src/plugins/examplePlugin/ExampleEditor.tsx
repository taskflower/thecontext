/* eslint-disable @typescript-eslint/no-explicit-any */
// plugins/example-input/ExampleEditor.tsx

import { Input, Label, Switch } from "@/components/ui";
import { StepEditorProps } from "../../modules/pluginSystem/types";

export function ExampleEditor({ step, onChange }: StepEditorProps) {
  const { data = {} } = step;

  const updateData = (key: string, value: any) => {
    onChange({
      data: {
        ...data,
        [key]: value,
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Step Title</Label>
        <Input
          id="title"
          value={step.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Step Description</Label>
        <Input
          id="description"
          value={step.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="label">Field Label</Label>
        <Input
          id="label"
          value={data.label || ""}
          onChange={(e) => updateData("label", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="placeholder">Placeholder Text</Label>
        <Input
          id="placeholder"
          value={data.placeholder || ""}
          onChange={(e) => updateData("placeholder", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={data.required !== false}
          onCheckedChange={(checked) => updateData("required", checked)}
        />
        <Label htmlFor="required">Required</Label>
      </div>
    </div>
  );
}
