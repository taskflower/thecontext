// src/debug/tabs/ExporterTab.tsx

import React, { useState, useMemo } from 'react';
import { Download,  RefreshCw } from 'lucide-react';
import { AppConfig } from '../../core/types';
import { createDatabaseProvider, SaveToDBOptions } from '@/provideDB/databaseProvider';

interface ExporterTabProps {
  config: AppConfig;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

const ExporterTab: React.FC<ExporterTabProps> = ({ config }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const dbProvider = useMemo(
    () => createDatabaseProvider('firebase', 'application_configs'),
    []
  );

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    const container = document.getElementById('logs-container');
    if (container) setTimeout(() => { container.scrollTop = container.scrollHeight; }, 10);
  };

  const exportConfig = async () => {
    setStatus('exporting');
    setLogs([]);

    try {
      addLog(`🚀 Rozpoczynam zapis konfiguracji "${config.name}"...`);
      const workspacesCount = config.workspaces.length;
      const scenariosCount = config.scenarios.length;
      const nodesCount = config.scenarios.reduce((sum, s) => sum + s.nodes.length, 0);
      addLog(`📊 Statystyki: ${workspacesCount} workspace'ów, ${scenariosCount} scenariuszy, ${nodesCount} węzłów`);
      addLog(`📝 Zapis do Firestore...`);

      const options: SaveToDBOptions = {
        enabled: true,
        provider: 'firebase',
        itemType: 'project',
        itemTitle: config.name,
        contentPath: 'application_configs',
        additionalInfo: { workspacesCount, scenariosCount, nodesCount }
      };
      await dbProvider.saveData(options, config);

      addLog('✅ Zapis zakończony pomyślnie');
      setStatus('success');
    } catch (e: any) {
      console.error('Błąd podczas zapisu:', e);
      addLog(`❌ Błąd: ${e.message || 'nieznany'}`);
      setStatus('error');
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Eksporter konfiguracji</h3>
          <p className="text-xs text-gray-600 mt-1">Zapisuje konfigurację aplikacji do Firestore.</p>
        </div>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={exportConfig}
            disabled={status === 'exporting'}
            className={`w-full py-2 rounded-md text-xs font-medium flex items-center justify-center transition-colors ${
              status === 'exporting'
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'exporting' ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Zapisywanie...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" />Zapisz konfigurację</>
            )}
          </button>
        </div>
        {logs.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">Logi</h3>
            <div id="logs-container" className="bg-gray-900 text-gray-200 p-2 rounded h-40 overflow-y-auto text-xs font-mono">
              {logs.map((log, i) => <div key={i} className="mb-1 leading-tight">{log}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExporterTab;