// src/tpl/minimal/flowSteps/FormStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useFormInput } from "@/hooks/useFormInput";

const FormStepTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
}) => {
  const {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  } = useFormInput({ node });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          const data = handleSubmit(e);
          onSubmit(data);
        }}
        className="space-y-5"
      >
        {formFields.map((field) => (
          <div key={field.name} className="space-y-3">
            <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            <div className="space-y-3">
              {field.type === "number" ? (
                <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
                  <input
                    type="number"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    required={field.required}
                    placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                    className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              ) : field.type === "select" && field.options ? (
                <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
                  <select
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Wybierz...</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : field.type === "text" || !field.type ? (
                <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
                  {field.name.toLowerCase().includes("url") || field.name.toLowerCase().includes("www") ? (
                    <div className="flex items-center p-2">
                      <div className="flex items-center justify-center h-12 px-3 text-base rounded-md bg-blue-50 text-gray-500">
                        http://
                      </div>
                      <input
                        type="text"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder="Wpisz ją tutaj..."
                        className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                      className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Wstecz
          </button>

          <button
            type="submit"
            disabled={!areRequiredFieldsFilled()}
            className={`px-4 py-2 rounded ${
              areRequiredFieldsFilled()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLastNode ? "Zakończ" : "Dalej"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStepTemplate;