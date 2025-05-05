// src/templates/default/flowSteps/formStep.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useFlow } from "@/hooks";

const FormStepTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  isFirstNode 
}) => {
  const {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    handleBack,
    handleNext
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode
  });
  
  const processFormSubmit = (e: React.FormEvent) => {
    const data = handleSubmit(e);
    handleNext(data);
  };

  // Renderuje pole formularza na podstawie typu
  const renderFormField = (field: any) => {
    const { name, label, type, required, options } = field;
    
    if (type === "number") {
      return (
        <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
          <input
            type="number"
            value={formData[name] || ""}
            onChange={(e) => handleChange(name, Number(e.target.value))}
            required={required}
            placeholder={`Wpisz ${label.toLowerCase()}...`}
            className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      );
    } 
    
    if (type === "select" && options) {
      return (
        <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
          <select
            value={formData[name] || ""}
            onChange={(e) => handleChange(name, e.target.value)}
            required={required}
            className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Wybierz...</option>
            {options.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    } 
    
    // Text inputs (fallback for unknown types too)
    const isUrl = name.toLowerCase().includes("url") || 
      name.toLowerCase().includes("www") || 
      name.toLowerCase().includes("striny");
    
    if (isUrl) {
      return (
        <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
          <div className="flex items-center p-2">
            <div className="flex items-center justify-center h-12 px-3 text-base rounded-md bg-gray-100 text-gray-500">
              http://
            </div>
            <input
              type="text"
              value={formData[name] || ""}
              onChange={(e) => handleChange(name, e.target.value)}
              required={required}
              placeholder="Wpisz ją tutaj..."
              className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-blue-300">
        <input
          type="text"
          value={formData[name] || ""}
          onChange={(e) => handleChange(name, e.target.value)}
          required={required}
          placeholder={`Wpisz ${label.toLowerCase()}...`}
          className="flex h-12 w-full bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  }

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
                  {renderFormField(field)}
                </div>
              </div>
            ))}
            
            {/* Przyciski nawigacyjne */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-md transition-colors duration-300 text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Anuluj" : "Wstecz"}
              </button>
              
              <button
                type="button"
                onClick={processFormSubmit}
                disabled={!areRequiredFieldsFilled()}
                className={`px-5 py-3 rounded-md transition-colors duration-300 text-base font-medium flex-grow ${
                  areRequiredFieldsFilled()
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLastNode ? "Zakończ" : "Dalej"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStepTemplate;