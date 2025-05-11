// src/debug/tabs/FirebaseAppsTab.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { RefreshCw, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { db } from '../../provideDB/firebase/config';
import { useAuth } from '../../auth/useAuth';
import { deleteFirebaseApp } from '@/provideDB/firebase/deleteFirebaseApp';


const FirebaseAppsTab: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Wykrywanie bieżącego appId z URL
  const currentAppId = window.location.pathname.match(/^\/app\/([^\/]+)/)?.[1] || null;
  
  const fetchApps = async () => {
    if (!user) {
      setError("Zaloguj się, aby przeglądać aplikacje");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const appsSnapshot = await getDocs(collection(db, "app_applications"));
      
      const appsList = appsSnapshot.empty 
        ? []
        : appsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
      
      setApps(appsList);
    } catch (err: any) {
      console.error("Błąd podczas pobierania aplikacji:", err);
      setError(err.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };
  
  const deleteApp = async (appId: string) => {
    if (!user || !appId) return;
    
    if (appId === currentAppId) {
      setError("Nie można usunąć aktualnie używanej aplikacji");
      return;
    }
    
    setDeleting(appId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await deleteFirebaseApp(appId);
      
      if (result.success) {
        setApps(prevApps => prevApps.filter(app => app.id !== appId));
        setConfirmDelete(null);
        setSuccessMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Błąd podczas usuwania aplikacji:", err);
      setError(`Błąd: ${err.message || "Nieznany błąd"}`);
    } finally {
      setDeleting(null);
    }
  };
  
  // Pobieramy aplikacje przy pierwszym renderowaniu
  useEffect(() => {
    if (user) {
      fetchApps();
    }
  }, [user]);
  
  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Zaloguj się, aby przeglądać aplikacje z Firebase
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Aplikacje Firebase</h2>
        <button
          onClick={fetchApps}
          disabled={loading}
          className="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100"
        >
          <RefreshCw className={`w-3 h-3 mr-1 inline ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Odświeżanie...' : 'Odśwież'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md mb-4 border border-green-200">
          {successMessage}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-32 p-4">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span>Ładowanie...</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="p-4 text-gray-500 italic text-center">
            Nie znaleziono aplikacji
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apps.map(app => (
              <div 
                key={app.id} 
                className={`p-4 hover:bg-gray-50 ${currentAppId === app.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {app.name}
                      {currentAppId === app.id && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Aktywna
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {app.description || 'Brak opisu'}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      ID: {app.id} | Template: {app.tplDir || 'default'}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.open(`/app/${app.id}`, '_blank')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Otwórz w nowej karcie"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {app.id !== currentAppId && (
                      <button
                        onClick={() => setConfirmDelete(app.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Usuń aplikację"
                        disabled={deleting === app.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {confirmDelete === app.id ? (
                  <div className="mt-2 p-3 border border-red-200 bg-red-50 rounded-md">
                    <div className="flex items-center mb-2 text-red-700">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-sm">Usunąć tę aplikację?</span>
                    </div>
                    <p className="text-xs text-red-600 mb-2">
                      Ta operacja jest nieodwracalna. Spowoduje usunięcie wszystkich workspace'ów, scenariuszy i węzłów powiązanych z tą aplikacją.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteApp(app.id)}
                        disabled={deleting === app.id}
                        className="flex-1 text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        {deleting === app.id ? 'Usuwanie...' : 'Usuń'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex-1 text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        disabled={deleting === app.id}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => window.location.href = `/app/${app.id}`}
                    className="w-full mt-3 text-center text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {currentAppId === app.id ? 'Aktualnie używana' : 'Załaduj aplikację'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseAppsTab;