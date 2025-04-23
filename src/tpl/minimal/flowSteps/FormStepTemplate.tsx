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
    <div className="my-4">
      <div className="border-0">
        <div className="w-full">
          {processedAssistantMessage && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-800">{processedAssistantMessage}</p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-3">
                <label className="text-base font-medium leading-none text-gray-900">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                <div className="space-y-3">
                  {field.type === "number" ? (
                    <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
                      <input
                        type="number"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field.name, Number(e.target.value))}
                        required={field.required}
                        placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                        className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  ) : field.type === "select" && field.options ? (
                    <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                      {field.name.toLowerCase().includes("url") || 
                        field.name.toLowerCase().includes("www") || 
                        field.name.toLowerCase().includes("striny") ? (
                        <div className="flex items-center p-2">
                          <div className="flex items-center justify-center h-12 px-3 text-base rounded-md bg-gray-100 text-gray-500">
                            http://
                          </div>
                          <input
                            type="text"
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder="Wpisz ją tutaj..."
                            className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                          className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      )}
                    </div>
                  ) : null}
                  
                  {/* Submit button moved here to match example layout */}
                  {field === formFields[formFields.length - 1] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        const data = handleSubmit(e as any);
                        onSubmit(data);
                      }}
                      disabled={!areRequiredFieldsFilled()}
                      className={`px-5 py-3 rounded-md transition-colors text-base font-medium w-full ${
                        areRequiredFieldsFilled()
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStepTemplate;