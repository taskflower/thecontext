// src/themes/default/components/FormStep.tsx (zmodyfikowany)
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { TemplateComponentProps } from "@/core";
import { useConfig } from "@/ConfigProvider";
import {
  isSimpleTypeSchema,
  unwrapSimpleValue,
  generateFieldSchemas,
  createValidator,
} from "@/core/hooks/useFormSchema";
import FormikField from "../commons/form/FormikField";
import { FieldSchema } from "../commons/form";

// Przykładowy niestandardowy komponent pola (można wynieść do osobnego pliku)
const ColorPickerField: React.FC<any> = ({ name, formik, fieldId }) => {
  const value = formik.values[name] || "#000000";

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        id={fieldId}
        name={name}
        value={value}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-12 h-8 cursor-pointer"
      />
      <span className="text-sm">{value}</span>
    </div>
  );
};

interface FormStepProps extends TemplateComponentProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  contextSchemaPath?: string;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
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
  customFields,
}) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { config } = useConfig();

  // Standardowe niestandardowe pola, które zawsze dostępne w FormStep
  const defaultCustomFields = useMemo(
    () => ({
      color: ColorPickerField,
      // Tutaj można dodać więcej niestandardowych pól
    }),
    []
  );

  // Połączenie domyślnych i przekazanych niestandardowych pól
  const allCustomFields = useMemo(
    () => ({
      ...defaultCustomFields,
      ...customFields,
    }),
    [defaultCustomFields, customFields]
  );

  // Pobierz schemat z kontekstu workspace'a
  const contextSchema = useMemo(() => {
    if (!contextSchemaPath || !workspaceSlug || !config) return null;

    const workspace = config.workspaces.find((ws) => ws.slug === workspaceSlug);
    if (!workspace) return null;

    // Nawiguj do właściwego podschematu
    const pathSegments = contextSchemaPath.split(".");
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
    if (
      isSimpleType &&
      data !== undefined &&
      (typeof data !== "object" || data === null)
    ) {
      return { value: data };
    }
    return data || {};
  }, [data, isSimpleType]);

  // Generuj schematy pól
  const fieldSchemas = useMemo(
    () => generateFieldSchemas(effectiveSchema, isSimpleType),
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
    onSubmit: (values) => {
      const submitData = isSimpleType ? unwrapSimpleValue(values) : values;
      onSubmit(submitData);
    },
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
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
                {fieldSchemas[field]?.title || field}:{" "}
                <span className="text-gray-500">{String(error)}</span>
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
              fieldSchema={schema as FieldSchema}
              nodeSlug={nodeSlug}
              customFields={allCustomFields}
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
