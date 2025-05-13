// src/debug/tabs/FirebaseAppsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDatabaseProvider, DatabaseOperations } from '@/provideDB/databaseProvider';
import { useConfig } from '@/ConfigProvider';

interface FirebaseAppsTabProps {}

const FirebaseAppsTab: React.FC<FirebaseAppsTabProps> = () => {
  const dbProvider = useMemo<DatabaseOperations>(
    () => createDatabaseProvider('firebase', 'application_configs'),
    []
  );
  const [configs, setConfigs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { loadConfig } = useConfig();

  const fetchConfigs = async () => {
    try {
      const list = dbProvider.listItems ? await dbProvider.listItems('project') : [];
      setConfigs(list);
      setError(null);
    } catch (e: any) {
      console.error('Błąd pobierania konfiguracji:', e);
      setError(e.message || 'nieznany błąd');
    }
  };

  const deleteConfig = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę konfigurację?')) return;
    try {
      if (!dbProvider.deleteItem) throw new Error('deleteItem nie jest zaimplementowane');
      await dbProvider.deleteItem(id);
      await fetchConfigs();
    } catch (e: any) {
      console.error('Błąd usuwania konfiguracji:', e);
      setError(e.message || 'nieznany błąd');
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Funkcja do otwierania konfiguracji
  const openConfig = async (configId: string, workspaceSlug: string) => {
    try {
      await loadConfig(configId);
      navigate(`/${configId}/${workspaceSlug}`);
    } catch (e) {
      console.error('Błąd ładowania konfiguracji:', e);
      setError('Nie udało się załadować konfiguracji');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={fetchConfigs}
          className="px-3 py-1 text-xs font-medium bg-gray-200 rounded hover:bg-gray-300"
        >
          Odśwież
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-2">
          Błąd: {error}
        </div>
      )}

      <div className="space-y-2">
        {configs.map(cfg => {
          const defaultWorkspace =
            cfg.payload?.workspaces?.[0]?.slug ?? '';
          return (
            <div key={cfg.id} className="p-3 border rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {cfg.title || cfg.payload?.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Typ: {cfg.type}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleDetails(cfg.id)}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 rounded hover:bg-blue-200"
                  >
                    {expandedIds.has(cfg.id) ? 'Ukryj szczegóły' : 'Szczegóły'}
                  </button>
                  {defaultWorkspace && (
                    <button
                      onClick={() => openConfig(cfg.id, defaultWorkspace)}
                      className="px-2 py-1 text-xs font-medium bg-green-100 rounded hover:bg-green-200"
                    >
                      Otwórz
                    </button>
                  )}
                  <button
                    onClick={() => deleteConfig(cfg.id)}
                    className="px-2 py-1 text-xs font-medium bg-red-100 rounded hover:bg-red-200"
                  >
                    Usuń
                  </button>
                </div>
              </div>

              {expandedIds.has(cfg.id) && (
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(cfg.payload, null, 2)}
                </pre>
              )}
            </div>
          );
        })}

        {configs.length === 0 && !error && (
          <p className="text-xs text-gray-500">
            Brak zapisanych konfiguracji.
          </p>
        )}
      </div>
    </div>
  );
};

export default FirebaseAppsTab;