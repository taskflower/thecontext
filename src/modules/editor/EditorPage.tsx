// src/modules/editor/EditorPage.tsx - Updated with sidebar
import { useParams } from 'react-router-dom';
import { useConfig } from '@/core/engine';
import WorkspaceEditor from './components/WorkspaceEditor';
import EditorSidebar from './components/EditorSidebar';
import EditorBreadcrumbs from './components/EditorBreadcrumbs';

export default function EditorPage() {
  const { config, workspace, scenario, type } = useParams<{
    config: string;
    workspace: string;
    scenario?: string;
    type: string;
  }>();

  const cfgName = config || 'exampleTicketApp';
  const app = useConfig<any>(cfgName, `/src/_configs/${cfgName}/app.json`);

  const renderEditor = () => {
    switch (type) {
      case 'workspace':
        return <WorkspaceEditor configName={cfgName} workspaceName={workspace!} />;
      case 'scenario':
        return (
          <div className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Scenario Editor Coming Soon
              </h3>
              <p className="text-yellow-700">
                Scenario editor for <strong>{workspace}/{scenario}</strong> is under development.
              </p>
              <div className="mt-4 text-sm text-yellow-600">
                <p>This will include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Step configuration</li>
                  <li>Node management</li>
                  <li>Flow visualization</li>
                  <li>Template assignment</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">❌</div>
              <h3 className="text-lg font-semibold text-red-800">Unknown Editor Type</h3>
              <p className="text-red-700">Editor type "{type}" is not supported.</p>
            </div>
          </div>
        );
    }
  };

  const renderHeader = () => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'workspace': return '🏢';
        case 'scenario': return '📋';
        default: return '⚙️';
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'workspace': return 'Workspace Editor';
        case 'scenario': return 'Scenario Editor';
        default: return 'Configuration Editor';
      }
    };

    return (
      <header className="bg-white border-b border-zinc-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <EditorBreadcrumbs configName={cfgName} appName={app?.name} />
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-500">
              Theme: <span className="font-mono bg-zinc-100 px-2 py-1 rounded">{app?.tplDir || 'test'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            {getTypeIcon(type)} {getTypeLabel(type)}
          </h1>
          {workspace && (
            <div className="text-zinc-600">
              <strong>{workspace}</strong>
              {scenario && <span className="text-zinc-400"> › </span>}
              {scenario && <strong>{scenario}</strong>}
            </div>
          )}
        </div>
      </header>
    );
  };

  return (
    <div className="h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <EditorSidebar configName={cfgName} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderHeader()}
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}