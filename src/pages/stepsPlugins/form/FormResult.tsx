// src/pages/stepsPlugins/form/FormResult.tsx
import { FormInput } from "lucide-react";
import { ResultRendererProps } from "../types";

export default function FormResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  const fields = Object.keys(result || {});
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FormInput size={16} className="text-purple-500" />
        <span className="font-medium">Form Submission</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map(field => (
          <div key={field} className="flex flex-col">
            <span className="text-xs text-muted-foreground">{field}</span>
            <span className="font-mono">{result[field]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}