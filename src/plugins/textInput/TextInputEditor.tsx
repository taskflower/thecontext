/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/textInput/TextInputEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StepEditorProps } from '../types';

export function TextInputEditor({ step, onChange }: StepEditorProps) {
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
        <Label htmlFor="title">Tytuł kroku</Label>
        <Input
          id="title"
          value={step.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Opis kroku</Label>
        <Textarea
          id="description"
          value={step.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="label">Etykieta pola</Label>
        <Input
          id="label"
          value={data.label || ""}
          onChange={(e) => updateData("label", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="placeholder">Tekst podpowiedzi</Label>
        <Input
          id="placeholder"
          value={data.placeholder || ""}
          onChange={(e) => updateData("placeholder", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="minLength">Minimalna długość</Label>
          <Input
            id="minLength"
            type="number"
            min="0"
            value={data.minLength || 0}
            onChange={(e) =>
              updateData("minLength", parseInt(e.target.value) || 0)
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxLength">Maksymalna długość</Label>
          <Input
            id="maxLength"
            type="number"
            min="0"
            value={data.maxLength || 1000}
            onChange={(e) =>
              updateData("maxLength", parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={data.required !== false}
          onCheckedChange={(checked) => updateData("required", checked)}
        />
        <Label htmlFor="required">Wymagane</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="multiline"
          checked={data.multiline !== false}
          onCheckedChange={(checked) => updateData("multiline", checked)}
        />
        <Label htmlFor="multiline">Wieloliniowe</Label>
      </div>

      {data.multiline !== false && (
        <div className="grid gap-2">
          <Label htmlFor="rows">Liczba wierszy</Label>
          <Input
            id="rows"
            type="number"
            min="2"
            max="20"
            value={data.rows || 6}
            onChange={(e) =>
              updateData("rows", parseInt(e.target.value) || 6)
            }
          />
        </div>
      )}
    </div>
  );
}