// src/themes/default/components/ApiStep.tsx

import { useAuth } from "@/auth/useAuth";
import { useFormSchema, useFlow } from "@/core";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";

export interface ApiStepProps<T> {
  schema: any;
  jsonSchema?: any;
  data?: T;
  onSubmit: (data: T) => void;
  apiEndpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
  requestTemplate?: Record<string, any>;
  responseTransform?: (response: any) => T;
  transformErrors?: (error: any) => string;
  title?: string;
  description?: string;
  submitLabel?: string;
  showResults?: boolean;
  autoSubmit?: boolean;
  nodeSlug?: string;
}

export default function ApiStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  apiEndpoint,
  method = "POST",
  requestTemplate = {},
  responseTransform = (response) => response,
  transformErrors = (error) => error.message || "Wystąpił nieznany błąd",
  title = "Formularz API",
  description,
  submitLabel = "Wyślij",
  showResults = false,
  autoSubmit = false,
  nodeSlug,
}: ApiStepProps<T>) {
  const { getToken, user } = useAuth();
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
  } = useFormSchema({ schema, jsonSchema, initialData: data });

  // Przetwarza stringi w szablonie zapytania, zastępując {{ścieżka}} wartościami z kontekstu
  const processTemplateString = (str: string) =>
    str.replace(/{{([^}]+)}}/g, (_, path) => {
      const value = get(path.trim());
      return value !== undefined ? String(value) : "";
    });

  // Przygotowuje dane zapytania, łącząc formularz z szablonem zapytania
  const prepareRequestData = () => {
    // Głęboka kopia szablonu
    const processedTemplate = JSON.parse(JSON.stringify(requestTemplate));
    
    // Zastępuje wartości szablonu danymi z kontekstu
    const processTemplateObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => processTemplateObject(item));
      }
      
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          result[key] = processTemplateString(value);
        } else if (typeof value === 'object') {
          result[key] = processTemplateObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };
    
    const processedData = processTemplateObject(processedTemplate);
    
    // Łączy przetworzone dane szablonu z danymi formularza
    return { ...processedData, ...formData };
  };

  // Funkcja wykonująca żądanie API
  const executeApiRequest = async () => {
    setIsLoading(true);
    setError(null);
    setIsSubmitted(true);

    try {
      const token = await getToken();
      if (!token || !user) {
        throw new Error(
          token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji"
        );
      }

      const requestData = prepareRequestData();
      console.log(`[ApiStep:${nodeSlug}] Wysyłanie danych:`, requestData);

      // Konstrukcja URL z uwzględnieniem ścieżek z kontekstu
      const processedEndpoint = processTemplateString(
        apiEndpoint.startsWith('http') 
          ? apiEndpoint 
          : `${import.meta.env.VITE_API_URL}${apiEndpoint}`
      );
      
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Dodaj body tylko dla metod, które mogą mieć body
      if (method !== "GET" && method !== "HEAD") {
        fetchOptions.body = JSON.stringify(requestData);
      }

      const response = await fetch(processedEndpoint, fetchOptions);
      
      if (!response.ok) {
        const errInfo = await response.json().catch(() => ({ error: { message: `Błąd HTTP ${response.status}` } }));
        throw new Error(
          errInfo.error?.message || `Błąd serwera: ${response.status}`
        );
      }

      const responseData = await response.json();
      console.log(`[ApiStep:${nodeSlug}] Odpowiedź API:`, responseData);

      // Transformacja odpowiedzi zgodnie z funkcją transformacyjną
      const transformedResponse = responseTransform(responseData);
      setResult(transformedResponse as T);

      // Automatyczne przesłanie danych do następnego kroku
      onSubmit(transformedResponse as T);

      setIsLoading(false);
    } catch (err: any) {
      const errorMessage = transformErrors(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Obsługa autosubmit
  useEffect(() => {
    if (autoSubmit && !isSubmitted && !isLoading) {
      const isValid = validateForm();
      if (isValid) {
        executeApiRequest();
      }
    }
  }, [autoSubmit, isSubmitted, isLoading]);

  // Obsługa formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    console.log(`[ApiStep:${nodeSlug}] Walidacja formularza:`, isValid);
    console.log(`[ApiStep:${nodeSlug}] Błędy walidacji:`, errors);
    
    if (isValid) {
      executeApiRequest();
    }
  };

  // Renderowanie pola formularza
  const renderField = (fieldName: string) => {
    const fieldSchema = fieldSchemas[fieldName];
    if (!fieldSchema) return null;

    const { fieldType, title, required, description, options } = fieldSchema;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];

    // Specjalna obsługa pola typu array (tags/multi-select)
    if (fieldSchema.isArray && options) {
      return (
        <div key={fieldName} className="my-4 space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.isArray(fieldValue) && fieldValue.map((tag) => (
              <span 
                key={tag} 
                className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    const currentTags = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
                    const updatedTags = currentTags.filter(t => t !== tag);
                    handleChange(fieldName, updatedTags);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const currentTags = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
                  if (!currentTags.includes(e.target.value)) {
                    handleChange(fieldName, [...currentTags, e.target.value]);
                  }
                  e.target.value = ""; // Reset select po dodaniu
                }
              }}
              className="w-full border rounded-l border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
            >
              <option value="">-- Wybierz opcję --</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          
          {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
        </div>
      );
    }

    return (
      <div key={fieldName} className="my-4 space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}

        {fieldType === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => {
                console.log(`[ApiStep:${nodeSlug}] Checkbox change:`, fieldName, e.target.checked);
                handleChange(fieldName, e.target.checked);
              }}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {fieldSchema.placeholder || "Zaznacz"}
            </span>
          </div>
        ) : fieldType === "text" || fieldType === "email" || fieldType === "date" ? (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type={fieldType}
              value={fieldValue || ""}
              onChange={(e) => {
                console.log(`[ApiStep:${nodeSlug}] Input change:`, fieldName, e.target.value);
                handleChange(fieldName, e.target.value);
              }}
              placeholder={fieldSchema.placeholder}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        ) : fieldType === "number" ? (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="number"
              value={fieldValue === undefined ? "" : fieldValue}
              min={fieldSchema.min}
              max={fieldSchema.max}
              step={fieldSchema.step}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                console.log(`[ApiStep:${nodeSlug}] Number input change:`, fieldName, val);
                handleChange(fieldName, val);
              }}
              placeholder={fieldSchema.placeholder}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        ) : fieldType === "textarea" ? (
          <textarea
            value={fieldValue || ""}
            onChange={(e) => {
              console.log(`[ApiStep:${nodeSlug}] Textarea change:`, fieldName, e.target.value);
              handleChange(fieldName, e.target.value);
            }}
            placeholder={fieldSchema.placeholder}
            rows={4}
            className="w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus:outline-none text-sm"
          />
        ) : fieldType === "select" && options ? (
          <select
            value={fieldValue || ""}
            onChange={(e) => {
              console.log(`[ApiStep:${nodeSlug}] Select change:`, fieldName, e.target.value);
              handleChange(fieldName, e.target.value);
            }}
            className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
          >
            <option value="">-- Wybierz --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : null}

        {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
      </div>
    );
  };

  return (
    <div className="pt-6">
      {title && <h2 className="text-xl text-gray-900 mb-3">{title}</h2>}
      {description && <p className="text-gray-600 mb-6 text-sm">{description}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <div className="w-4 h-4 border-4 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-900 text-sm">Przetwarzanie...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
          <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsSubmitted(false);
            }}
            className="mt-4 px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : result && !showResults ? null : result && showResults ? (
        <div className="p-4 bg-green-50 rounded border border-green-200">
          <h3 className="font-semibold mb-2 text-green-700 text-sm">
            Odpowiedź otrzymana
          </h3>
          <pre className="bg-white p-4 rounded overflow-auto max-h-80 text-xs border border-gray-200 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {Object.keys(fieldSchemas).map(renderField)}
          {hasRequiredFields && (
            <p className="text-xs text-gray-500 mt-2 mb-4">
              Pola oznaczone <span className="text-red-500">*</span> są wymagane
            </p>
          )}
          <button
            type="submit"
            className="w-full px-5 py-2.5 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}