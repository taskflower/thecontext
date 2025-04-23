// src/templates/default/flowSteps/FormInputTemplate.tsx
import React, { useEffect } from "react";
import { FlowStepProps } from "@/views/types";
import { useFormInput } from "@/hooks/useFormInput";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

const FormInputTemplate: React.FC<FlowStepProps> = ({ node, onSubmit, onPrevious, isLastNode }) => {
  const attrs = node.attrs || {};
  // Dodane debugowanie kontekstu
  const currWrkspId = useWorkspaceStore(state => state.currentWorkspaceId);
  const getContext = useContextStore(state => state.getContext);
  const contexts = useContextStore(state => state.contexts);

  // Logowanie informacji debugowania
  useEffect(() => {
    console.log("Form Input Template - Node:", node);
    console.log("Node attrs:", attrs);
    console.log("Current workspace ID:", currWrkspId);
    console.log("All contexts:", contexts);
    console.log("Current context:", getContext());
    
    // Sprawdzmy schemat formularza
    if (attrs.schemaPath) {
      const schemaData = getContext(attrs.schemaPath);
      console.log(`Schema at path ${attrs.schemaPath}:`, schemaData);
    }
  }, [node, attrs, currWrkspId]);

  // Przekaż node do hooka
  const { formData, formFields, processedAssistantMessage, handleChange, handleSubmit, areRequiredFieldsFilled } = useFormInput({ node });

  console.log("Form fields:", formFields);

  return (
    <div className="space-y-4">
      {/* Dodane debugowanie */}
      {formFields.length === 0 && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <h3 className="font-bold">Debug Info:</h3>
          <p>No form fields found. Check schema path: {attrs.schemaPath}</p>
          <p>Current workspace: {currWrkspId}</p>
          <p>Available contexts: {Object.keys(contexts).join(', ')}</p>
        </div>
      )}

      {/* Wiadomość asystenta */}
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="whitespace-pre-line">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Formularz */}
      <form onSubmit={(e) => { const data = handleSubmit(e); onSubmit(data); }} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-1">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'number' ? (
              <input
                type="number"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                required={field.required}
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-2 border rounded-md"
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <button type="button" onClick={onPrevious} className="px-4 py-2 bg-gray-200 rounded-md">
            Wstecz
          </button>
          <button type="submit" disabled={!areRequiredFieldsFilled()} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
            {isLastNode ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormInputTemplate;