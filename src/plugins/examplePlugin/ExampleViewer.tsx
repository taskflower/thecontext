// plugins/example-input/ExampleViewer.tsx
import React, { useState } from "react";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "@/components/ui";
import { StepViewerProps } from "../types";


export function ExampleViewer({ step, context, onComplete, onError }: StepViewerProps) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const {
    placeholder = "Enter something...",
    label = "Example Input",
    required = true,
  } = step.data || {};

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(null);
  };

  // Handle submission
  const handleSubmit = () => {
    if (required && !value.trim()) {
      setError("This field is required");
      return;
    }

    // Call onComplete with the input value
    onComplete(
      { value, timestamp: new Date().toISOString() },
      { [`${step.id}_value`]: value }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || "Example Input"}</CardTitle>
        {step.description && (
          <CardDescription>{step.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{label}</label>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={required && !value.trim()}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}