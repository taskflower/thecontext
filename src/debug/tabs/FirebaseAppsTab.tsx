// src/debug/tabs/AppsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ArrowRight } from 'lucide-react';
import { createDatabaseProvider, DatabaseOperations } from '@/provideDB/databaseProvider';
import { useConfig } from '@/ConfigProvider';

interface FirebaseConfig {
  id: string;
  title?: string;
  type?: string;
  payload?: any;
}

export const AppsTab: React.FC = () => {
  const dbProvider = useMemo<DatabaseOperations>(
    () => createDatabaseProvider('firebase', 'application_configs'),
    []
  );
  const [configs, setConfigs] = useState<FirebaseConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loadConfig } = useConfig();

  const fetchConfigs = async () => {
    try {
      const list = dbProvider.listItems
        ? await dbProvider.listItems('project')
        : [];
      setConfigs(list);
      setError(null);
    } catch (e: any) {
      console.error('Błąd pobierania konfiguracji:', e);
      setError(e.message || 'nieznany błąd');
    }
  };

  const openConfig = async (cfgId: string) => {
    try {
      await loadConfig(cfgId);
      navigate(`/${cfgId}`);
    } catch (e) {
      console.error('Błąd ładowania konfiguracji:', e);
      setError('Nie udało się załadować konfiguracji');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const selectedConfig = configs.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Sidebar list */}
      <div className="col-span-4 bg-white rounded-md border border-gray-200 overflow-auto max-h-[calc(100vh-180px)]">
        <div className="p-2 border-b border-gray-200">
          <div className="text-sm font-medium hover:text-blue-800 flex items-center">
            <Box className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Konfiguracje</span>
          </div>
        </div>
        <div className="p-2">
          {error && <div className="text-red-600 text-sm mb-2">Błąd: {error}</div>}
          {configs.length === 0 && !error && (
            <p className="text-xs text-gray-500">Brak zapisanych konfiguracji.</p>
          )}
          <div className="space-y-2">
            {configs.map(cfg => {
              const isSelected = cfg.id === selectedId;
              return (
                <div
                  key={cfg.id}
                  className={`p-3 border rounded shadow-sm cursor-pointer ${
                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setSelectedId(cfg.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-xs text-gray-700">
                        {cfg.title || cfg.payload?.name || cfg.id}
                      </h4>
                      <p className="text-[10px] text-gray-500">Typ: {cfg.type}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); openConfig(cfg.id); }}
                      className="flex items-center px-2 py-1 text-[10px] font-medium bg-green-100 rounded hover:bg-green-200"
                    >
                      <ArrowRight className="h-4 w-4 mr-1 flex-shrink-0" />
                      Otwórz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details panel */}
      <div className="col-span-8 bg-white rounded-md border border-gray-100 shadow-sm p-4 overflow-auto max-h-[calc(100vh-180px)]">
        {selectedConfig ? (
          <>
            <div className="border-b border-gray-100 pb-2 mb-2">
              <h2 className="text-sm font-medium text-gray-700">
                {selectedConfig.title || selectedConfig.id}
              </h2>
            </div>
            <div className="bg-gray-50 rounded p-3 overflow-auto text-xs font-mono text-gray-700">
              <pre>{JSON.stringify(selectedConfig.payload, null, 2)}</pre>
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-500 italic">
            Wybierz konfigurację z listy po lewej stronie
          </div>
        )}
      </div>
    </div>
  );
};

export default AppsTab;
