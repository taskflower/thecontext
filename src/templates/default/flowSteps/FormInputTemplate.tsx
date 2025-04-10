import React, { useState, useCallback, useEffect } from "react";
import { FlowStepProps, FormField } from "@/views/types";
import { useAppStore } from "@/lib/store";

// Definicja interfejsu dla atrybutów formularza
interface FormInputAttrs {
  formSchemaPath?: string; // Ścieżka do schematu formularza w kontekście
  [key: string]: any;
}

const FormInputTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  contextItems = [],
}) => {
  // Stan formularza
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  
  // Wyciągamy attrs z node (z typowaniem)
  const attrs = node.attrs as FormInputAttrs;

  // Pobieramy funkcje kontekstu z AppStore
  const processTemplate = useAppStore((state) => state.processTemplate);
  const updateContext = useAppStore((state) => state.updateContext);
  const getContextPath = useAppStore((state) => state.getContextPath);
  const getContext = useAppStore((state) => state.getContext);

  // Załaduj schemat formularza
  useEffect(() => {
    if (attrs?.formSchemaPath) {
      const schema = getContextPath(attrs.formSchemaPath);
      if (schema && Array.isArray(schema)) {
        setFormFields(schema);
        console.log("Załadowano schemat formularza:", schema);
      }
    }
  }, [attrs, getContextPath]);

  // Przetwarzamy wiadomość asystenta z zmiennymi kontekstowymi
  const assistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Funkcja sprawdzająca, czy wszystkie wymagane pola są wypełnione
  const areRequiredFieldsFilled = useCallback(() => {
    if (!formFields.length) return true;
    
    return formFields.every(field => {
      if (field.required) {
        const value = formData[field.name];
        return value !== undefined && value !== "" && value !== null;
      }
      return true;
    });
  }, [formFields, formData]);

  // Obsługa zmian pól formularza
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Obsługa zatwierdzenia formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (node.contextKey && formFields.length > 0) {
      // Pobierz aktualny kontekst
      let contextData = getContext();
      const userProfileData = contextData[node.contextKey] || {};
      
      // Tworzę kopię, żeby nie modyfikować oryginalnego obiektu
      const updatedUserProfile = {...userProfileData};
      
      console.log("Aktualny kontekst przed aktualizacją:", updatedUserProfile);
      console.log("Dane formularza:", formData);
      
      // Aktualizuj dane z formularza
      formFields.forEach(field => {
        const value = formData[field.name];
        if (value !== undefined) {
          if (field.name.includes('.')) {
            // Obsługa pól zagnieżdżonych
            const parts = field.name.split('.');
            let current = updatedUserProfile;
            
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i];
              // Inicjalizacja obiektu, jeśli nie istnieje
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part];
            }
            current[parts[parts.length - 1]] = value;
          } else {
            // Pola niezagnieżdżone
            updatedUserProfile[field.name] = value;
          }
        }
      });
      
      console.log("Zaktualizowany kontekst:", updatedUserProfile);
      
      // Aktualizacja całego obiektu w kontekście
      updateContext(node.contextKey, updatedUserProfile);
    }

    onSubmit(formData);
  };

  // Renderuj pola formularza
  const renderFormFields = () => {
    if (!formFields.length) return null;

    return formFields.map((field) => {
      // Domyślny input tekstowy
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

      // Input numeryczny
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
      {/* Wiadomość asystenta */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="whitespace-pre-line">{assistantMessage}</p>
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}

        <div className="flex justify-between">
          {/* Przycisk powrotu */}
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Wstecz
          </button>

          {/* Przycisk zatwierdzenia z walidacją */}
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