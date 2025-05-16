// src/themes/default/components/FormStep.tsx
import { TemplateComponentProps, useFormSchema } from "@/core";
import FieldRenderer from "../commons/form/FieldRenderer";

interface EnhancedFormStepProps extends TemplateComponentProps {
  jsonSchema?: any;
  title?: string;
  description?: string;
  submitLabel?: string;
  showRequiredHint?: boolean;
}

const FormStep: React.FC<EnhancedFormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  nodeSlug,
}) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
  } = useFormSchema({ schema, jsonSchema, initialData: data });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(`[FormStep:${nodeSlug}] Submitting form data:`, formData);
      onSubmit(formData);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}
      <form onSubmit={handleSubmit}>
        {Object.entries(fieldSchemas).map(([name, schema]) => (
          <FieldRenderer
            key={name}
            name={name}
            fieldSchema={schema}
            value={formData[name]}
            error={errors[name]}
            handleChange={handleChange}
            nodeSlug={nodeSlug}
          />
        ))}
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