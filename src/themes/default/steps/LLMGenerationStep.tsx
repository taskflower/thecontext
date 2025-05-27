// src/themes/default/steps/LLMGenerationStep.tsx - używa useCollections zamiast useLocalStore
import { useState, useMemo } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useLlmEngine, useCollections } from "../../../core/engine";
import { useWorkspaceSchema } from "../../../core/hooks/useWorkspaceSchema";

export default function LLMGenerationStep({ attrs }: any) {
  const navigate = useNavigate();
  const { config = "exampleTicketApp", workspace = "" } = useParams<{
    config: string;
    workspace: string;
  }>();
  const { schema, loading, error } = useWorkspaceSchema(attrs.schemaPath);
  const { saveItem } = useCollections(attrs.collection || "records");
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  // Build Zod and JSON Schema
  const { zodSchema, jsonSchema } = useMemo(() => {
    if (!schema?.properties) return { zodSchema: undefined, jsonSchema: null };

    const zFields: Record<string, any> = {};
    const jsProps: Record<string, any> = {};
    const required: string[] = [];

    Object.entries(schema.properties).forEach(([key, field]: any) => {
      let zf = field.type === 'boolean' ? z.boolean() :
              field.type === 'number' ? z.number() :
              field.enum ? (z as any).enum(field.enum) : z.string();
      
      zf = zf.describe(field.label || key);
      if (!field.required) zf = zf.optional();
      zFields[key] = zf;

      jsProps[key] = {
        type: field.type,
        description: field.label || key,
        ...(field.enum && { enum: field.enum }),
      };
      
      if (field.required) required.push(key);
    });

    return {
      zodSchema: z.object(zFields),
      jsonSchema: { type: "object", properties: jsProps, required },
    };
  }, [schema]);

  const { isLoading, error: llmError, result, start } = useLlmEngine({
    schema: zodSchema,
    jsonSchema,
    userMessage: prompt,
    systemMessage: attrs.systemMessage,
  });

  const handleGenerate = () => prompt.trim() ? start() : alert("Proszę wprowadzić opis");

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      // Apply defaults
      const dataWithDefaults = { ...result };
      Object.entries(schema.properties).forEach(([key, field]: any) => {
        if (field.default != null && dataWithDefaults[key] == null) {
          dataWithDefaults[key] = field.default;
        }
      });
      
      await saveItem(dataWithDefaults); // ✅ Używa kolekcji, nie store
      navigate(`/${config}/${attrs.navPath || `${workspace}/list`}`);
    } catch {
      alert("Błąd podczas zapisu");
    } finally {
      setSaving(false);
    }
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema.properties?.[key];
    return field?.type === 'boolean' ? (value ? 'Tak' : 'Nie') :
           field?.enumLabels?.[value] || value;
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
      <span className="text-gray-600">Ładowanie konfiguracji…</span>
    </div>
  );

  if (error || !schema) return (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">Błąd konfiguracji</div>
      <div className="text-sm text-gray-500">{error || `Nie znaleziono schemy: ${attrs.schemaPath}`}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <header className="p-6 border-b">
          <h2 className="text-2xl font-bold">{attrs.title || "🤖 Generowanie z AI"}</h2>
          {attrs.description && <p className="text-gray-600 mt-2">{attrs.description}</p>}
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
            placeholder={attrs.placeholder || "Opisz swoje zgłoszenie..."}
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
            ) : "🎯 Wygeneruj"}
          </button>
          {llmError && <div className="text-red-600">Błąd: {llmError}</div>}
          {result && (
            <div className="p-6 bg-green-50 border border-green-200 rounded space-y-4">
              <h3 className="text-lg font-semibold text-green-800">✅ Wygenerowane dane</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schema.properties).map(([key, field]: any) => (
                  <div key={key} className={field.fieldType === "textarea" ? "md:col-span-2" : ""}>
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
        </section>
      </div>
    </div>
  );
}