import React from "react";
import { FlowStepProps } from "@/views/types";
import { useFormInput } from "@/hooks/useFormInput";


const FormInputTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  // Get the node attributes
  const attrs = node?.attrs || {};
  const formSchemaPath = attrs.formSchemaPath;
  
  // Convert formSchemaPath to schemaPath if needed
  let schemaPath = attrs.schemaPath;
  if (!schemaPath && formSchemaPath && formSchemaPath.startsWith('schemas.form.')) {
    // Already using new format, just copy it
    schemaPath = formSchemaPath;
  }
  
  // Prepare the node with schemaPath if available
  const enhancedNode = {
    ...node,
    attrs: {
      ...attrs,
      schemaPath: schemaPath
    }
  };
  
  const {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  } = useFormInput({ node: enhancedNode });

  // Handle form submission with onSubmit callback
  const onFormSubmit = (e: React.FormEvent) => {
    const data = handleSubmit(e);
    onSubmit(data);
  };

  // Render form fields
  const renderFormFields = () => {
    if (!formFields.length) return null;

    return formFields.map((field) => {
      // Default text input
      if (field.type === "text" || !field.type) {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full p-2 border rounded-md"
              required={field.required}
            />
          </div>
        );
      }

      // Number input
      if (field.type === "number") {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required={field.required}
            />
          </div>
        );
      }

      // Dropdown select
      if (field.type === "select" && field.options) {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full p-2 border rounded-md"
              required={field.required}
            >
              <option value="">Wybierz...</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Assistant message */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="whitespace-pre-line">{processedAssistantMessage}</p>
      </div>

      {/* Form */}
      <form onSubmit={onFormSubmit} className="space-y-4">
        {renderFormFields()}

        <div className="flex justify-between">
          {/* Back button */}
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Wstecz
          </button>

          {/* Submit button with validation */}
          <button
            type="submit"
            disabled={!areRequiredFieldsFilled()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLastNode ? "Zakończ" : "Dalej"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormInputTemplate;