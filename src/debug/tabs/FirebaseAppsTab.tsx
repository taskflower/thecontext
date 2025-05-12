// src/debug/tabs/FirebaseAppsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createDatabaseProvider, DatabaseOperations } from '@/provideDB/databaseProvider';

const FirebaseAppsTab: React.FC = () => {
  const dbProvider = useMemo<DatabaseOperations>(
    () => createDatabaseProvider('firebase'),
    []
  );
  const [configs, setConfigs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      const list = await dbProvider.listItems('project');
      setConfigs(list);
      setError(null);
    } catch (e: any) {
      console.error('Błąd pobierania konfiguracji:', e);
      setError(e.message || 'nieznany błąd');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div className="p-4">
      {/* Przycisk odświeżania */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={fetchConfigs}
          className="px-3 py-1 text-xs font-medium bg-gray-200 rounded hover:bg-gray-300"
        >
          Odśwież
        </button>
      </div>
      {/* Błąd */}
      {error && (
        <div className="text-red-600 text-sm mb-2">Błąd: {error}</div>
      )}
      {/* Lista konfiguracji */}
      <div className="space-y-2">
        {configs.map(cfg => (
          <div key={cfg.id} className="p-3 border rounded shadow-sm">
            <h4 className="font-medium">{cfg.title || cfg.payload.name}</h4>
            <p className="text-xs text-gray-600">Typ: {cfg.type}</p>
          </div>
        ))}
        {configs.length === 0 && !error && (
          <p className="text-xs text-gray-500">Brak zapisanych konfiguracji.</p>
        )}
      </div>
    </div>
  );
};

export default FirebaseAppsTab;
