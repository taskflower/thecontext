// src/components/ConfigManager.tsx
import React, { useState, useEffect } from "react";
import { useConfigManager } from "../hooks/useConfigManager";
import { AppConfig } from "../../core/types";

interface ConfigManagerProps {
  appId?: string;
  initialConfig?: AppConfig;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ appId, initialConfig }) => {
  const [config, setConfig] = useState<AppConfig | null>(initialConfig || null);
  const [localAppId, setLocalAppId] = useState<string | null>(appId || null);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const {
    loading,
    error,
    exportConfig,
    importConfig,
    updateConfig,
    getApplication
  } = useConfigManager();

  // Pobieranie konfiguracji z Firebase, jeśli podano appId
  useEffect(() => {
    if (localAppId) {
      const fetchConfig = async () => {
        try {
          setSyncStatus("Pobieranie konfiguracji...");
          const fetchedConfig = await exportConfig(localAppId);
          if (fetchedConfig) {
            setConfig(fetchedConfig);
            setSyncStatus("Konfiguracja pobrana pomyślnie");
          }
        } catch (err : any) {
          setSyncStatus(`Błąd pobierania: ${err.message}`);
        }
      };

      fetchConfig();
    }
  }, [localAppId, exportConfig]);

  // Eksport konfiguracji do pliku JSON
  const handleExportToFile = () => {
    if (!config) return;

    const jsonConfig = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSyncStatus("Konfiguracja wyeksportowana do pliku");
  };

  // Import konfiguracji z pliku JSON
  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonConfig = JSON.parse(event.target?.result as string);
        setConfig(jsonConfig);
        setSyncStatus("Konfiguracja zaimportowana z pliku (lokalnie)");
      } catch (err : any) {
        setSyncStatus(`Błąd importu z pliku: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Zapis konfiguracji do Firebase
  const handleSaveToFirebase = async () => {
    if (!config) return;

    try {
      setSyncStatus("Zapisywanie do Firebase...");
      
      if (localAppId) {
        // Aktualizacja istniejącej aplikacji
        await updateConfig(localAppId, config);
        setSyncStatus(`Konfiguracja zaktualizowana w Firebase (ID: ${localAppId})`);
      } else {
        // Utworzenie nowej aplikacji
        const newAppId = await importConfig(config);
        if (newAppId) {
          setLocalAppId(newAppId);
          setSyncStatus(`Konfiguracja zapisana w Firebase (ID: ${newAppId})`);
        }
      }
    } catch (err: any) {
      setSyncStatus(`Błąd zapisu do Firebase: ${err.message}`);
    }
  };

  // Sprawdzenie czy aplikacja o podanym ID istnieje
  const handleCheckApp = async () => {
    if (!localAppId) return;

    try {
      setSyncStatus("Sprawdzanie aplikacji...");
      const app = await getApplication(localAppId);
      if (app) {
        setSyncStatus(`Aplikacja ${app.name} (${localAppId}) istnieje w Firebase`);
      }
    } catch (err : any) {
      setSyncStatus(`Błąd sprawdzania aplikacji: ${err.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Zarządzanie konfiguracją</h2>
      
      {/* Status i błędy */}
      {syncStatus && (
        <div className={`mb-4 p-2 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {syncStatus}
        </div>
      )}
      
      {/* Obsługa Firebase */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Firebase</h3>
        
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded mr-2"
            placeholder="ID Aplikacji w Firebase"
            value={localAppId || ''}
            onChange={(e) => setLocalAppId(e.target.value || null)}
          />
          <button
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleCheckApp}
            disabled={loading || !localAppId}
          >
            Sprawdź
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSaveToFirebase}
            disabled={loading || !config}
          >
            {loading ? 'Zapisywanie...' : (localAppId ? 'Aktualizuj w Firebase' : 'Zapisz do Firebase')}
          </button>
        </div>
      </div>
      
      {/* Obsługa plików */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Plik lokalny</h3>
        
        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            onClick={handleExportToFile}
            disabled={!config}
          >
            Eksportuj do pliku
          </button>
          
          <label className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer">
            Importuj z pliku
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFromFile}
              disabled={loading}
            />
          </label>
        </div>
      </div>
      
      {/* Wyświetlanie konfiguracji */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Aktualna konfiguracja</h3>
        
        {config ? (
          <div className="overflow-auto max-h-96">
            <div className="font-semibold">Nazwa aplikacji: {config.name}</div>
            <div className="mb-2">Opis: {config.description || '-'}</div>
            <div className="mb-2">Katalog szablonów: {config.tplDir}</div>
            <div className="mb-2">Liczba workspaces: {config.workspaces?.length || 0}</div>
            <div className="mb-2">Liczba scenariuszy: {config.scenarios?.length || 0}</div>
            
            <div className="flex mt-4 gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                onClick={() => {
                  const textarea = document.createElement("textarea");
                  textarea.value = JSON.stringify(config, null, 2);
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand("copy");
                  document.body.removeChild(textarea);
                  setSyncStatus("Konfiguracja skopiowana do schowka");
                }}
              >
                Kopiuj JSON
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">Brak konfiguracji</div>
        )}
      </div>
    </div>
  );
};

export default ConfigManager;