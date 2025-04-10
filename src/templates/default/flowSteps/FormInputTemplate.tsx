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
  const updateContextPath = useAppStore((state) => state.updateContextPath);
  const getContextPath = useAppStore((state) => state.getContextPath);

  // Ładujemy schemat formularza z kontekstu, jeśli attrs.formSchemaPath jest podane
  useEffect(() => {
    if (attrs?.formSchemaPath) {
      const schema = getContextPath(attrs.formSchemaPath);
      if (schema && Array.isArray(schema)) {
        setFormFields(schema);
      }
    }
  }, [node, attrs, getContextPath]);

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

    // Jeśli węzeł ma klucz kontekstu, aktualizuj kontekst
    if (node.contextKey && formFields.length > 0) {
      // Dla każdego pola formularza
      formFields.forEach((field) => {
        // Jeśli pole ma wartość
        if (formData[field.name] !== undefined) {
          // Obsługa zagnieżdżonych ścieżek (np. "preferences.theme")
          updateContextPath(
            node.contextKey as string,
            field.name, // Używamy nazwy pola jako ścieżki JSON
            formData[field.name]
          );
        }
      });
    }

    // Wywołaj callback z danymi formularza
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