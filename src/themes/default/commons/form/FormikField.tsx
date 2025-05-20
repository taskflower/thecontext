
// src/themes/default/commons/form/FormikField.tsx - najprostsze rozwiązanie
import React, { useState, useEffect } from "react";
import { FormikProps } from "formik";
import { FieldSchema } from "./types";

interface FormikFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
}

// Każdy komponent powinien mieć dokładnie taką samą nazwę jak typ pola w schemacie
const FormikField: React.FC<FormikFieldProps> = ({
  name,
  formik,
  fieldSchema,
  nodeSlug,
  customFields = {},
}) => {
  const { title, required, description, type = "text", fieldType, help } = fieldSchema;
  const error = formik.touched[name] && formik.errors[name];
  const fieldId = `field-${nodeSlug}-${name}`;
  
  // Priorytet: fieldType > type
  const componentType = fieldType || type;
  
  const [FieldComponent, setFieldComponent] = useState<React.ComponentType<any> | null>(null);
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
        
        // 2. Próbuj bezpośrednio zaimportować komponent o takiej samej nazwie jak typ pola
        try {
          // UWAGA: ścieżka powinna być dostosowana do struktury projektu
          const module = await import(`./${componentType}`);
          if (isMounted) setFieldComponent(() => module.default);
        } catch (e) {
          console.warn(`Nie znaleziono komponentu dla typu: ${componentType}`, e);
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
  }, [componentType, customFields]);
  
  // Domyślny komponent wyświetlany podczas ładowania
  if (isLoading) {
    return (
      <div className="my-4 space-y-2">
        <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }
  
  // Fallback do domyślnego komponentu tekstowego jeśli nie znaleziono komponentu
  const Component = FieldComponent || ((props: any) => (
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