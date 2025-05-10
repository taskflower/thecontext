// src/components/AdvancedConfigManager.tsx
import React, { useState, useEffect } from "react";
import defaultConfig from "../_configs/marketingApp/config"; // Importuj domyślną konfigurację
import { AppConfig } from "../core/types";

interface AdvancedConfigManagerProps {
  // Opcjonalnie przekazana konfiguracja zamiast domyślnej
  initialConfig?: AppConfig;
  // Czy pokazywać szczegóły konfiga w podglądzie
  showDetails?: boolean;
  // Opcjonalny callback po eksporcie
  onExported?: (config: AppConfig) => void;
  // Opcjonalny callback po imporcie
  onImported?: (config: AppConfig) => void;
  // Opcjonalny styl komponentu
  className?: string;
}

const AdvancedConfigManager: React.FC<AdvancedConfigManagerProps> = ({
  initialConfig,
  showDetails = true,
  onExported,
  onImported,
  className = "",
}) => {
  const [activeConfig, setActiveConfig] = useState<AppConfig>(initialConfig || defaultConfig);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFilename, setExportFilename] = useState(`app-config-${new Date().toISOString().slice(0, 10)}`);

  // Aktualizuj activeConfig gdy initialConfig się zmieni
  useEffect(() => {
    if (initialConfig) {
      setActiveConfig(initialConfig);
    }
  }, [initialConfig]);

  // Funkcja eksportująca konfigurację do pliku
  const exportConfig = () => {
    try {
      setStatus("Eksportowanie konfiguracji...");
      setError(null);

      // Przygotuj dane jako ładnie sformatowany JSON
      const jsonConfig = JSON.stringify(activeConfig, null, 2);
      const blob = new Blob([jsonConfig], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Utwórz element <a> do pobrania pliku
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportFilename}.json`;
      document.body.appendChild(a);
      a.click();

      // Posprzątaj po sobie
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("Konfiguracja została wyeksportowana pomyślnie");
      setShowExportOptions(false);
      if (onExported) onExported(activeConfig);
    } catch (err: any) {
      console.error("Błąd podczas eksportowania konfiguracji:", err);
      setError(err.message || "Wystąpił nieznany błąd podczas eksportu");
      setStatus("Eksport nieudany");
    }
  };

  // Funkcja importująca konfigurację z pliku
  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setStatus("Importowanie konfiguracji...");
        setError(null);

        const jsonConfig = JSON.parse(event.target?.result as string);
        // Tutaj możesz dodać walidację struktury jsonConfig
        setActiveConfig(jsonConfig);
        
        setStatus("Konfiguracja zaimportowana pomyślnie");
        if (onImported) onImported(jsonConfig);
      } catch (err: any) {
        console.error("Błąd podczas importowania konfiguracji:", err);
        setError(err.message || "Nieprawidłowy format pliku JSON");
        setStatus("Import nieudany");
      }
    };
    reader.readAsText(file);
    
    // Reset input, aby można było zaimportować ten sam plik ponownie
    e.target.value = "";
  };

  // Funkcja kopiująca konfigurację do schowka
  const copyToClipboard = () => {
    try {
      setStatus("Kopiowanie do schowka...");
      setError(null);

      const jsonConfig = JSON.stringify(activeConfig, null, 2);
      navigator.clipboard.writeText(jsonConfig);
      
      setStatus("Konfiguracja skopiowana do schowka");
    } catch (err: any) {
      console.error("Błąd podczas kopiowania do schowka:", err);
      setError(err.message || "Nie udało się skopiować do schowka");
      setStatus("Kopiowanie nieudane");
    }
  };

  // Przełącz między konfiguracją domyślną a aktualną
  const switchToDefaultConfig = () => {
    setActiveConfig(defaultConfig);
    setStatus("Przełączono na domyślną konfigurację");
  };

  // Renderowanie podglądu konfiguracji
  const renderConfigPreview = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Aktywna konfiguracja</h3>
        <div className="mb-2">
          <span className="font-medium">Nazwa:</span> {activeConfig.name}
        </div>
        <div className="mb-2">
          <span className="font-medium">Opis:</span> {activeConfig.description || "Brak opisu"}
        </div>
        <div className="mb-2">
          <span className="font-medium">Katalog szablonów:</span> {activeConfig.tplDir}
        </div>
        
        {showDetails && (
          <>
            <div className="mb-2">
              <span className="font-medium">Workspaces:</span> {activeConfig.workspaces?.length || 0}
              <ul className="ml-4 mt-1 text-sm">
                {activeConfig.workspaces?.map((ws, idx) => (
                  <li key={idx}>{ws.name} ({ws.slug})</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-medium">Scenariusze:</span> {activeConfig.scenarios?.length || 0}
              <ul className="ml-4 mt-1 text-sm">
                {activeConfig.scenarios?.map((sc, idx) => (
                  <li key={idx}>{sc.name} ({sc.slug}) - {sc.nodes?.length || 0} kroków</li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="mt-3 text-sm">
          <button
            onClick={() => setViewMode(viewMode === "preview" ? "json" : "preview")}
            className="text-blue-600 hover:underline"
          >
            {viewMode === "preview" ? "Pokaż JSON" : "Pokaż podgląd"}
          </button>
        </div>
      </div>
    );
  };

  // Renderowanie JSON-a konfiguracji
  const renderConfigJson = () => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">JSON konfiguracji</h3>
          <button
            onClick={() => setViewMode("preview")}
            className="text-sm text-blue-600 hover:underline"
          >
            Pokaż podgląd
          </button>
        </div>
        <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-auto max-h-96 text-xs">
          {JSON.stringify(activeConfig, null, 2)}
        </pre>
      </div>
    );
  };

  // Renderowanie opcji eksportu
  const renderExportOptions = () => {
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-md font-semibold mb-2">Opcje eksportu</h3>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nazwa pliku</label>
          <input
            type="text"
            value={exportFilename}
            onChange={(e) => setExportFilename(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Nazwa pliku bez rozszerzenia"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowExportOptions(false)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Anuluj
          </button>
          <button
            onClick={exportConfig}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Eksportuj
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`advanced-config-manager ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Zarządzanie konfiguracją</h2>
        
        {/* Status i błędy */}
        {status && (
          <div className={`mb-4 p-2 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
            {error && <div className="mt-1 text-sm">{error}</div>}
          </div>
        )}
        
        {/* Podgląd/JSON konfiguracji */}
        {viewMode === "preview" ? renderConfigPreview() : renderConfigJson()}
        
        {/* Opcje eksportu */}
        {showExportOptions && renderExportOptions()}
        
        {/* Przyciski akcji */}
        <div className="flex flex-wrap gap-2">
          {!showExportOptions && (
            <button
              onClick={() => setShowExportOptions(true)}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Eksportuj konfigurację
            </button>
          )}
          
          <label className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
            Importuj konfigurację
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importConfig}
            />
          </label>
          
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Kopiuj do schowka
          </button>
          
          <button
            onClick={switchToDefaultConfig}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Wczytaj domyślną
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigManager;