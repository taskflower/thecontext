// src/themes/default/commons/form/FieldRenderer.tsx
import React from "react";
import TagsField from "./TagsField";
import CheckboxField from "./CheckboxField";
import TextField from "./TextField";
import NumberField from "./NumberField";
import TextareaField from "./TextareaField";
import SelectField from "./SelectField";
import { FieldSchema } from "./fieldTypes";

interface FieldRendererProps {
  name: string;
  fieldSchema: FieldSchema;
  value: any;
  error?: string;
  handleChange: (name: string, value: any) => void;
  nodeSlug: string;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  name,
  fieldSchema,
  value,
  error,
  handleChange,
  nodeSlug,
}) => {
  const common = {
    fieldName: name,
    fieldSchema,
    fieldValue: value,
    fieldError: error,
    handleChange,
    nodeSlug,
  };

  if (fieldSchema.isArray && fieldSchema.options) {
    return <TagsField {...common} />;
  }

  switch (fieldSchema.fieldType) {
    case "checkbox":
      return <CheckboxField {...common} />;
    case "text":
    case "email":
    case "date":
      return <TextField {...common} />;
    case "number":
      return <NumberField {...common} />;
    case "textarea":
      return <TextareaField {...common} />;
    case "select":
      return <SelectField {...common} />;
    default:
      return <TextField {...common} />;
  }
};

export default FieldRenderer;
