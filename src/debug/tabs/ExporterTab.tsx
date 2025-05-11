// src/debug/tabs/ExporterTab.tsx
import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../provideDB/firebase/config';
import { AppConfig } from '../../core/types';
import { Download, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ExporterTabProps {
  config: AppConfig;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

const ExporterTab: React.FC<ExporterTabProps> = ({ config }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [appId, setAppId] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // Funkcja dodająca log
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    const logsContainer = document.getElementById('logs-container');
    if (logsContainer) {
      setTimeout(() => {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }, 10);
    }
  };

  // Funkcja kopiowania do schowka
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog(`📋 Skopiowano do schowka: ${text}`);
  };
  
  // Tworzenie aplikacji
  const createApp = async (config: AppConfig): Promise<string> => {
    try {
      const appRef = doc(collection(db, 'app_applications'));
      const appId = appRef.id;
      
      await setDoc(appRef, {
        name: config.name,
        description: config.description || '',
        tplDir: config.tplDir || 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      addLog(`✅ Utworzono aplikację: ${appId}`);
      return appId;
    } catch (error) {
      addLog(`❌ Błąd podczas tworzenia aplikacji: ${error}`);
      throw error;
    }
  };
  
  // Eksport workspace'ów
  const exportWorkspaces = async (appId: string, workspaces: AppConfig['workspaces']): Promise<void> => {
    try {
      addLog(`📝 Eksportuję ${workspaces.length} workspace'ów...`);
      
      const workspacePromises = workspaces.map(async (workspace, index) => {
        try {
          // Używamy slug jako ID dokumentu
          const workspaceRef = doc(db, 'app_workspaces', workspace.slug);
          
          await setDoc(workspaceRef, {
            appId,
            slug: workspace.slug,
            name: workspace.name,
            description: workspace.description || '',
            icon: workspace.icon || '',
            order: index,
            contextSchema: JSON.stringify(workspace.contextSchema),
            templateSettings: JSON.stringify(workspace.templateSettings || {}),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          addLog(`✅ Workspace: ${workspace.name} (${workspace.slug})`);
        } catch (error) {
          addLog(`❌ Błąd workspace ${workspace.name}: ${error}`);
        }
      });
      
      await Promise.all(workspacePromises);
    } catch (error) {
      addLog(`❌ Błąd podczas eksportu workspace'ów: ${error}`);
    }
  };
  
  // Eksport scenariuszy
  const exportScenarios = async (appId: string, scenarios: AppConfig['scenarios']): Promise<void> => {
    try {
      addLog(`📝 Eksportuję ${scenarios.length} scenariuszy...`);
      
      for (const [index, scenario] of scenarios.entries()) {
        try {
          // Używamy slug jako ID dokumentu
          const scenarioRef = doc(db, 'app_scenarios', scenario.slug);
          
          await setDoc(scenarioRef, {
            appId,
            slug: scenario.slug,
            workspaceSlug: scenario.workspaceSlug,
            name: scenario.name,
            description: scenario.description || '',
            icon: scenario.icon || '',
            systemMessage: scenario.systemMessage || '',
            order: index,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          addLog(`✅ Scenariusz: ${scenario.name} (${scenario.slug})`);
          
          // Eksportujemy węzły
          await exportNodes(appId, scenario.slug, scenario.nodes);
        } catch (error) {
          addLog(`❌ Błąd scenariusz ${scenario.name}: ${error}`);
        }
      }
    } catch (error) {
      addLog(`❌ Błąd eksportu scenariuszy: ${error}`);
    }
  };
  
  // Eksport węzłów
  const exportNodes = async (appId: string, scenarioId: string, nodes: AppConfig['scenarios'][0]['nodes']): Promise<void> => {
    try {
      addLog(`📝 Eksportuję ${nodes.length} węzłów dla scenariusza ${scenarioId}...`);
      
      const nodePromises = nodes.map(async (node) => {
        try {
          // Używamy slug jako ID dokumentu
          const nodeRef = doc(db, 'app_nodes', node.slug);
          
          await setDoc(nodeRef, {
            appId,
            scenarioId,
            slug: node.slug,
            label: node.label,
            tplFile: node.tplFile,
            order: node.order,
            contextSchemaPath: node.contextSchemaPath,
            contextDataPath: node.contextDataPath,
            attrs: node.attrs ? JSON.stringify(node.attrs) : null,
            saveToDB: node.saveToDB ? JSON.stringify(node.saveToDB) : null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } catch (error) {
          addLog(`❌ Błąd węzła ${node.label}: ${error}`);
        }
      });
      
      await Promise.all(nodePromises);
    } catch (error) {
      addLog(`❌ Błąd eksportu węzłów: ${error}`);
    }
  };

  // Główna funkcja eksportu
  const exportConfig = async () => {
    setStatus('exporting');
    setLogs([]);
    
    try {
      addLog(`🚀 Eksport konfiguracji "${config.name}"...`);
      
      // Tworzymy nową aplikację
      const exportedAppId = await createApp(config);
      
      // Eksportujemy workspace'y
      await exportWorkspaces(exportedAppId, config.workspaces);
      
      // Eksportujemy scenariusze i ich nodes
      await exportScenarios(exportedAppId, config.scenarios);
      
      addLog(`✅ Eksport zakończony! ID: ${exportedAppId}`);
      setAppId(exportedAppId);
      setStatus('success');
    } catch (error) {
      addLog(`❌ Błąd eksportu: ${error}`);
      setStatus('error');
    }
  };

  // Renderowanie komponentu
  return (
    <div className="h-full overflow-auto p-4">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        {/* Nagłówek z podstawowymi informacjami o konfiguracji */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Eksporter konfiguracji</h3>
          <p className="text-xs text-gray-600 mt-1">
            Tworzy nową aplikację w Firebase z zachowaniem czytelnych identyfikatorów.
          </p>
          
          <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Dane konfiguracji:</h4>
                <ul className="mt-1 space-y-1 text-gray-600">
                  <li>• Nazwa: <span className="font-medium">{config.name}</span></li>
                  <li>• Workspaces: <span className="font-medium">{config.workspaces.length}</span></li>
                  <li>• Scenariusze: <span className="font-medium">{config.scenarios.length}</span></li>
                  <li>• Szablon: <span className="font-medium">{config.tplDir || 'default'}</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Identyfikatory:</h4>
                <ul className="mt-1 space-y-1 text-gray-600">
                  {config.workspaces.map((ws, i) => (
                    <li key={i}>• {ws.name}: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{ws.slug}</code></li>
                  )).slice(0, 2)}
                  {config.workspaces.length > 2 && (
                    <li>• ...i {config.workspaces.length - 2} więcej</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Przycisk eksportu */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={exportConfig}
            disabled={status === 'exporting'}
            className={`w-full py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center ${
              status === 'exporting'
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'exporting' ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                Eksportowanie...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1.5" />
                Eksportuj nową aplikację
              </>
            )}
          </button>
        </div>

        {/* Logi */}
        {logs.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <span>Logi</span>
              {status === 'success' && <CheckCircle className="w-3 h-3 ml-1.5 text-green-600" />}
              {status === 'error' && <AlertTriangle className="w-3 h-3 ml-1.5 text-red-600" />}
            </h3>
            <div 
              id="logs-container"
              className="bg-gray-900 text-gray-200 p-2 rounded h-40 overflow-y-auto text-xs font-mono"
            >
              {logs.map((log, index) => (
                <div key={index} className="mb-1 leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wynik */}
        {status === 'success' && (
          <div className="p-4 bg-green-50">
            <h3 className="text-xs font-semibold text-green-700 mb-2 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1.5" />
              Gotowe!
            </h3>
            <p className="text-xs text-green-600 mb-3">
              ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-green-200">{appId}</code>
            </p>
            <div className="flex space-x-2">
              <a
                href={`/app/${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
              >
                Otwórz
              </a>
              <button
                onClick={() => copyToClipboard(`/app/${appId}`)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                Kopiuj URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExporterTab;