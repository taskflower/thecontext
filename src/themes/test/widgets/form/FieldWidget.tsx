// src/themes/test/widgets/form/FieldWidget.tsx
import React from "react";
import TextFieldWidget from "./text";
import TextareaFieldWidget from "./textarea";
import NumberFieldWidget from "./number";
import EmailFieldWidget from "./email";
import DateFieldWidget from "./date";
import SelectFieldWidget from "./select";
import CheckboxFieldWidget from "./checkbox";

// Typ dla props FieldWidget
export interface FieldWidgetProps {
  field: {
    type: string;
    label?: string;
    key: string;
    required?: boolean;
    placeholder?: string;
    description?: string;
    default?: any;
    enum?: string[];
    enumLabels?: { [key: string]: string };
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    widget?: string; // explicit widget name
    fieldType?: string; // explicit field type name
    [key: string]: any;
  };
  value: any;
  onChange: (key: string, value: any) => void;
}

// Mapowanie widgetów
const widgetMap: { [key: string]: React.ComponentType<any> } = {
  text: TextFieldWidget,
  textarea: TextareaFieldWidget,
  number: NumberFieldWidget,
  email: EmailFieldWidget,
  date: DateFieldWidget,
  select: SelectFieldWidget,
  checkbox: CheckboxFieldWidget,
};

// Główny komponent FieldWidget
export const FieldWidget: React.FC<FieldWidgetProps> = ({
  field,
  value,
  onChange,
}) => {
  // Określenie nazwy widgetu
  let widgetName = field.fieldType || field.widget;
  
  // Jeśli nie ma explicit widget, określ na podstawie typu i właściwości
  if (!widgetName) {
    if (field.enum) {
      widgetName = "select";
    } else if (field.type === "boolean") {
      widgetName = "checkbox";
    } else if (field.type === "number" || field.type === "integer") {
      widgetName = "number";
    } else if (field.format === "email") {
      widgetName = "email";
    } else if (field.format === "date") {
      widgetName = "date";
    } else if (field.widget === "textarea") {
      widgetName = "textarea";
    } else {
      widgetName = "text";
    }
  }

  // Pobierz komponent widgetu
  const WidgetComponent = widgetMap[widgetName] || widgetMap.text;

  return (
    <WidgetComponent
      title={field.label}
      attrs={{
        fieldKey: field.key,
        field: field,
        value: value,
        onChange: onChange,
        placeholder: field.placeholder,
        required: field.required,
        // Przekazanie wszystkich dodatkowych props
        ...Object.fromEntries(
          Object.entries(field).filter(
            ([key]) =>
              ![
                "type",
                "label",
                "key",
                "required",
                "placeholder",
                "description",
                "default",
              ].includes(key)
          )
        ),
      }}
    />
  );
};