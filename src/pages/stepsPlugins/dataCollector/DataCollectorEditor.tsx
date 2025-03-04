/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/dataCollector/DataCollectorEditor.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorProps } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function DataCollectorEditor({ step, onChange }: EditorProps) {
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [currentField, setCurrentField] = useState<any>(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(
    null
  );

  // Ensure fields array exists
  const fields = step.config.fields || [];

  // Add a new field
  const addField = () => {
    const newFields = [...fields];
    const newField = {
      id: `field-${Date.now()}`,
      label: `Field ${newFields.length + 1}`,
      type: "text",
      required: false,
      placeholder: "",
    };
    newFields.push(newField);

    onChange({
      config: {
        ...step.config,
        fields: newFields,
      },
    });
  };

  // Delete a field
  const deleteField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);

    onChange({
      config: {
        ...step.config,
        fields: newFields,
      },
    });
  };

  // Open field settings dialog
  const openFieldSettings = (field: any, index: number) => {
    setCurrentField({ ...field });
    setCurrentFieldIndex(index);
    setShowFieldSettings(true);
  };

  // Save field settings
  const saveFieldSettings = () => {
    if (currentField && currentFieldIndex !== null) {
      const newFields = [...fields];
      newFields[currentFieldIndex] = currentField;

      onChange({
        config: {
          ...step.config,
          fields: newFields,
        },
      });

      setShowFieldSettings(false);
      setCurrentField(null);
      setCurrentFieldIndex(null);
    }
  };

  // Toggle LLM field generation
  const toggleLLMFieldGeneration = (checked: boolean) => {
    onChange({
      config: {
        ...step.config,
        useLLMToGenerateFields: checked,
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

      <div className="flex items-center gap-2">
        <Switch
          id="useLLMToGenerateFields"
          checked={step.config.useLLMToGenerateFields || false}
          onCheckedChange={toggleLLMFieldGeneration}
        />
        <Label htmlFor="useLLMToGenerateFields">Generate fields using AI</Label>
      </div>

      {step.config.useLLMToGenerateFields && (
        <div className="grid gap-2">
          <Label htmlFor="fieldGenerationPrompt">Field Generation Prompt</Label>
          <Textarea
            id="fieldGenerationPrompt"
            value={step.config.fieldGenerationPrompt || ""}
            onChange={(e) =>
              onChange({
                config: {
                  ...step.config,
                  fieldGenerationPrompt: e.target.value,
                },
              })
            }
            placeholder="Generate form fields to collect data for:"
          />
          <p className="text-xs text-muted-foreground">
            This prompt will be sent to the AI to generate form fields.
          </p>
        </div>
      )}

      {!step.config.useLLMToGenerateFields && (
        <>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Form Fields</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addField}
                className="h-8 gap-1"
              >
                <Plus size={14} />
                Add Field
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              {fields.map((field: any, index: number) => (
                <Card key={field.id} className="shadow-none border">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GripVertical
                          size={14}
                          className="text-muted-foreground"
                        />
                        {field.label}
                        {field.required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openFieldSettings(field, index)}
                          className="h-7 w-7 p-0"
                        >
                          <Settings size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteField(index)}
                          className="h-7 w-7 p-0 text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4 text-xs text-muted-foreground flex items-center gap-2">
                    <span className="bg-secondary px-2 py-0.5 rounded">
                      {field.type}
                    </span>
                    <span>{field.placeholder || "No placeholder"}</span>
                  </CardContent>
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="text-center p-4 border rounded-md text-muted-foreground">
                  No fields added yet. Click "Add Field" to create form fields.
                </div>
              )}
            </div>
          </div>

          {/* Field Settings Dialog */}
          {currentField && (
            <Dialog
              open={showFieldSettings}
              onOpenChange={setShowFieldSettings}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Field Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fieldLabel">Label</Label>
                    <Input
                      id="fieldLabel"
                      value={currentField.label || ""}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          label: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fieldId">Field ID</Label>
                    <Input
                      id="fieldId"
                      value={currentField.id || ""}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          id: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select
                      value={currentField.type}
                      onValueChange={(value) =>
                        setCurrentField({
                          ...currentField,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger id="fieldType">
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(currentField.type === "text" ||
                    currentField.type === "textarea" ||
                    currentField.type === "number" ||
                    currentField.type === "url") && (
                    <div className="grid gap-2">
                      <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                      <Input
                        id="fieldPlaceholder"
                        value={currentField.placeholder || ""}
                        onChange={(e) =>
                          setCurrentField({
                            ...currentField,
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {currentField.type === "select" && (
                    <div className="grid gap-2">
                      <Label htmlFor="fieldOptions">
                        Options (one per line)
                      </Label>
                      <Textarea
                        id="fieldOptions"
                        value={(currentField.options || []).join("\n")}
                        onChange={(e) =>
                          setCurrentField({
                            ...currentField,
                            options: e.target.value
                              .split("\n")
                              .filter((o: string) => o.trim() !== ""),
                          })
                        }
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch
                      id="fieldRequired"
                      checked={currentField.required || false}
                      onCheckedChange={(checked) =>
                        setCurrentField({
                          ...currentField,
                          required: checked,
                        })
                      }
                    />
                    <Label htmlFor="fieldRequired">Required field</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowFieldSettings(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveFieldSettings}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
