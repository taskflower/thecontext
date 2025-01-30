import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { PluginRuntimeProps } from "../base";
import { FormConfig, FormRuntimeData } from "./types";
import { useEffect } from "react";

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  config,
  data,
  onDataChange,
  onStatusChange,
}) => {
  const formConfig = config as FormConfig;
  const formData = data as FormRuntimeData;

  // Debug
  useEffect(() => {
    console.log("RuntimeComponent - current data:", data);
  }, [data]);

  const validateAnswer = (newData: FormRuntimeData) => {
    const isValid =
      (!formConfig.required || !!newData.answer) &&
      (!formConfig.minLength ||
        (newData.answer?.length || 0) >= formConfig.minLength);
    onStatusChange(isValid);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    const newData: FormRuntimeData = {
      answer,
      isConfirmed: true,
    };

    console.log("handleAnswerChange - sending new data:", newData);
    onDataChange(newData);
    validateAnswer(newData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-3xl font-bold pb-4">{formConfig.question}</h3>
        <Label>Your answer</Label>
        <Input
          value={formData?.answer || ""}
          onChange={handleAnswerChange}
          placeholder="Type your answer..."
        />
      </div>
      {formConfig.minLength && (
        <p className="text-sm text-muted-foreground">
          Minimum length: {formConfig.minLength} characters
        </p>
      )}
    </div>
  );
};
