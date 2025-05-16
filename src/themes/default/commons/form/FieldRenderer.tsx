// src/themes/default/components/commons/form/FieldRenderer.tsx
import React from "react";
import { FieldSchema } from "./fieldTypes";


interface FieldRendererProps {
  name: string;
  fieldSchema: FieldSchema;
  value: any;
  error?: string;
  handleChange: (name: string, value: any) => void;
  nodeSlug: string;
  components: {
    TagsField: React.FC<any>;
    CheckboxField: React.FC<any>;
    TextField: React.FC<any>;
    NumberField: React.FC<any>;
    TextareaField: React.FC<any>;
    SelectField: React.FC<any>;
  };
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  name,
  fieldSchema,
  value,
  error,
  handleChange,
  nodeSlug,
  components,
}) => {
  const {
    TagsField,
    CheckboxField,
    TextField,
    NumberField,
    TextareaField,
    SelectField,
  } = components;

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