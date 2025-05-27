// src/themes/default/steps/LLMGenerationStep.tsx
import { useState, useMemo } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceSchema, useEngineStore, useLlmEngine } from "@/core";

interface LLMGenerationStepProps {
  attrs: {
    schemaPath: string;
    title?: string;
    description?: string;
    placeholder?: string;
    examplePrompts?: string[];
    systemMessage?: string;
    navPath?: string;
    nextStep?: string;
    cancelNavPath?: string;
    contextKey?: string;
  };
}

export default function LLMGenerationStep({ attrs }: LLMGenerationStepProps) {
  // ✅ ALL HOOKS AT TOP LEVEL
  const navigate = useNavigate();
  const { config = "exampleTicketApp", workspace = "" } = useParams();
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { set } = useEngineStore();
  const [prompt, setPrompt] = useState("");

  const contextKey = attrs?.contextKey || attrs.schemaPath;

  // Build Zod and JSON Schema from existing schema
  const { zodSchema, jsonSchema } = useMemo(() => {
    if (!schema?.properties) return { zodSchema: undefined, jsonSchema: null };

    // Convert schema to Zod - much simpler!
    const zFields: Record<string, any> = {};
    Object.entries(schema.properties).forEach(([key, field]: any) => {
      let zf;
      switch (field.type) {
        case 'boolean': zf = z.boolean(); break;
        case 'number': zf = z.number(); break;
        default: zf = field.enum ? z.enum(field.enum) : z.string();
      }
      
      // Make optional if not required
      if (!field.required) zf = zf.optional();
      
      zFields[key] = zf.describe(field.label || key);
    });

    // JSON Schema is just our existing schema with some tweaks
    const jsonSchema = {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, field]: any) => [
          key, {
            type: field.type,
            description: field.label || key,
            ...(field.enum && { enum: field.enum })
          }
        ])
      ),
      required: Object.entries(schema.properties)
        .filter(([_, field]: any) => field.required)
        .map(([key]) => key)
    };

    return {
      zodSchema: z.object(zFields),
      jsonSchema
    };
  }, [schema]);

  const { isLoading, error: llmError, result, start } = useLlmEngine({
    schema: zodSchema,
    jsonSchema,
    userMessage: prompt,
    systemMessage: attrs?.systemMessage,
  });

  const handleContinue = () => {
    if (!result) return;
    
    // Save generated data to context
    set(contextKey, result);
    console.log(`LLM: Saved to context [${contextKey}]:`, result);
    
    // Determine next path with debugging
    let nextPath;
    if (attrs?.nextStep) {
      nextPath = `/${config}/${workspace}/${attrs.nextStep}`;
      console.log(`LLM: Using nextStep: ${attrs.nextStep} → ${nextPath}`);
    } else if (attrs?.navPath) {
      nextPath = `/${config}/${attrs.navPath}`;
      console.log(`LLM: Using navPath: ${attrs.navPath} → ${nextPath}`);
    } else {
      nextPath = `/${config}/${workspace}/list`;
      console.log(`LLM: Using fallback → ${nextPath}`);
    }
    
    navigate(nextPath);
  };

  const handleCancel = () => {
    const cancelPath = attrs?.cancelNavPath ? `/${config}/${attrs.cancelNavPath}` : `/${config}/${workspace}/list`;
    navigate(cancelPath);
  };

  // ✅ CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        <span className="ml-3 text-sm font-medium text-zinc-600">Loading configuration...</span>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">{error || `Schema not found: ${attrs?.schemaPath}`}</div>
        <button onClick={() => window.history.back()} className="mt-4 text-blue-600 hover:underline">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      {(attrs?.title || attrs?.description) && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{attrs?.title || "🤖 AI Generation"}</h2>
          {attrs?.description && <p className="text-gray-600 mt-2">{attrs.description}</p>}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Example prompts */}
        {attrs?.examplePrompts && attrs.examplePrompts.length > 0 && (
          <div className="bg-zinc-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-700 mb-3">Examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {attrs.examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="text-left text-sm text-zinc-600 hover:text-zinc-900 hover:bg-white p-2 rounded border hover:border-zinc-200 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={attrs?.placeholder || "Describe your request..."}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => prompt.trim() && start()}
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-flex animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                Generating...
              </>
            ) : (
              "🎯 Generate"
            )}
          </button>
          <button 
            onClick={handleCancel} 
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {/* Error display */}
        {llmError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <div className="text-red-600 text-sm font-medium">Error: {llmError}</div>
          </div>
        )}
        
        {/* Success + Continue */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex gap-3">
              <button 
                onClick={handleContinue} 
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                ✅ Continue
              </button>
              <button 
                onClick={() => start()} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}