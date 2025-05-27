// src/themes/default/steps/LLMGenerationStep.tsx - Updated with context storage
import { useState, useMemo } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceSchema, useEngineStore, useLlmEngine } from "@/core";

interface LLMGenerationStepProps {
  attrs: {
    schemaPath: string;
    collection?: string;
    title?: string;
    description?: string;
    placeholder?: string;
    contextInstructions?: string;
    examplePrompts?: string[];
    systemMessage?: string;
    // NEW: Navigation options
    navPath?: string; // Path to next step
    cancelNavPath?: string;
    nextStep?: string; // Next step slug
    // NEW: Context storage
    saveToContext?: boolean;
    contextKey?: string;
  };
}

export default function LLMGenerationStep({ attrs }: LLMGenerationStepProps) {
  const navigate = useNavigate();
  const { config = "exampleTicketApp", workspace = "" } = useParams<{
    config: string;
    workspace: string;
  }>();
  
  // ✅ ALL HOOKS MUST BE CALLED FIRST
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { set } = useEngineStore(); // NEW: for context storage
  const [prompt, setPrompt] = useState("");

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
    systemMessage: attrs?.systemMessage,
  });

  // ✅ Now conditional logic can happen after all hooks

  const handleGenerate = () => prompt.trim() ? start() : alert("Proszę wprowadzić opis");

  const handleContinue = async () => {
    if (!result || !schema?.properties) return;
    
    try {
      // Apply defaults to the result
      const dataWithDefaults = { ...result };
      Object.entries(schema.properties).forEach(([key, field]: any) => {
        if (field.default != null && dataWithDefaults[key] == null) {
          dataWithDefaults[key] = field.default;
        }
      });
      
      // NEW: Save to context instead of database
      const contextKey = attrs?.contextKey || attrs.schemaPath;
      set(contextKey, dataWithDefaults);
      console.log(`LLM: Saved to context: ${contextKey}`, dataWithDefaults);
      
      // Navigate to next step
      if (attrs?.nextStep) {
        // Navigate to specific step in current scenario
        navigate(`/${config}/${workspace}/${attrs.nextStep}`);
      } else if (attrs?.navPath) {
        // Navigate to specified path
        navigate(`/${config}/${attrs.navPath}`);
      } else {
        // Fallback to list view
        navigate(`/${config}/${workspace}/list`);
      }
    } catch (err) {
      console.error("Context save error:", err);
      alert("Błąd podczas zapisywania do kontekstu");
    }
  };

  const handleCancel = () => {
    if (attrs?.cancelNavPath) {
      navigate(`/${config}/${attrs.cancelNavPath}`);
    } else {
      navigate(`/${config}/${workspace}/list`);
    }
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema?.properties?.[key];
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
      <div className="text-sm text-gray-500">{error || `Nie znaleziono schemy: ${attrs?.schemaPath}`}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <header className="p-6 border-b">
          <h2 className="text-2xl font-bold">{attrs?.title || "🤖 Generowanie z AI"}</h2>
          {attrs?.description && <p className="text-gray-600 mt-2">{attrs.description}</p>}
          {attrs?.contextInstructions && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">💡 {attrs.contextInstructions}</p>
            </div>
          )}
        </header>
        
        <section className="p-6 space-y-6">
          {/* Example prompts */}
          {attrs?.examplePrompts && attrs.examplePrompts.length > 0 && (
            <div className="bg-zinc-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-zinc-700 mb-3">Przykłady:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attrs.examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-left text-sm text-zinc-600 hover:text-zinc-900 hover:bg-white p-2 rounded border border-transparent hover:border-zinc-200 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={attrs?.placeholder || "Opisz swoje zgłoszenie..."}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          
          <div className="flex gap-3">
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
            
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>

          {llmError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="text-red-600">Błąd: {llmError}</div>
            </div>
          )}
          
          {result && schema?.properties && (
            <div className="p-6 bg-green-50 border border-green-200 rounded space-y-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                ✅ Wygenerowane dane
                <span className="text-sm font-normal text-green-600">
                  (dane zapisane w kontekście)
                </span>
              </h3>
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
              <div className="flex gap-3 pt-4 border-t border-green-200">
                <button
                  onClick={handleContinue}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  ➡️ Kontynuuj
                </button>
                <button
                  onClick={handleGenerate}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                >
                  🔄 Wygeneruj ponownie
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}