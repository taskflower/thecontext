// src/components/debug/StepDetails.tsx
import React from "react";
import { useAppStore } from "@/lib/store";
import { getStepSchema } from "./StepSchemaHelper";


interface StepDetailsProps {
  step: any;
  onClose: () => void;
}

/**
 * Komponent wyświetlający szczegółowe informacje o wybranym kroku
 */
const StepDetails: React.FC<StepDetailsProps> = ({ step, onClose }) => {
  const { getContextPath } = useAppStore();

  if (!step) {
    return null;
  }

  // Pobierz schemat dla kroku
  const schemaInfo = getStepSchema(step);

  return (
    <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-4 mb-2 w-[500px] max-h-[calc(100vh-100px)] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{step.label || `Krok ${step.id}`}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>

      {/* Szczegóły wybranego kroku */}
      <div className="space-y-4">
        {/* Sekcja atrybutów */}
        <div>
          <div className="text-xs font-medium mb-1">Atrybuty:</div>
          <div className="bg-white border border-gray-200 rounded p-2 text-xs">
            <table className="w-full">
              <tbody>
                {step.attrs &&
                  Object.entries(step.attrs).map(
                    ([key, value]: [string, any]) => (
                      <tr
                        key={key}
                        className="border-t border-gray-100 first:border-t-0"
                      >
                        <td className="p-1 font-medium">{key}</td>
                        <td className="p-1">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      </tr>
                    )
                  )}
                {(!step.attrs || Object.keys(step.attrs).length === 0) && (
                  <tr>
                    <td className="p-1 text-gray-500 italic">Brak atrybutów</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sekcja wiadomości */}
        {step.assistantMessage && (
          <div>
            <div className="text-xs font-medium mb-1">Wiadomość asystenta:</div>
            <div className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
              {step.assistantMessage}
            </div>
          </div>
        )}

        {step.attrs?.initialUserMessage && (
          <div>
            <div className="text-xs font-medium mb-1">
              Wiadomość początkowa:
            </div>
            <TemplateVariablesChecker
                template={step.attrs.initialUserMessage}
                getContextPath={getContextPath}
              />
            <div className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
              
            
              {step.attrs.initialUserMessage}
            </div>
          </div>
        )}

        {/* Schema info */}
        <div>{renderSchema(schemaInfo)}</div>

        {/* Output data */}
        <div>{renderOutput(step, getContextPath)}</div>
      </div>
    </div>
  );
};

/**
 * Komponent sprawdzający zmienne szablonowe w tekście i wyświetlający ich wartości
 */
const TemplateVariablesChecker: React.FC<{
  template: string;
  getContextPath: (path: string) => any;
}> = ({ template, getContextPath }) => {
  // Znajdź wszystkie zmienne szablonowe w formacie {{variable}}
  const templateVars = template.match(/\{\{([^}]+)\}\}/g) || [];

  if (templateVars.length === 0) {
    return null;
  }

  // Tablica wyników sprawdzania każdej zmiennej
  const results = templateVars.map((variable) => {
    // Wyciągnij nazwę zmiennej bez nawiasów
    const varName = variable.replace(/\{\{|\}\}/g, "").trim();
    // Pobierz wartość z kontekstu
    const value = getContextPath(varName);

    return {
      variable,
      varName,
      value,
      exists: value !== undefined && value !== null,
    };
  });

  // Sprawdź czy są brakujące zmienne
  const missingVars = results.filter((r) => !r.exists);

  if (missingVars.length === 0) {
    return (
      <div className="mt-2 p-1 bg-green-50 text-green-700 text-xs rounded">
        ✓ Wszystkie zmienne szablonu są dostępne w kontekście
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-xs rounded">
      <p className="font-medium text-yellow-700 mb-1">
        ⚠️ Brakujące zmienne szablonu:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        {missingVars.map((item, idx) => (
          <li key={idx} className="text-yellow-700">
            {item.varName}{" "}
            <span className="text-gray-500 italic">
              (używane jako {item.variable})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Renderuje schemat (form lub LLM)
 */
const renderSchema = (schemaInfo: any) => {
  if (!schemaInfo || !schemaInfo.schema) {
    // Check if we might have a schema path but couldn't resolve it
    if (schemaInfo && schemaInfo.path) {
      return (
        <div className="text-sm text-red-500 italic">
          <span className="font-bold">Błąd:</span> Schemat nie znaleziony pod
          ścieżką: {schemaInfo.path}
        </div>
      );
    }

    return <div className="text-sm text-gray-500 italic">Brak schematu</div>;
  }

  const { type, path, schema } = schemaInfo;

  if (type === "form" && Array.isArray(schema)) {
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Pola formularza:</div>
          <div className="text-xs text-blue-500">{path}</div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-1 text-left">Nazwa</th>
              <th className="p-1 text-left">Typ</th>
              <th className="p-1 text-left">Wymagane</th>
            </tr>
          </thead>
          <tbody>
            {schema.map((field: any, idx: number) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="p-1">{field.name}</td>
                <td className="p-1">{field.type || "text"}</td>
                <td className="p-1">{field.required ? "✓" : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "llm") {
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Schemat AI (dane wejsciowe):</div>
          <div className="text-xs text-blue-500">{path}</div>
        </div>
        <pre className="bg-gray-50 p-2 rounded overflow-x-auto text-[10px]">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 italic">Nieznany typ schematu</div>
  );
};

/**
 * Renderuje dane wyjściowe kroku
 */
const renderOutput = (step: any, getContextPath: (path: string) => any) => {
  const contextPath = step.contextPath;
  if (!contextPath)
    return (
      <div className="text-sm text-gray-500 italic">
        Brak ścieżki kontekstu dla danych wyjściowych
      </div>
    );

  const data = getContextPath(contextPath);
  if (!data)
    return (
      <div className="text-sm text-gray-500 italic">
        Brak danych wyjściowych pod ścieżką {contextPath}
      </div>
    );

  // Sprawdź, czy dane są puste (pusty obiekt)
  const isEmpty = typeof data === "object" && Object.keys(data).length === 0;
  if (isEmpty) {
    return (
      <div className="text-sm text-orange-500 italic">
        Ścieżka {contextPath} istnieje, ale nie zawiera jeszcze danych
        wyjściowych
      </div>
    );
  }

  // Renderuj dane w zależności od typu kroku
  if (step.templateId === "llm-query") {
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Dane wyjściowe AI:</div>
          <div className="text-xs text-blue-500">{contextPath}</div>
        </div>
        <pre className="bg-purple-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  if (step.templateId === "form-step") {
    return (
      <div className="bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">Dane z formularza:</div>
          <div className="text-xs text-blue-500">{contextPath}</div>
        </div>
        <pre className="bg-green-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  // Domyślny sposób renderowania dla innych typów kroków
  return (
    <div className="bg-white border border-gray-200 rounded p-2 text-xs">
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">Dane wyjściowe:</div>
        <div className="text-xs text-blue-500">{contextPath}</div>
      </div>
      <pre className="bg-gray-50 p-2 rounded overflow-x-auto max-h-[200px] text-[10px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default StepDetails;
