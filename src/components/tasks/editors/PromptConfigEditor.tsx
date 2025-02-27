/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/tasks/editors/PromptConfigEditor.tsx
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { IPromptConfig } from "@/utils/tasks/taskTypes";

interface PromptConfigEditorProps {
  value: IPromptConfig;
  onChange: (config: IPromptConfig) => void;
}

export const PromptConfigEditor: React.FC<PromptConfigEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Konfiguracja promptu LLM</h3>

      <div>
        <label className="text-sm">Prompt systemowy</label>
        <Textarea
          value={value.systemPrompt}
          onChange={(e) => onChange({ ...value, systemPrompt: e.target.value })}
          rows={5}
          placeholder="Jesteś asystentem AI, który..."
        />
      </div>

      <div>
        <label className="text-sm">
          Szablon promptu użytkownika (użyj {"`{{`"}zmienna{"`}}`"} dla
          zmiennych)
        </label>
        <Textarea
          value={value.userPromptTemplate}
          onChange={(e) =>
            onChange({ ...value, userPromptTemplate: e.target.value })
          }
          rows={8}
          placeholder="Potrzebuję pomocy z {{temat}}..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Przykład: Potrzebuję stworzyć projekt o nazwie "{"`{{`"} projectName {"`}}`"}" z
          opisem: "{"`}}`"} projectDescription {"`}}`"}".
        </p>
      </div>

      <div>
        <label className="text-sm">Format wyjściowy</label>
        <Select
          value={value.outputFormat || "text"}
          onValueChange={(value) =>
            onChange({
              ...value,
              outputFormat: value as any,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Tekst</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm">Zmienne (oddzielone przecinkiem)</label>
        <Input
          value={value.variables?.join(", ") || ""}
          onChange={(e) =>
            onChange({
              ...value,
              variables: e.target.value.split(",").map((v) => v.trim()),
            })
          }
          placeholder="projektName, projektDescription, ..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Zmienne z poprzednich kroków, które zostaną podstawione w promptu.
        </p>
      </div>
    </div>
  );
};
