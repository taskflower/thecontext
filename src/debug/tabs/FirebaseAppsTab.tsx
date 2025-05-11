// src/debug/tabs/FirebaseAppsTab.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { RefreshCw, ExternalLink, FileText, Database } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

const FirebaseAppsTab: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Wykrywanie bieżącego appId z URL
  useEffect(() => {
    const appIdMatch = window.location.pathname.match(/^\/app\/([^\/]+)/);
    if (appIdMatch && appIdMatch[1]) {
      setCurrentAppId(appIdMatch[1]);
    } else {
      setCurrentAppId(null);
    }
  }, [window.location.pathname]);
  
  // Funkcja pobierająca aplikacje z Firebase
  const fetchApps = async () => {
    if (!user) {
      setError("Zaloguj się, aby przeglądać aplikacje z Firebase");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const db = getFirestore();
      const appsSnapshot = await getDocs(collection(db, "app_applications"));
      
      if (appsSnapshot.empty) {
        setApps([]);
        return;
      }
      
      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fetchedAt: new Date().toISOString()
      }));
      
      setApps(appsList);
    } catch (err: any) {
      console.error("Błąd podczas pobierania aplikacji:", err);
      setError(err.message || "Wystąpił nieznany błąd");
    } finally {
      setLoading(false);
    }
  };
  
  // Pobieramy aplikacje przy pierwszym renderowaniu
  useEffect(() => {
    if (user) {
      fetchApps();
    }
  }, [user]);
  
  // Funkcja do otwierania aplikacji w tej samej karcie
  const openApp = (appId: string) => {
    window.location.href = `/app/${appId}`;
  };
  
  // Funkcja kopiująca ID aplikacji do schowka
  const copyAppId = (appId: string) => {
    navigator.clipboard.writeText(appId)
      .then(() => {
        alert("ID aplikacji skopiowane do schowka");
      })
      .catch(err => {
        console.error("Błąd kopiowania do schowka:", err);
      });
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center text-gray-500">
          <Database className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Brak dostępu</h3>
          <p>Zaloguj się, aby przeglądać aplikacje z Firebase</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Aplikacje w Firebase</h2>
        <button
          onClick={fetchApps}
          disabled={loading}
          className="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 flex items-center"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Odświeżanie...' : 'Odśwież listę'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="flex flex-col items-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mb-2" />
              <span>Ładowanie aplikacji...</span>
            </div>
          </div>
        ) : apps.length === 0 ? (
          <div className="p-4 text-gray-500 italic text-center">
            Nie znaleziono aplikacji w Firebase
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apps.map(app => (
              <div 
                key={app.id} 
                className={`p-4 hover:bg-gray-50 ${currentAppId === app.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {app.name}
                    {currentAppId === app.id && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Aktywna
                      </span>
                    )}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyAppId(app.id)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      title="Kopiuj ID aplikacji"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/app/${app.id}`, '_blank')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Otwórz w nowej karcie"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {app.description || 'Brak opisu'}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    ID: {app.id}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Template: {app.tplDir || 'default'}
                  </span>
                </div>
                
                <button
                  onClick={() => openApp(app.id)}
                  className="w-full text-center text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {currentAppId === app.id ? 'Aktualnie używana' : 'Załaduj tę aplikację'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseAppsTab;