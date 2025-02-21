// src/components/documents/customFields/CustomFields.tsx
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trans } from "@lingui/macro";
import { SchemaField } from "@/types/schema";
import { Document, CustomFieldValue } from "@/types/document";
import { useCustomFields } from "@/utils/documents/hooks";


interface CustomFieldsProps {
  schema: SchemaField[];
  document: Document;
  onUpdate: (field: string, value: CustomFieldValue) => void;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  schema,
  document,
  onUpdate,
}) => {
  const { validateField } = useCustomFields(schema);

  const renderField = (field: SchemaField) => {
    const value = document[field.key];
    const handleChange = (newValue: CustomFieldValue) => {
      if (validateField(field.key, newValue)) {
        onUpdate(field.key, newValue);
      }
    };

    switch (field.type) {
      case "text":
      case "select":
        return (
          <Input
            value={value?.toString() || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.name}
            required={field.validation?.required}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value?.toString() || "0"}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={field.name}
            required={field.validation?.required}
          />
        );
      case "date": {
        // Added block scope
        const dateValue =
          value instanceof Date
            ? value.toISOString().split("T")[0]
            : typeof value === "string"
            ? value
            : "";
        return (
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => handleChange(new Date(e.target.value))}
            required={field.validation?.required}
          />
        );
      }
      case "boolean":
        return (
          <Switch checked={Boolean(value)} onCheckedChange={handleChange} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        <Trans>Custom Fields</Trans>
      </h3>
      <div className="space-y-4">
        {schema.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
};
