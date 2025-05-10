// src/pages/ConfigPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdvancedConfigManager from "../components/AdvancedConfigManager";
import defaultConfig from "../../_configs/marketingApp/config";
import { AppConfig } from "../../core/types";
import { useConfigManager } from "../hooks/useConfigManager";

const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [appId, setAppId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { importConfig, updateConfig, loading, error } = useConfigManager();

  // Efekt do pobierania appId z localStorage lub URL
  useEffect(() => {
    // Sprawdź URL
    const params = new URLSearchParams(window.location.search);
    const urlAppId = params.get('appId');
    
    if (urlAppId) {
      setAppId(urlAppId);
      return;
    }
    
    // Sprawdź localStorage
    const storedAppId = localStorage.getItem('lastExportedAppId');
    if (storedAppId) {
      setAppId(storedAppId);
    }
  }, []);

  // Obsługa eksportu konfiguracji
  const handleExported = () => {
    console.log("Konfiguracja wyeksportowana", config);
  };

  // Obsługa importu konfiguracji
  const handleImported = (newConfig: AppConfig) => {
    setConfig(newConfig);
    console.log("Konfiguracja zaimportowana", newConfig);
  };

  // Funkcja zapisująca konfigurację do Firebase
  const saveToFirebase = async () => {
    try {
      if (appId) {
        // Aktualizacja istniejącej konfiguracji
        const success = await updateConfig(appId, config);
        if (success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } else {
        // Utworzenie nowej konfiguracji
        const newAppId = await importConfig(config);
        if (newAppId) {
          setAppId(newAppId);
          // Zapisz ID w localStorage do przyszłego użycia
          localStorage.setItem('lastExportedAppId', newAppId);
          // Dodaj ID do URL
          const url = new URL(window.location.href);
          url.searchParams.set('appId', newAppId);
          window.history.pushState({}, '', url.toString());
          
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error("Błąd podczas zapisywania do Firebase:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Zarządzanie konfiguracją</h1>
          <p className="text-gray-600">
            Eksportuj, importuj lub zapisz konfigurację aplikacji
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Powrót do aplikacji
          </Link>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              {appId
                ? `Konfiguracja została zaktualizowana w Firebase (ID: ${appId})`
                : "Konfiguracja została zapisana w Firebase!"}
            </span>
          </div>
        </div>
      )}

      {appId && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2">Informacje o konfiguracji</h2>
          <div className="mb-2">
            <span className="font-medium">ID aplikacji:</span> {appId}
          </div>
          <div className="mb-2">
            <span className="font-medium">Link do aplikacji:</span>{" "}
            <a
              href={`/app/${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              /app/{appId}
            </a>
          </div>
          <div className="mb-2">
            <span className="font-medium">Link do panelu administracyjnego:</span>{" "}
            <a
              href={`/admin/${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              /admin/{appId}
            </a>
          </div>
        </div>
      )}

      <div className="mb-6">
        <AdvancedConfigManager
          initialConfig={config}
          showDetails={true}
          onExported={handleExported}
          onImported={handleImported}
        />
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Zapis do Firebase</h2>
        <p className="mb-4">
          Zapisz aktualną konfigurację do Firebase, aby używać jej w aplikacji poprzez ID.
        </p>
        
        <button
          onClick={saveToFirebase}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading
            ? "Zapisywanie..."
            : appId
            ? "Aktualizuj w Firebase"
            : "Zapisz do Firebase"}
        </button>
        
        {error && (
          <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
            Błąd: {error}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Pomoc</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-2">Zarządzanie konfiguracją</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Eksport konfiguracji</strong> - zapisuje aktualną konfigurację do pliku JSON, 
              który możesz przechowywać lokalnie lub udostępniać innym.
            </li>
            <li>
              <strong>Import konfiguracji</strong> - wczytuje konfigurację z pliku JSON.
            </li>
            <li>
              <strong>Zapis do Firebase</strong> - zapisuje konfigurację w bazie danych Firebase, 
              co umożliwia korzystanie z niej przez podanie ID w adresie URL.
            </li>
            <li>
              <strong>Kopiuj do schowka</strong> - kopiuje pełną konfigurację jako tekst JSON, 
              co jest przydatne do szybkiego udostępniania lub analizy.
            </li>
          </ul>
          
          <h3 className="text-lg font-medium mt-4 mb-2">Jak używać konfiguracji z Firebase?</h3>
          <p>Po zapisaniu konfiguracji do Firebase, możesz jej używać na dwa sposoby:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-2">
            <li>
              Otwórz aplikację pod adresem <code>/app/[ID_APLIKACJI]</code>
            </li>
            <li>
              Dodaj parametry do URL: <code>/?source=firebase&appId=[ID_APLIKACJI]</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;