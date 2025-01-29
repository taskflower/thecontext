import { FC } from "react";
import { StepData } from "../types/template";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export type PluginComponentProps = {
  data: StepData;
  onChange: (data: Partial<StepData>) => void;
};

export type PluginType = {
  id: string;
  name: string; 
  component: FC<PluginComponentProps>;
  formatLLMMessage: (
    data: StepData
  ) => Array<{ role: string; content: string }>;
};

export const FormPlugin: PluginType = {
  id: "form",
  name: "Form",
  component: ({ data, onChange }) => (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block">
          {data.question}
        </Label>
        <Textarea
          value={data.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          className="min-h-[100px]"
          placeholder="Enter your answer..."
        />
      </div>
    </div>
  ),
  formatLLMMessage: (data) => [
    { role: "assistant", content: data.question },
    { role: "user", content: data.answer },
  ],
};

export const TextCheckboxPlugin: PluginType = {
  id: "textCheckbox",
  name: "Text & Checkbox",
  component: ({ data, onChange }) => (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block">
          {data.question}
        </Label>
        <Input
          value={data.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          placeholder="Enter your answer..."
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="confirm"
          checked={data.confirmed || false}
          onCheckedChange={(checked) => onChange({ confirmed: checked === true })}
        />
        <Label
          htmlFor="confirm"
          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I confirm this answer
        </Label>
      </div>
    </div>
  ),
  formatLLMMessage: (data) => [
    { role: "assistant", content: data.question },
    {
      role: "user",
      content: `${data.answer}${data.confirmed ? " (Confirmed)" : ""}`,
    },
  ],
};

export const plugins: Record<string, PluginType> = {
  form: FormPlugin,
  textCheckbox: TextCheckboxPlugin,
};