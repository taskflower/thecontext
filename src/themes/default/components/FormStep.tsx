// src/themes/default/components/FormStep.tsx (z Formikiem)
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { TemplateComponentProps } from "@/core";
import { useConfig } from "@/ConfigProvider";
import { 
  isSimpleTypeSchema, 
  unwrapSimpleValue, 
  generateFieldSchemas, 
  createValidator 
} from "@/core/hooks/useFormSchema";
import FormikField from "../commons/form/FormikField";


interface FormStepProps extends TemplateComponentProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  contextSchemaPath?: string;
  nodeSlug?: string;
}

const FormStep: React.FC<FormStepProps> = ({
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  contextSchemaPath,
  nodeSlug,
}) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { config } = useConfig();
  
  // Pobierz schemat z kontekstu workspace'a
  const contextSchema = useMemo(() => {
    if (!contextSchemaPath || !workspaceSlug || !config) return null;

    const workspace = config.workspaces.find(ws => ws.slug === workspaceSlug);
    if (!workspace) return null;

    // Nawiguj do właściwego podschematu
    const pathSegments = contextSchemaPath.split('.');
    let currentSchema = workspace.contextSchema.properties[pathSegments[0]];
    
    for (let i = 1; i < pathSegments.length; i++) {
      if (!currentSchema?.properties?.[pathSegments[i]]) return null;
      currentSchema = currentSchema.properties[pathSegments[i]];
    }

    return currentSchema;
  }, [config, workspaceSlug, contextSchemaPath]);

  // Wybierz odpowiedni schemat
  const effectiveSchema = jsonSchema || contextSchema || {};
  
  // Sprawdź czy to prosty typ
  const isSimpleType = isSimpleTypeSchema(effectiveSchema);
  
  // Przygotuj początkowe dane
  const initialValues = useMemo(() => {
    if (isSimpleType && data !== undefined && 
        (typeof data !== 'object' || data === null)) {
      return { value: data };
    }
    return data || {};
  }, [data, isSimpleType]);

  // Generuj schematy pól
  const fieldSchemas = useMemo(() => 
    generateFieldSchemas(effectiveSchema, isSimpleType),
    [effectiveSchema, isSimpleType]
  );

  // Czy są wymagane pola
  const hasRequiredFields = Object.values(fieldSchemas).some(
    (schema: any) => schema.required
  );

  // Utwórz validator
  const validate = createValidator(effectiveSchema, isSimpleType);

  // Inicjalizacja Formika
  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: values => {
      // Dla prostych typów odwijamy wartość
      const submitData = isSimpleType ? unwrapSimpleValue(values) : values;
      onSubmit(submitData);
    },
    validateOnChange: false,   // Wyłączamy walidację przy zmianie wartości
    validateOnBlur: false,     // Wyłączamy walidację przy opuszczeniu pola
    enableReinitialize: true
  });

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {/* Podsumowanie walidacji */}
      {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded mb-4">
          <p className="font-medium mb-2">Formularz zawiera błędy:</p>
          <ul className="text-sm list-disc pl-5">
            {Object.entries(formik.errors).map(([field, error]) => (
              <li key={field}>
                {fieldSchemas[field]?.title || field}: {String(error)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        {Object.keys(fieldSchemas).length > 0 ? (
          Object.entries(fieldSchemas).map(([name, schema]) => (
            <FormikField
              key={name}
              name={name}
              formik={formik}
              fieldSchema={schema}
              nodeSlug={nodeSlug}
            />
          ))
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-red-600">
              Nie znaleziono pól formularza dla podanej ścieżki.
            </p>
            <p className="text-red-500 text-sm">
              Sprawdź konfigurację ścieżki: <strong>{contextSchemaPath}</strong>
            </p>
          </div>
        )}

        {hasRequiredFields && (
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        )}
        
        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
};

export default FormStep;