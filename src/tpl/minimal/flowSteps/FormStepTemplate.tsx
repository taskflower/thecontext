// src/tpl/minimal/flowSteps/FormStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useFormInput } from "@/hooks/useFormInput";
import { useNavigate, useParams } from "react-router-dom";

const FormStepTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  isFirstNode 
}) => {
  const navigate = useNavigate();
  const { application, workspace } = useParams();
  
  const {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  } = useFormInput({ node });

  // Handle back navigation based on whether it's the first node
  const handlePrevious = () => {
    if (isFirstNode) {
      // Navigate back to scenarios list
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/');
      }
    } else {
      // Use provided onPrevious handler
      onPrevious();
    }
  };
  
  // Handle completion of the flow
  const handleComplete = (data: any) => {
    // Process form submission
    const formData = handleSubmit(data as any);
    
    // Call onSubmit to save the data
    onSubmit(formData);
    
    // If this is the last node, navigate back to scenarios
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      }
    }
  };

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
                </div>
              </div>
            ))}
            
            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Back button (shown on all nodes) */}
              <button
                type="button"
                onClick={handlePrevious}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Anuluj" : "Wstecz"}
              </button>
              
              {/* Submit/Next button */}
              <button
                type="button"
                onClick={(e) => {
                  const data = handleSubmit(e as any);
                  handleComplete(data);
                }}
                disabled={!areRequiredFieldsFilled()}
                className={`px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow ${
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