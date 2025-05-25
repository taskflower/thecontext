// src/themes/test/steps/LLMTicketGenerationStep.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { useLlm } from '../../../core/hooks/useLlm';
import { useNavigate } from 'react-router-dom';
import { configDB } from '../../../db';

// Schema for ticket generation
const TicketSchema = z.object({
  title: z.string().describe("Tytuł zgłoszenia"),
  description: z.string().describe("Szczegółowy opis problemu"),
  priority: z.enum(["low", "medium", "high", "urgent"]).describe("Priorytet zgłoszenia"),
  category: z.enum(["bug", "feature", "support", "question"]).describe("Kategoria zgłoszenia"),
  reporter: z.string().describe("Imię i nazwisko zgłaszającego"),
});

type TicketData = z.infer<typeof TicketSchema>;

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

export default function LLMTicketGenerationStep({ attrs }: any) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const llmHook = useLlm<TicketData>({
    schema: TicketSchema,
    jsonSchema: ticketJsonSchema,
    userMessage: prompt,
    systemMessage: `Jesteś asystentem zarządzania zgłoszeniami. Na podstawie opisu użytkownika wygeneruj strukturalne dane zgłoszenia.
    
Zasady:
- Tytuł powinien być krótki i opisowy (max 60 znaków)
- Opis powinien być szczegółowy i zawierać wszystkie istotne informacje
- Priorytet ustaw na podstawie pilności problemu
- Kategorię dobierz odpowiednio do typu zgłoszenia
- Jako reporter użyj "Użytkownik systemu" jeśli nie podano inaczej
    
Zwróć prawidłowy JSON zgodny ze schematem.`,
    autoStart: false,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Proszę wprowadzić opis zgłoszenia');
      return;
    }
    await llmHook.startLlmProcess();
  };

  const handleSaveTicket = async () => {
    if (!llmHook.result) return;
    
    try {
      setSaving(true);
      const ticketId = Date.now().toString();
      
      const ticketData = {
        ...llmHook.result,
        id: ticketId,
        status: 'new',
        assignee: '',
        dueDate: ''
      };
      
      await configDB.records.put({
        id: `tickets:${ticketId}`,
        data: ticketData,
        updatedAt: new Date()
      });
      
      console.log('Ticket saved successfully');
      navigate('/testApp/tickets/list');
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Błąd podczas zapisywania zgłoszenia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            🤖 Generowanie zgłoszenia z AI
          </h2>
          <p className="text-gray-600 mt-2">
            Opisz problem lub potrzebę, a AI automatycznie wygeneruje strukturalne zgłoszenie
          </p>
        </div>

        <div className="p-6">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis problemu lub potrzeby
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Np. 'Aplikacja się crashuje gdy próbuję wgrać plik większy niż 10MB. Dzieje się to od wczoraj na wszystkich przeglądarką. To blokuje pracę całego zespołu.'"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={llmHook.isLoading}
            />
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              disabled={llmHook.isLoading || !prompt.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {llmHook.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generowanie...
                </>
              ) : (
                <>
                  🎯 Wygeneruj zgłoszenie
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {llmHook.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Błąd generowania:</div>
              <div className="text-red-700 text-sm mt-1">{llmHook.error}</div>
            </div>
          )}

          {/* Generated Result */}
          {llmHook.result && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-800">
                  ✅ Wygenerowane zgłoszenie
                </h3>
                <button
                  onClick={handleSaveTicket}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      💾 Zapisz zgłoszenie
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tytuł
                  </label>
                  <div className="p-2 bg-white border rounded text-sm">
                    {llmHook.result.title}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorytet
                  </label>
                  <div className="p-2 bg-white border rounded text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      llmHook.result.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      llmHook.result.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      llmHook.result.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {llmHook.result.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <div className="p-2 bg-white border rounded text-sm">
                    {llmHook.result.category}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zgłaszający
                  </label>
                  <div className="p-2 bg-white border rounded text-sm">
                    {llmHook.result.reporter}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <div className="p-2 bg-white border rounded text-sm">
                    {llmHook.result.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/testApp/tickets/list')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Powrót do listy
            </button>
            
            {/* Example prompts */}
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">Przykłady:</p>
              <div className="flex gap-2 flex-wrap justify-end">
                {[
                  "Aplikacja się crashuje przy uploadzie plików",
                  "Potrzebujemy nową funkcję eksportu do PDF",
                  "Problem z logowaniem przez Google"
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    disabled={llmHook.isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}