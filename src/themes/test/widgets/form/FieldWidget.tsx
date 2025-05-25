// src/themes/test/widgets/form/FieldWidget.tsx
import React from "react";

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

// Główny komponent FieldWidget
export const FieldWidget: React.FC<FieldWidgetProps> = ({
  field,
  value,
  onChange,
}) => {
  // Określenie nazwy widgetu - z fieldType lub widget (backward compatibility) lub domyślny text
  const widgetName = field.fieldType || field.widget || "text";

  // Dynamiczne importowanie komponentu
  const WidgetComponent = React.lazy(() =>
    import(`./${widgetName}`).catch(() =>
      import(`./text`) // fallback do text
    )
  );

  return (
    <React.Suspense fallback={<div className="animate-pulse h-16 bg-gray-100 rounded"></div>}>
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
    </React.Suspense>
  );
};