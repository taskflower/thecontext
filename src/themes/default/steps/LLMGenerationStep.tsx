// src/themes/default/steps/LLMGenerationStep.tsx
import { useState, useMemo } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useLlmEngine, useLocalStore } from "../../../core/engine";
import { useWorkspaceSchema } from "../../../core/hooks/useWorkspaceSchema";

export default function LLMGenerationStep({ attrs }: any) {
  const navigate = useNavigate();
  const { config = "exampleTicketApp", workspace = "" } = useParams<{
    config: string;
    workspace: string;
  }>();
  const { schema, loading, error } = useWorkspaceSchema(attrs.schemaPath);

  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  // Budowa Zod i JSON Schema 
  const { zodSchema, jsonSchema } = useMemo(() => {
    if (!schema?.properties) {
      return { zodSchema: undefined, jsonSchema: null };
    }

    const zFields: Record<string, any> = {};
    const jsProps: Record<string, any> = {};
    const required: string[] = [];

    Object.entries(schema.properties).forEach(([key, field]: any) => {
      // Poprawiona logika Zod - uwzględniamy rzeczywiste typy
      let zf;
      if (field.type === 'boolean') {
        zf = z.boolean().describe(field.label || key);
      } else if (field.type === 'number') {
        zf = z.number().describe(field.label || key);
        if (field.minimum !== undefined) zf = zf.min(field.minimum);
        if (field.maximum !== undefined) zf = zf.max(field.maximum);
      } else if (field.enum) {
        zf = (z as any).enum(field.enum).describe(field.label || key);
      } else {
        zf = z.string().describe(field.label || key);
      }
      
      if (!field.required) zf = zf.optional();
      zFields[key] = zf;

      // JSON Schema
      jsProps[key] = {
        type: field.type,
        description: field.label || key,
        ...(field.enum ? { enum: field.enum } : {}),
        ...(field.minimum !== undefined ? { minimum: field.minimum } : {}),
        ...(field.maximum !== undefined ? { maximum: field.maximum } : {}),
      };
      
      if (field.required) required.push(key);
    });

    return {
      zodSchema: z.object(zFields),
      jsonSchema: { type: "object", properties: jsProps, required },
    };
  }, [schema]);

  const userMessage = useMemo(() => {
    return prompt; // Tylko czysty prompt użytkownika
  }, [prompt]);

  const {
    isLoading,
    error: llmError,
    result,
    start,
  } = useLlmEngine({
    schema: zodSchema,
    jsonSchema,
    userMessage,
    systemMessage: attrs.systemMessage, // Używamy z konfiguracji
  });

  const { add: addRecord } = useLocalStore(`${attrs.collection || "records"}:`);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert("Proszę wprowadzić opis");
      return;
    }
    start();
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      let dataWithDefaults = { ...result };
      
      // Apply enum translations from workspace config
      // TODO: This should be moved to workspace hook when enumTranslationMaps is added to WorkspaceConfig type
      
      // Apply defaults
      Object.entries(schema.properties).forEach(([key, field]: any) => {
        if (field.default != null && dataWithDefaults[key] == null) {
          dataWithDefaults[key] = field.default;
        }
      });
      
      await addRecord(dataWithDefaults);
      const navPath = attrs.navPath || `${workspace}/list`;
      navigate(`/${config}/${navPath}`);
    } catch {
      alert("Błąd podczas zapisu");
    } finally {
      setSaving(false);
    }
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema.properties?.[key];
    if (field?.type === 'boolean') {
      return value ? 'Tak' : 'Nie';
    }
    return field?.enumLabels?.[value] || value;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
        <span className="text-gray-600">Ładowanie konfiguracji…</span>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Błąd konfiguracji</div>
        <div className="text-sm text-gray-500">
          {error || `Nie znaleziono schemy: ${attrs.schemaPath}`}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <header className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {attrs.title || "🤖 Generowanie z AI"}
          </h2>
          {attrs.description && (
            <p className="text-gray-600 mt-2">{attrs.description}</p>
          )}
          {attrs.contextInstructions && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">💡 {attrs.contextInstructions}</p>
            </div>
          )}
        </header>
        <section className="p-6 space-y-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={attrs.placeholder || "Opisz swoje zgłoszenie, np. 'Brak prądu w biurze', 'Aplikacja się zawiesza', itp."}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-flex animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                Generuję...
              </>
            ) : (
              "🎯 Wygeneruj"
            )}
          </button>
          {llmError && <div className="text-red-600">Błąd: {llmError}</div>}
          {result && (
            <div className="p-6 bg-green-50 border border-green-200 rounded space-y-4">
              <h3 className="text-lg font-semibold text-green-800">
                ✅ Wygenerowane dane
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schema.properties).map(([key, field]: any) => (
                  <div
                    key={key}
                    className={
                      field.fieldType === "textarea" ? "md:col-span-2" : ""
                    }
                  >
                    <label className="block text-sm font-medium capitalize mb-1">
                      {field.label || key}
                    </label>
                    <div className="p-2 bg-white border rounded text-sm break-words">
                      {getFieldDisplayValue(key, (result as any)[key])}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Zapisywanie..." : "💾 Zapisz"}
              </button>
            </div>
          )}
          <footer className="flex justify-between items-center">
            <button
              onClick={() => {
                const navPath = attrs.cancelNavPath || `${workspace}/list`;
                navigate(`/${config}/${navPath}`);
              }}
              className="text-gray-600 hover:underline"
            >
              ← Powrót
            </button>
            {attrs.examplePrompts && (
              <div className="space-x-2">
                {attrs.examplePrompts.map((ex: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    disabled={isLoading}
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </footer>
        </section>
      </div>
    </div>
  );
}