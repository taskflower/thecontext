// src/components/WorkspaceOverview.tsx
import React, {  useMemo, useEffect, useCallback, Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AppConfig } from '../core/types';
import { useFlowStore } from '../core/context';
import AppLoading from './AppLoading';
import { preloadLayout } from '../preloadLayout';
import WidgetLoader from './WidgetLoader';

const WorkspaceOverview: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const navigate = useNavigate();
  const { reset } = useFlowStore();

  const workspace = useMemo(() => config.workspaces.find(w => w.slug === workspaceSlug), [config.workspaces, workspaceSlug]);
  const workspaceScenarios = useMemo(() => config.scenarios, [config.scenarios]);
  const AppLayout = useMemo(() => preloadLayout(config.tplDir || 'default', config.templateSettings?.layoutFile || 'Simple'), [config.tplDir, config.templateSettings?.layoutFile]);

  useEffect(() => {
    reset();
  }, [workspaceSlug, reset]);

  const handleScenarioSelect = useCallback((scenarioSlug: string) => {
    navigate(`/${workspaceSlug}/${scenarioSlug}/0`);
  }, [navigate, workspaceSlug]);

  if (!workspace) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="p-6 max-w-md bg-white rounded-lg shadow-sm"><h2 className="text-lg font-semibold text-center mb-2">Workspace nie znaleziony</h2><p className="text-center text-gray-700 mb-4">Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.</p>{config.workspaces.length > 0 && <div className="mb-4"><p className="text-center text-gray-700 mb-2">Dostępne workspaces:</p><div className="flex flex-wrap justify-center gap-2">{config.workspaces.map(w => <Link key={w.slug} to={`/${w.slug}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">{w.name}</Link>)}</div></div>}<div className="flex justify-center"><Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Wróć do strony głównej</Link></div></div></div>;
  }

  const widgets = useMemo(() => config.templateSettings?.widgets || [], [config.templateSettings?.widgets]);

  return (
    <Suspense fallback={<AppLoading message="Ładowanie layoutu..." />}>
      <AppLayout>
        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{workspace.name}</h1>
            {workspace.description && <p className="text-gray-600">{workspace.description}</p>}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Dostępne scenariusze</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaceScenarios.map(scenario => (
                <div key={scenario.slug} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer" onClick={() => handleScenarioSelect(scenario.slug)}>
                  <div className="flex items-center mb-3">
                    {scenario.icon && <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3"><span className="text-blue-500">{scenario.icon}</span></div>}
                    <h3 className="font-medium text-lg">{scenario.name}</h3>
                  </div>
                  {scenario.description && <p className="text-gray-600 text-sm mb-3">{scenario.description}</p>}
                  <div className="mt-2"><button className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" onClick={e => { e.stopPropagation(); handleScenarioSelect(scenario.slug); }}>Rozpocznij</button></div>
                </div>
              ))}
            </div>
          </div>

          {widgets.length > 0 && <div><h2 className="text-xl font-semibold mb-4">Podsumowanie</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{widgets.map((widget, idx) => <WidgetLoader key={`${widget.tplFile}-${idx}`} tplDir={config.tplDir || 'default'} widget={widget} />)}</div></div>}
        </div>
      </AppLayout>
    </Suspense>
  );
};

export default WorkspaceOverview;
