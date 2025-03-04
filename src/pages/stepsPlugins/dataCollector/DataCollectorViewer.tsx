/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/dataCollector/DataCollectorViewer.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ViewerProps } from "../types";

// Field types definition
type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "url"
  | "date";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  defaultValue?: string | boolean | number;
}

export function DataCollectorViewer({ step, onComplete }: ViewerProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);

  // Initialize form fields from step config or use LLM to generate them
  useEffect(() => {
    if (step.config.fields && step.config.fields.length > 0) {
      setFields(step.config.fields);

      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      step.config.fields.forEach((field: FormField) => {
        if (field.defaultValue !== undefined) {
          initialData[field.id] = field.defaultValue;
        } else if (field.type === "checkbox") {
          initialData[field.id] = false;
        } else {
          initialData[field.id] = "";
        }
      });
      setFormData(initialData);
    } else if (step.config.useLLMToGenerateFields) {
      generateFieldsWithLLM();
    }
  }, [step.config]);

  // Function to generate form fields using LLM
  const generateFieldsWithLLM = async () => {
    setLoadingFields(true);

    try {
      // In a real app, this would call your LLM API
      // For this example, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate different field sets based on step title or description
      const title = step.title.toLowerCase();
      let generatedFields: FormField[] = [];

      if (title.includes("domain") || title.includes("website")) {
        generatedFields = [
          {
            id: "domain",
            label: "Website Domain",
            type: "url",
            required: true,
            placeholder: "https://example.com",
          },
          {
            id: "industry",
            label: "Industry",
            type: "select",
            required: true,
            options: [
              "E-commerce",
              "SaaS",
              "Healthcare",
              "Education",
              "Finance",
              "Other",
            ],
          },
          {
            id: "competitors",
            label: "Main Competitors (comma separated)",
            type: "text",
            required: false,
            placeholder: "competitor1.com, competitor2.com",
          },
        ];
      } else if (title.includes("marketing") || title.includes("campaign")) {
        generatedFields = [
          {
            id: "campaignName",
            label: "Campaign Name",
            type: "text",
            required: true,
          },
          {
            id: "objective",
            label: "Campaign Objective",
            type: "select",
            required: true,
            options: [
              "Brand Awareness",
              "Lead Generation",
              "Sales",
              "Customer Retention",
              "Other",
            ],
          },
          {
            id: "budget",
            label: "Budget",
            type: "number",
            required: true,
            placeholder: "1000",
          },
          {
            id: "timeline",
            label: "Timeline (days)",
            type: "number",
            required: true,
            placeholder: "30",
          },
          {
            id: "targetAudience",
            label: "Target Audience Description",
            type: "textarea",
            required: false,
          },
        ];
      } else {
        // Default generic fields
        generatedFields = [
          {
            id: "name",
            label: "Name",
            type: "text",
            required: true,
          },
          {
            id: "description",
            label: "Description",
            type: "textarea",
            required: false,
          },
          {
            id: "category",
            label: "Category",
            type: "select",
            required: true,
            options: ["Category 1", "Category 2", "Category 3", "Other"],
          },
        ];
      }

      setFields(generatedFields);

      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      generatedFields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.id] = field.defaultValue;
        } else if (field.type === "checkbox") {
          initialData[field.id] = false;
        } else {
          initialData[field.id] = "";
        }
      });
      setFormData(initialData);
    } catch (err) {
      console.error("Failed to generate fields:", err);
    } finally {
      setLoadingFields(false);
    }
  };

  // Handle form field changes
  const handleChange = (id: string, value: any) => {
    setFormData({
      ...formData,
      [id]: value,
    });

    // Clear error for this field if any
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      if (field.required) {
        if (field.type === "checkbox") {
          // For checkbox, just check if it exists
          if (!formData[field.id]) {
            newErrors[field.id] = "This field is required";
            isValid = false;
          }
        } else {
          // For other fields, check if empty
          if (!formData[field.id] || formData[field.id].trim() === "") {
            newErrors[field.id] = "This field is required";
            isValid = false;
          }
        }
      }

      // Additional validation for specific field types
      if (field.type === "url" && formData[field.id]) {
        try {
          new URL(formData[field.id]);
        } catch {
          newErrors[field.id] = "Please enter a valid URL";
          isValid = false;
        }
      }

      if (field.type === "number" && formData[field.id]) {
        if (isNaN(Number(formData[field.id]))) {
          newErrors[field.id] = "Please enter a valid number";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Process the form data
      // In a real app, you might do additional processing here

      // Normalize data based on field types
      const processedData: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.type === "number") {
          processedData[field.id] = Number(formData[field.id]);
        } else {
          processedData[field.id] = formData[field.id];
        }
      });

      // Complete the step
      onComplete({
        formData: processedData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render form fields based on their type
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "url":
        return (
          <Input
            id={field.id}
            type={field.type === "url" ? "url" : "text"}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "select":
        return (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(value) => handleChange(field.id, value)}
          >
            <SelectTrigger id={field.id}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!formData[field.id]}
              onCheckedChange={(checked) => handleChange(field.id, !!checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.placeholder || "Yes"}
            </Label>
          </div>
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  if (loadingFields) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Generating form fields...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.config.title || "Collect Data"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id} className="flex">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-destructive text-xs">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
