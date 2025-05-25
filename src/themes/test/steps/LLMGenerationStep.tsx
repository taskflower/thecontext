// src/themes/test/steps/LLMGenerationStep.tsx
import { useState } from 'react';
import { z } from 'zod';
import { useLlmEngine, useLocalStore } from '../../../core/engine';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../../core/engine';

export default function LLMGenerationStep({ attrs }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const { config, workspace } = params;
  
  // Pobierz konfigurację workspace dla schemy
  const workspaceConfig = useConfig(
    config || 'exampleTicketApp',
    `/src/_configs/${config || 'exampleTicketApp'}/workspaces/${workspace}.json`
  );
  
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  // Pobierz schemat z konfiguracji
  const getSchemaFromConfig = () => {
    if (!workspaceConfig?.contextSchema || !attrs?.schemaPath) {
      console.error('Missing schema configuration');
      return null;
    }
    
    const schemaPath = attrs.schemaPath;
    return workspaceConfig.contextSchema[schemaPath];
  };

  const schema = getSchemaFromConfig();

  // Dynamiczne tworzenie Zod schema na podstawie konfiguracji
  const createZodSchema = () => {
    if (!schema?.properties) return null;
    
    const zodFields: Record<string, any> = {};
    
    Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
      if (field.type === 'string') {
        if (field.enum) {
          let zodField = z.enum(field.enum as [string, ...string[]]).describe(field.label || key);
          if (!field.required) {
            zodField = zodField.optional();
          }
          zodFields[key] = zodField;
        } else {
          let zodField = z.string().describe(field.label || key);
          if (!field.required) {
            zodField = zodField.optional();
          }
          zodFields[key] = zodField;
        }
      }
      // Dodaj więcej typów w razie potrzeby
    });
    
    return z.object(zodFields);
  };

  // Dynamiczne tworzenie JSON schema dla LLM
  const createJsonSchema = () => {
    if (!schema?.properties) return null;
    
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
      properties[key] = {
        type: field.type,
        description: `${field.label || key}${field.enum ? ` (dozwolone wartości: ${field.enum.join(', ')})` : ''}`
      };
      
      if (field.enum) {
        properties[key].enum = field.enum;
      }
      
      if (field.required) {
        required.push(key);
      }
    });
    
    return {
      type: "object",
      properties,
      required
    };
  };

  const zodSchema = createZodSchema();
  const jsonSchema = createJsonSchema();

  // Tworzenie instrukcji enum dla system message
  const createEnumInstructions = () => {
    if (!schema?.properties) return '';
    
    const enumFields = Object.entries(schema.properties)
      .filter(([_, field]: [string, any]) => field.enum)
      .map(([key, field]: [string, any]) => `- ${key}: ${field.enum.map((v: string) => `"${v}"`).join(', ')}`)
      .join('\n');
    
    return enumFields ? `\nWAŻNE: Używaj TYLKO dozwolonych wartości enum:\n${enumFields}` : '';
  };

  // Hook LLM - używamy dynamicznych schematów
  const { isLoading, error, result, start } = useLlmEngine({
    schema: zodSchema,
    jsonSchema: jsonSchema,
    userMessage: prompt,
    systemMessage: attrs?.systemMessage || `Jesteś asystentem generującym strukturalne dane. Na podstawie opisu użytkownika wygeneruj dane zgodne ze schematem.${createEnumInstructions()}

WAŻNE: 
- Używaj dokładnie takich nazw kluczy JSON jak w schemacie (nie tłumacz ich)
- Zwróć czysty JSON zgodny ze schematem`,
    autoStart: false,
  });

  // Lokalny store - używamy dynamicznej kolekcji
  const collection = attrs?.collection || 'records';
  const { add: addRecord } = useLocalStore(`${collection}:`);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Proszę wprowadzić opis');
      return;
    }
    
    if (!zodSchema || !jsonSchema) {
      alert('Błąd konfiguracji schematu');
      return;
    }
    
    await start();
  };

  const handleSave = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      // Uzupełniamy domyślne wartości z schemy
      const dataWithDefaults = { ...result };
      
      if (schema?.properties) {
        Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
          if (field.default && !dataWithDefaults[key]) {
            dataWithDefaults[key] = field.default;
          }
        });
      }
      
      await addRecord(dataWithDefaults);
      
      // Nawiguj do określonej ścieżki lub domyślnej
      const navPath = attrs?.navPath || `${workspace}/list`;
      navigate(`/${config}/${navPath}`);
    } catch (e) {
      console.error(e);
      alert('Błąd podczas zapisu');
    } finally {
      setSaving(false);
    }
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema?.properties?.[key];
    if (!field) return value;
    
    // Używamy enumLabels z konfiguracji pola
    return field.enumLabels?.[value] || value;
  };

  if (!schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Błąd konfiguracji</div>
        <div className="text-sm text-gray-500">
          Nie znaleziono schemy: {attrs?.schemaPath || 'brak schemaPath'} w workspace: {workspace}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Debug: config={config}, workspaceConfig={workspaceConfig ? 'loaded' : 'null'}, attrs={JSON.stringify(attrs)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <header className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {attrs?.title || '🤖 Generowanie z AI'}
          </h2>
          <p className="text-gray-600 mt-2">
            {attrs?.description || 'Opisz co chcesz wygenerować, a AI stworzy strukturalne dane.'}
          </p>
        </header>

        <section className="p-6 space-y-6">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={attrs?.placeholder || "Wprowadź opis..."}
            className="w-full h-32 p-3 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading
              ? <span className="inline-flex animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>
              : '🎯 Wygeneruj'}
          </button>

          {error && <div className="text-red-600">Błąd: {error}</div>}

          {result && (
            <div className="p-6 bg-green-50 border rounded space-y-4">
              <h3 className="text-lg font-semibold text-green-800">✅ Wygenerowane dane</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schema.properties || {}).map(([key, field]: [string, any]) => (
                  <div key={key} className={field.widget === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium capitalize mb-1">
                      {field.label || key}
                    </label>
                    <div className="p-2 bg-white border rounded break-word text-sm">
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
                {saving ? 'Zapisywanie...' : '💾 Zapisz'}
              </button>
            </div>
          )}

          <footer className="flex justify-between items-center">
            <button
              onClick={() => {
                const navPath = attrs?.cancelNavPath || `${workspace}/list`;
                navigate(`/${config}/${navPath}`);
              }}
              className="text-gray-600 hover:underline"
            >
              ← Powrót
            </button>
            
            {/* Przykłady - jeśli są zdefiniowane w konfiguracji */}
            {attrs?.examples && (
              <div className="space-x-2">
                {attrs.examples.map((example: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    disabled={isLoading}
                  >
                    {example}
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