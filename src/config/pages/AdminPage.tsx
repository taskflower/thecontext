// src/pages/AdminPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfigManager from "../components/ConfigManager";
import { useConfigManager } from "../hooks/useConfigManager";

import { collection, getDocs, getFirestore } from "firebase/firestore";
import { AppConfig } from "@/core";

// Komponent do listy aplikacji
const ApplicationsList: React.FC<{ onSelectApp: (appId: string) => void }> = ({ onSelectApp }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const appsSnapshot = await getDocs(collection(db, "app_applications"));
        const appsList = appsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApps(appsList);
        setError(null);
      } catch (err: any) {
        console.error("Błąd podczas pobierania aplikacji:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApps();
  }, []);
  
  if (loading) return <div className="p-4">Ładowanie aplikacji...</div>;
  if (error) return <div className="p-4 text-red-500">Błąd: {error}</div>;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-3">Dostępne aplikacje</h3>
      
      {apps.length === 0 ? (
        <div className="text-gray-500 italic mb-4">Brak zapisanych aplikacji</div>
      ) : (
        <ul className="divide-y">
          {apps.map(app => (
            <li key={app.id} className="py-2">
              <button 
                className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                onClick={() => onSelectApp(app.id)}
              >
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-sm text-gray-500">{app.description || 'Brak opisu'}</div>
                </div>
                <div className="text-xs bg-gray-200 rounded px-2 py-1">{app.id}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <button 
        className="mt-4 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => onSelectApp('new')}
      >
        Utwórz nową aplikację
      </button>
    </div>
  );
};

// Komponent do edycji aplikacji
const AppEditor: React.FC<{ appId: string, onBack: () => void }> = ({ appId, onBack }) => {
  const { loading, error, getApplication, exportConfig } = useConfigManager();
  const [config, setConfig] = useState<AppConfig | null>(null);
  
  useEffect(() => {
    // Jeśli to nie jest nowa aplikacja, pobieramy konfigurację
    if (appId !== 'new') {
      const fetchConfig = async () => {
        try {
          const app = await getApplication(appId);
          if (app) {
            // Pobieramy pełną konfigurację
            const fullConfig = await exportConfig(appId);
            setConfig(fullConfig);
          }
        } catch (err) {
          console.error("Błąd podczas pobierania danych aplikacji:", err);
        }
      };
      
      fetchConfig();
    }
  }, [appId, getApplication, exportConfig]);
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <button 
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onBack}
        >
          &larr; Powrót do listy
        </button>
        
        <h2 className="text-xl font-semibold">
          {appId === 'new' ? 'Nowa aplikacja' : `Edycja aplikacji (${appId})`}
        </h2>
        
        <div></div> {/* Pusty element dla wyrównania flexbox */}
      </div>
      
      {loading ? (
        <div className="p-4 text-center">Ładowanie...</div>
      ) : (
        <ConfigManager appId={appId !== 'new' ? appId : undefined} initialConfig={config} />
      )}
    </div>
  );
};

// Główny komponent strony administracyjnej
const AdminPage: React.FC = () => {
  const { appId } = useParams<{ appId?: string }>();
  const navigate = useNavigate();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(appId || null);
  
  // Obsługa wyboru aplikacji
  const handleSelectApp = (id: string) => {
    setSelectedAppId(id);
    navigate(`/admin/${id}`);
  };
  
  // Powrót do listy aplikacji
  const handleBack = () => {
    setSelectedAppId(null);
    navigate('/admin');
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel administracyjny</h1>
        <p className="text-gray-600">Zarządzanie konfiguracją aplikacji</p>
      </header>
      
      <main>
        {selectedAppId ? (
          <AppEditor appId={selectedAppId} onBack={handleBack} />
        ) : (
          <ApplicationsList onSelectApp={handleSelectApp} />
        )}
      </main>
    </div>
  );
};

export default AdminPage;