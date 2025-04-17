// src/components/ScenarioManager.tsx
import React, { useState } from "react";
import { Scenario } from "../templates/baseTemplate";
import { convertScenarioToTemplate, convertTemplateToScenarioImplementation, generateScenarioPrompt } from "@/lib/scenarioGenerator";


interface ScenarioManagerProps {
  workspaceId: string;
  availableScenarios: Scenario[];
  llmService: any; // Tutaj należałoby użyć właściwego interfejsu serwisu LLM
  onScenarioGenerated?: (code: string) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  workspaceId,
  availableScenarios,
  llmService,
  onScenarioGenerated,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [newScenarioDescription, setNewScenarioDescription] =
    useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Znajdź wybrany scenariusz
  const selectedScenario = availableScenarios.find(
    (s) => s.id === selectedScenarioId
  );

  // Generuj nowy scenariusz
  const handleGenerateScenario = async () => {
    if (!selectedScenario) {
      setError("Proszę wybrać scenariusz wzorcowy");
      return;
    }

    if (!newScenarioDescription.trim()) {
      setError("Proszę podać opis nowego scenariusza");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowResult(false);

    try {
      // Konwertuj scenariusz do szablonu
      const scenarioTemplate = convertScenarioToTemplate(selectedScenario);

      // Wygeneruj prompt dla LLM
      const prompt = generateScenarioPrompt(
        scenarioTemplate,
        newScenarioDescription
      );

      // Wywołaj LLM z promptem
      const llmResponse = await llmService.generateCompletion(prompt);

      try {
        // Parsuj odpowiedź LLM jako JSON
        const newScenarioTemplate = JSON.parse(llmResponse);

        // Konwertuj szablon scenariusza na implementację
        const scenarioImplementation =
          convertTemplateToScenarioImplementation(newScenarioTemplate);

        setGeneratedCode(scenarioImplementation);
        setShowResult(true);

        // Wywołaj callback jeśli istnieje
        if (onScenarioGenerated) {
          onScenarioGenerated(scenarioImplementation);
        }
      } catch (parseError) {
        setError(
          "Nie udało się przetworzyć odpowiedzi LLM. Nieprawidłowy format JSON."
        );
        console.error("Error parsing LLM response:", parseError);
      }
    } catch (apiError) {
      setError(`Błąd podczas generowania scenariusza: ${apiError.message}`);
      console.error("API error:", apiError);
    } finally {
      setIsGenerating(false);
    }
  };

  // Funkcja do skopiowania wygenerowanego kodu
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(generatedCode)
      .then(() => alert("Kod został skopiowany do schowka"))
      .catch((err) => console.error("Nie udało się skopiować kodu:", err));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Generator scenariuszy</h2>

      {/* Wybór scenariusza wzorcowego */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wybierz scenariusz wzorcowy
        </label>
        <select
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Wybierz scenariusz --</option>
          {availableScenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {/* Opis nowego scenariusza */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Podaj opis nowego scenariusza
        </label>
        <textarea
          value={newScenarioDescription}
          onChange={(e) => setNewScenarioDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="Np. Analiza i optymalizacja kampanii Google Ads dla sklepu e-commerce"
        ></textarea>
      </div>

      {/* Przycisk generowania */}
      <div className="mb-6">
        <button
          onClick={handleGenerateScenario}
          disabled={
            isGenerating ||
            !selectedScenarioId ||
            !newScenarioDescription.trim()
          }
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg
                className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generowanie...
            </>
          ) : (
            "Wygeneruj scenariusz"
          )}
        </button>
      </div>

      {/* Komunikat o błędzie */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* Wynik generowania */}
      {showResult && generatedCode && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Wygenerowany kod scenariusza
            </h3>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 text-sm"
            >
              Kopiuj do schowka
            </button>
          </div>
          <div className="bg-gray-800 rounded-md overflow-hidden">
            <pre className="p-4 text-gray-100 text-sm overflow-x-auto whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Aby dodać ten scenariusz do aplikacji, utwórz odpowiednie pliki w
            strukturze folderów i zaimportuj scenariusz w pliku
            scenarios/index.ts.
          </p>

          {/* Instrukcja instalacji */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium text-yellow-800 mb-2">
              Instrukcja instalacji scenariusza
            </h4>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-2">
              <li>
                Utwórz folder dla nowego scenariusza w{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  /src/templates/default/workspaces/{workspaceId}
                  /scenarios/[nazwaScenariusza]
                </code>
              </li>
              <li>
                Utwórz podfolder{" "}
                <code className="bg-yellow-100 px-1 rounded">steps</code> dla
                kroków scenariusza
              </li>
              <li>
                Zapisz wygenerowany kod w pliku{" "}
                <code className="bg-yellow-100 px-1 rounded">index.ts</code> i
                plikach dla poszczególnych kroków
              </li>
              <li>
                Zaimportuj i dodaj nowy scenariusz w pliku{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  /src/templates/default/workspaces/{workspaceId}
                  /scenarios/index.ts
                </code>
              </li>
              <li>
                Dodaj wymagane schematy i kontekst dla scenariusza w
                odpowiednich plikach
              </li>
              <li>
                Uruchom ponownie aplikację aby zobaczyć nowy scenariusz na
                liście
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioManager;
