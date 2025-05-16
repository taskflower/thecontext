// src/editor/EditorApp.tsx
// To jest całkowicie nowy komponent, który będzie służył jako "mini-aplikacja" dla edytora

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfig } from "@/core/types";
import ConfigEditor from "./ConfigEditor";
import { Loading } from "@/components";

/**
 * EditorApp działa jako samodzielna "mini-aplikacja" do edycji konfiguracji.
 * Zamiast polegać na ConfigProvider, bezpośrednio ładuje konfigurację z Firebase
 * i przekazuje ją do ConfigEditor.
 */
export const EditorApp: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  
  // Firebase adapter
  const dbAdapter = new FirebaseAdapter("application_configs");
  
  // Ładowanie konfiguracji
  useEffect(() => {
    const loadConfig = async () => {
      if (!configId) {
        setError("Brak identyfikatora konfiguracji");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await dbAdapter.retrieveData(configId);
        if (!result || !result.payload) {
          throw new Error(`Nie znaleziono konfiguracji o ID: ${configId}`);
        }
        
        setConfig(result.payload as AppConfig);
        setLoading(false);
      } catch (err: any) {
        console.error("Błąd ładowania konfiguracji:", err);
        setError(`Błąd ładowania konfiguracji: ${err.message || "Nieznany błąd"}`);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [configId]);
  
  // Nawigacja do strony głównej
  const goToHomepage = () => {
    navigate(`/${configId}`);
  };
  
  // Obsługa stanu ładowania
  if (loading) {
    return <Loading message="Ładowanie edytora konfiguracji..." />;
  }
  
  // Obsługa błędów
  if (error || !config) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-medium text-red-700 mb-2">Błąd</h2>
          <p className="text-red-600">{error || "Nie można załadować konfiguracji"}</p>
        </div>
        
        <button 
          onClick={goToHomepage} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Wróć do aplikacji
        </button>
      </div>
    );
  }
  
  // Przekaż załadowaną konfigurację do ConfigEditor
  return <ConfigEditor initialConfig={config} configId={configId} />;
};

export default EditorApp;