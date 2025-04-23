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
      <div className="plugin-wrapper border-0">
        <div className="plugin-content">
          {processedAssistantMessage && (
            <div className="bg-primary/5 p-4 rounded-lg mb-6">
              <p className="text-primary">{processedAssistantMessage}</p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-3">
                <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </label>

                <div className="space-y-3">
                  {field.type === "number" ? (
                    <div className="relative w-full border-2 rounded-md transition-all border-input hover:border-primary/50">
                      <input
                        type="number"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field.name, Number(e.target.value))}
                        required={field.required}
                        placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                        className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  ) : field.type === "select" && field.options ? (
                    <div className="relative w-full border-2 rounded-md transition-all border-input hover:border-primary/50">
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
                    <div className="relative w-full border-2 rounded-md transition-all border-input hover:border-primary/50">
                      {field.name.toLowerCase().includes("url") || 
                        field.name.toLowerCase().includes("www") || 
                        field.name.toLowerCase().includes("striny") ? (
                        <div className="flex items-center p-2">
                          <div className="flex items-center justify-center h-12 px-3 text-base rounded-md bg-primary/10 text-muted-foreground">
                            http://
                          </div>
                          <input
                            type="text"
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder="Wpisz ją tutaj..."
                            className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Wpisz ${field.label.toLowerCase()}...`}
                          className="flex h-12 w-full bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
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