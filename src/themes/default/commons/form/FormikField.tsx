// src/themes/default/commons/form/FormikField.tsx - z poprawioną ścieżką do motywu
import React, { useState, useEffect } from "react";
import { FormikProps } from "formik";
import { FieldSchema } from "./types";

interface FormikFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
  themeName?: string;
}

const FormikField: React.FC<FormikFieldProps> = ({
  name,
  formik,
  fieldSchema,
  nodeSlug,
  customFields = {},
  themeName = "default",
}) => {
  const {
    title,
    required,
    description,
    type = "text",
    fieldType,
    help,
  } = fieldSchema;
  const error = formik.touched[name] && formik.errors[name];
  const fieldId = `field-${nodeSlug}-${name}`;

  // Priorytet: fieldType > type
  const componentType = fieldType || type;
  
  // Sprawdzamy, czy pole jest ukryte
  const isHidden = componentType === "hidden";

  const [FieldComponent, setFieldComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ładuj komponent raz, podczas montowania
  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        // 1. Najpierw sprawdź w customFields (przekazane przez props)
        if (customFields[componentType]) {
          if (isMounted) setFieldComponent(customFields[componentType]);
          return;
        }

        // 2. Spróbuj załadować komponent na podstawie typu
        try {
          let componentModule: { default: any };

          // Jeśli to nie motyw default, próbuj najpierw załadować z motywu potomnego
          if (themeName !== "default") {
            try {
              // Poprawiona ścieżka: zamieniamy "common" na "commons"
              componentModule = await import(
                `../../../${themeName}/commons/form/${componentType}`
              );
              if (isMounted) setFieldComponent(() => componentModule.default);
              return;
            } catch (error) {
              console.log(
                `Komponent ${componentType} nie znaleziony w ${themeName}/commons/form, próbuję ${themeName}/common/form`
              );
              
              // Próba alternatywnej ścieżki (dla kompatybilności wstecznej)
              try {
                componentModule = await import(
                  `../../../${themeName}/common/form/${componentType}`
                );
                if (isMounted) setFieldComponent(() => componentModule.default);
                return;
              } catch (innerError) {
                console.log(
                  `Komponent ${componentType} nie znaleziony w ${themeName}/common/form, próbuję default`
                );
              }
            }
          }

          // Ładowanie z default - używamy względnej ścieżki
          componentModule = await import(`./${componentType}`);
          if (isMounted) setFieldComponent(() => componentModule.default);
        } catch (error) {
          console.warn(`Nie znaleziono komponentu dla typu: ${componentType}`);
          if (isMounted) setFieldComponent(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [componentType, customFields, themeName]);

  // Domyślny komponent wyświetlany podczas ładowania
  if (isLoading) {
    // Dla ukrytych pól nie pokazujemy placeholdera ładowania
    if (isHidden) {
      return null;
    }
    
    return (
      <div className="my-4 space-y-2">
        <label
          htmlFor={fieldId}
          className="text-sm font-semibold text-gray-900"
        >
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  // Fallback do domyślnego komponentu tekstowego jeśli nie znaleziono komponentu
  const Component =
    FieldComponent ||
    ((props: any) => (
      <div className="relative w-full border rounded border-orange-200 px-3 py-2 bg-orange-50">
        <input
          type="text"
          id={props.fieldId}
          name={props.name}
          value={props.formik.values[props.name] || ""}
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
        <div className="text-xs text-orange-600 mt-1">
          Brak komponentu dla typu: {componentType}
        </div>
      </div>
    ));

  // Specjalna obsługa dla pola ukrytego - renderujemy tylko sam komponent bez opakowania
  if (isHidden) {
    return (
      <Component
        name={name}
        formik={formik}
        fieldSchema={fieldSchema}
        fieldId={fieldId}
      />
    );
  }

  // Standardowe renderowanie dla widocznych pól
  return (
    <div className="my-4 space-y-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>

      {description && <p className="text-sm text-gray-500">{description}</p>}

      <Component
        name={name}
        formik={formik}
        fieldSchema={fieldSchema}
        fieldId={fieldId}
      />

      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}

      {error && <p className="text-red-500 text-xs mt-1">{String(error)}</p>}
    </div>
  );
};

export default FormikField;