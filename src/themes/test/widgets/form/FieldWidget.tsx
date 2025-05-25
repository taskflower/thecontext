// src/themes/test/widgets/form/FieldWidget.tsx
import React from "react";
import TextFieldWidget from "./TextFieldWidget";
import CheckboxFieldWidget from "./CheckboxFieldWidget";
import SelectFieldWidget from "./SelectFieldWidget";
import DateFieldWidget from "./DateFieldWidget";
import EmailFieldWidget from "./EmailFieldWidget";
import NumberFieldWidget from "./NumberFieldWidget";
import TextareaFieldWidget from "./TextareaFieldWidget";

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
    [key: string]: any; // dla dodatkowych właściwości
  };
  value: any;
  onChange: (key: string, value: any) => void;
}

// Mapa widgetów
const WIDGET_MAP: { [key: string]: React.ComponentType<any> } = {
  text: TextFieldWidget,
  textarea: TextareaFieldWidget,
  select: SelectFieldWidget,
  date: DateFieldWidget,
  email: EmailFieldWidget,
  number: NumberFieldWidget,
  checkbox: CheckboxFieldWidget,
};

// Główny komponent FieldWidget
export const FieldWidget: React.FC<FieldWidgetProps> = ({
  field,
  value,
  onChange,
}) => {
  // Automatyczne mapowanie typu na podstawie field
  let widgetType = "text"; // domyślny

  if (field.widget) {
    // Jeśli jest explicit widget, użyj go
    widgetType = field.widget;
  } else {
    // Automatyczne wykrywanie na podstawie innych właściwości
    if (field.type === "boolean") {
      widgetType = "checkbox";
    } else if (field.enum) {
      widgetType = "select";
    } else if (field.format === "date") {
      widgetType = "date";
    } else if (field.format === "email") {
      widgetType = "email";
    } else if (field.type === "number" || field.type === "integer") {
      widgetType = "number";
    }
  }

  const WidgetComponent = WIDGET_MAP[widgetType];

  if (!WidgetComponent) {
    console.warn(`Widget type "${widgetType}" not found, using text input`);

    // Fallback - prosty input
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          {field.label || field.key}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 text-sm border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400"
          required={field.required}
        />
        {field.description && (
          <p className="text-xs text-zinc-500">{field.description}</p>
        )}
      </div>
    );
  }

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
