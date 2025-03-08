// src/pages/stepsPlugins/textInput/TextInputEditor.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EditorProps } from "../types";

export function TextInputEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};

  const updateConfig = (key: string, value: any) => {
    onChange({
      config: {
        ...config,
        [key]: value,
      },
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
        <Textarea
          id="description"
          value={step.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="label">Field Label</Label>
        <Input
          id="label"
          value={config.label || ""}
          onChange={(e) => updateConfig("label", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="placeholder">Placeholder Text</Label>
        <Input
          id="placeholder"
          value={config.placeholder || ""}
          onChange={(e) => updateConfig("placeholder", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="minLength">Minimum Length</Label>
          <Input
            id="minLength"
            type="number"
            min="0"
            value={config.minLength || 0}
            onChange={(e) =>
              updateConfig("minLength", parseInt(e.target.value) || 0)
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxLength">Maximum Length</Label>
          <Input
            id="maxLength"
            type="number"
            min="0"
            value={config.maxLength || 1000}
            onChange={(e) =>
              updateConfig("maxLength", parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={config.required !== false}
          onCheckedChange={(checked) => updateConfig("required", checked)}
        />
        <Label htmlFor="required">Required</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="multiline"
          checked={config.multiline !== false}
          onCheckedChange={(checked) => updateConfig("multiline", checked)}
        />
        <Label htmlFor="multiline">Multiline Input</Label>
      </div>

      {config.multiline !== false && (
        <div className="grid gap-2">
          <Label htmlFor="rows">Number of Rows</Label>
          <Input
            id="rows"
            type="number"
            min="2"
            max="20"
            value={config.rows || 6}
            onChange={(e) =>
              updateConfig("rows", parseInt(e.target.value) || 6)
            }
          />
        </div>
      )}
    </div>
  );
}
