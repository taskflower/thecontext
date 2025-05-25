// src/themes/test/steps/LLMTicketGenerationStep.tsx
import { useState } from 'react';
import { z } from 'zod';
import { useLlmEngine, useLocalStore } from '../../../core/engine';
import { useNavigate } from 'react-router-dom';

// Schemat zgłoszenia dla LLM
const TicketSchema = z.object({
  title: z.string().describe("Tytuł zgłoszenia"),
  description: z.string().describe("Szczegółowy opis problemu"),
  priority: z.enum(["low", "medium", "high", "urgent"]).describe("Priorytet zgłoszenia"),
  category: z.enum(["bug", "feature", "support", "question"]).describe("Kategoria zgłoszenia"),
  reporter: z.string().describe("Imię i nazwisko zgłaszającego"),
});

type TicketData = z.infer<typeof TicketSchema>;

// JSON Schema dla weryfikacji
const ticketJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Tytuł zgłoszenia" },
    description: { type: "string", description: "Szczegółowy opis problemu" },
    priority: {
      type: "string",
      enum: ["low", "medium", "high", "urgent"],
      description: "Priorytet zgłoszenia"
    },
    category: {
      type: "string",
      enum: ["bug", "feature", "support", "question"],
      description: "Kategoria zgłoszenia"
    },
    reporter: { type: "string", description: "Imię i nazwisko zgłaszającego" }
  },
  required: ["title", "description", "priority", "category", "reporter"]
};

export default function LLMTicketGenerationStep() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  // Hook LLM
  const { isLoading, error, result, start } = useLlmEngine<TicketData>({
    schema: TicketSchema,
    jsonSchema: ticketJsonSchema,
    userMessage: prompt,
    systemMessage: `Jesteś asystentem zarządzania zgłoszeniami. Na podstawie opisu użytkownika wygeneruj strukturalne dane zgłoszenia.

Zasady:
- Tytuł maks. 60 znaków
- Opis szczegółowy, zawierający wszystkie informacje
- Priorytet według pilności
- Kategoria według typu zgłoszenia
- Reporter domyślnie "Użytkownik systemu"

Zwróć czysty JSON zgodny ze schematem.`,
    autoStart: false,
  });

  // Lokalny store dla tickets:
  const { add: addTicket } = useLocalStore<TicketData>('tickets:');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Proszę wprowadzić opis zgłoszenia');
      return;
    }
    await start();
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      // Uzupełniamy dane
      const dataWithMeta = { ...result, status: 'new', assignee: '', dueDate: '' };
      await addTicket(dataWithMeta);
      navigate('/testApp/tickets/list');
    } catch (e) {
      console.error(e);
      alert('Błąd podczas zapisu zgłoszenia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <header className="p-6 border-b">
          <h2 className="text-2xl font-bold">🤖 Generowanie zgłoszenia z AI</h2>
          <p className="text-gray-600 mt-2">Opisz problem, a AI stworzy strukturalne zgłoszenie.</p>
        </header>

        <section className="p-6 space-y-6">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Np. 'Aplikacja crashuje przy uploadzie plików'."
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
              <h3 className="text-lg font-semibold text-green-800">✅ Wygenerowane</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['title','priority','category','reporter','description'] as const).map(key => (
                  <div key={key} className={key === 'description' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium capitalize mb-1">{key}</label>
                    <div className="p-2 bg-white border rounded-break text-sm">
                      {(result as any)[key]}
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
              onClick={() => navigate('/testApp/tickets/list')}
              className="text-gray-600 hover:underline"
            >← Powrót</button>
            <div className="space-x-2">
              {[
                "Aplikacja crashuje przy uploadzie",
                "Potrzeba eksportu do PDF",
                "Problem z Google login"
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  disabled={isLoading}
                >{ex}</button>
              ))}
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
