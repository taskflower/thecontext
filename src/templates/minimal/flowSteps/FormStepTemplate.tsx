// src/templates/minimal/flowSteps/FormStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "../../baseTemplate";
import { useFormInput } from "@/hooks/useFormInput";

const FormStepTemplate: React.FC<FlowStepProps> = ({ node, onSubmit, onPrevious }) => {
  const schemaPath = node.attrs?.schemaPath;
  const {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  } = useFormInput({ node });

  return (
    <div className="space-y-4 p-4">
      {processedAssistantMessage && <p>{processedAssistantMessage}</p>}
      <form
        onSubmit={(e) => {
          const data = handleSubmit(e);
          onSubmit(data);
        }}
      >
        {formFields.map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === "number" ? (
              <input
                type="number"
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
                required={field.required}
                className="w-full p-2 border rounded"
              />
            ) : (
              <input
                type="text"
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="w-full p-2 border rounded"
              />
            )}
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Wstecz
          </button>
          <button
            type="submit"
            disabled={!areRequiredFieldsFilled()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            Dalej
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStepTemplate;