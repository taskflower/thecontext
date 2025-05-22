// src/themes/test/steps/FormStep.tsx
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAppNavigation } from "@/engine";
import { useWorkspaceContext } from "@/engine/hooks/useWorkspaceContext";
import { useDBData } from "@/engine/hooks/useDBData";
import { Lc } from "@/AppRenderer";

interface FormStepProps {
  attrs?: {
    title?: string;
    schemaPath: string;
    excludeFields?: string[];
    loadFromParams?: boolean;
    onSubmit?: {
      collection: string;
      navPath?: string;
      action?: "create" | "update";
    };
  };
}

const getFieldType = (property: any) => {
  if (property.widget === "textarea") return "textarea";
  if (property.type === "number") return "number";
  if (property.format === "date") return "date";
  if (property.enum) return "select";
  return "text";
};

export default function FormStep({ attrs }: FormStepProps) {
  // All hooks must be called before any early returns
  const { navigateTo, step } = useAppNavigation();
  const { getSchema } = useWorkspaceContext();
  const { addItem, updateItem, getItem } = useDBData(
    attrs?.onSubmit?.collection || ""
  );
  const [existingData, setExistingData] = useState(null);

  useEffect(() => {
    if (attrs?.loadFromParams && step && getItem) {
      getItem(step).then(setExistingData).catch(console.error);
    }
  }, [attrs?.loadFromParams, step, getItem]);

  if (!attrs?.schemaPath) {
    return <div className="text-red-500">Schema path required</div>;
  }

  const schema = getSchema(attrs.schemaPath);
  if (!schema) {
    return <div className={Lc}>Schema not found: {attrs.schemaPath}</div>;
  }

  const { properties } = schema;
  const excludeFields = attrs.excludeFields || [];
  const fields = Object.entries(properties).filter(
    ([key]) => !excludeFields.includes(key)
  );

  const initialValues = fields.reduce((acc, [key, property]) => {
    acc[key] = existingData?.[key] || property.default || "";
    return acc;
  }, {} as Record<string, any>);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (attrs.onSubmit?.action === "update" && step) {
        await updateItem(step, values);
      } else {
        await addItem(values);
      }

      if (attrs.onSubmit?.navPath) {
        navigateTo(attrs.onSubmit.navPath);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = ([key, property]: [string, any]) => {
    const fieldType = getFieldType(property);

    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {property.label || key}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {fieldType === "textarea" ? (
          <Field
            as="textarea"
            name={key}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : fieldType === "select" ? (
          <Field
            as="select"
            name={key}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {property.label || key}</option>
            {property.enum.map((option: string) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Field>
        ) : (
          <Field
            type={fieldType}
            name={key}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={property.minimum}
          />
        )}

        <ErrorMessage
          name={key}
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {attrs.title && (
        <h1 className="text-3xl font-bold mb-6">{attrs.title}</h1>
      )}

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="bg-white p-6 rounded-lg border">
              {fields.map(renderField)}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigateTo(attrs.onSubmit?.navPath || "")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
