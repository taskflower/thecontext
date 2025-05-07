import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link, useNavigate } from 'react-router-dom';
import { FlowEngine } from './core/engine';
import { useFlowStore } from './core/context';
import type { AppConfig } from './core/types';
import { AuthProvider } from './hooks';

// Preload Layout - This ensures we only load it once and memo it properly
const preloadLayout = (tplDir: string, layoutFile: string) => {
  console.log(`[FlowApp] Ładowanie layoutu: ${tplDir}/${layoutFile} - TYLKO RAZ`);
  return lazy(() => 
    import(`./themes/${tplDir}/layouts/${layoutFile}`)
      .catch(() => import('./themes/default/layouts/Simple'))
  );
};

// Main App Component
export const App: React.FC<{ 
  configUrl?: string;
  initialConfig?: AppConfig;
}> = ({ configUrl = '/api/config', initialConfig }) => {
  const [config, setConfig] = useState<AppConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);
  
  // Load configuration once
  useEffect(() => {
    if (initialConfig) return;
    
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(configUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [configUrl, initialConfig]);
  
  // Initial loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-center text-gray-700">Ładowanie konfiguracji...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <div className="text-red-500 text-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Błąd</h2>
          <p className="text-center text-gray-700">{error}</p>
        </div>
      </div>
    );
  }
  
  // No configuration
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-center text-gray-700">Brak konfiguracji</p>
        </div>
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <FlowRoutes config={config} />
      </BrowserRouter>
    </AuthProvider>
  );
};

// Flow Routes Component
const FlowRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  // Get the default workspace if available
  const defaultWorkspace = config.workspaces[0]?.slug || '';
  
  return (
    <Routes>
      {/* Redirect root to first workspace */}
      <Route path="/" element={<Navigate to={`/${defaultWorkspace}`} replace />} />
      
      {/* Workspace overview */}
      <Route path="/:workspaceSlug" element={
        <Suspense fallback={<AppLoading message="Ładowanie workspace..." />}>
          <WorkspaceOverview config={config} />
        </Suspense>
      } />
      
      {/* Scenario with specific step */}
      <Route path="/:workspaceSlug/:scenarioSlug/:stepIndex" element={
        <Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}>
          <ScenarioWithStep config={config} />
        </Suspense>
      } />
      
      {/* Scenario without step (defaults to first step) */}
      <Route path="/:workspaceSlug/:scenarioSlug" element={
        <Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}>
          <ScenarioWrapper config={config} />
        </Suspense>
      } />
      
      {/* Catch-all route for invalid paths */}
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-center mb-2">Strona nie znaleziona</h2>
            <p className="text-center text-gray-700 mb-4">Przepraszamy, ale strona której szukasz nie istnieje.</p>
            <div className="flex justify-center">
              <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Wróć do strony głównej
              </Link>
            </div>
          </div>
        </div>
      } />
    </Routes>
  );
};

// Loading component for app transitions
const AppLoading: React.FC<{ message?: string }> = ({ message = "Ładowanie aplikacji..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-center text-gray-700">{message}</p>
    </div>
  </div>
);

// Workspace Overview - Shows all scenarios in a workspace with widgets
const WorkspaceOverview: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const navigate = useNavigate();
  const { reset } = useFlowStore();
  
  // Znajdź workspace tylko raz przy montowaniu komponentu
  const workspace = useMemo(() => {
    console.log(`[FlowApp] Znajdowanie workspace: ${workspaceSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    return config.workspaces.find(w => w.slug === workspaceSlug);
  }, [config.workspaces, workspaceSlug]);
  
  // Get scenarios only once
  const workspaceScenarios = useMemo(() => {
    console.log(`[FlowApp] Pobieranie scenariuszy dla workspace: ${workspaceSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    return config.scenarios;
  }, [config.scenarios, workspaceSlug]);
  
  // Calculate once which layout to use and memoize it
  const AppLayout = useMemo(() => {
    const tplDir = config.tplDir || 'default';
    const layoutFile = config.templateSettings?.layoutFile || 'Simple';
    console.log(`[FlowApp] Inicjalizacja layoutu: ${tplDir}/${layoutFile} (WYKONUJE SIĘ TYLKO RAZ)`);
    return preloadLayout(tplDir, layoutFile);
  }, [config.tplDir, config.templateSettings?.layoutFile]);
  
  // Reset flow store when workspace changes - only once
  useEffect(() => {
    console.log(`[FlowApp] Resetowanie flow store dla workspace: ${workspaceSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    reset();
  }, [workspaceSlug, reset]);
  
  // Handle scenario selection - stable function reference
  const handleScenarioSelect = useCallback((scenarioSlug: string) => {
    navigate(`/${workspaceSlug}/${scenarioSlug}/0`);
  }, [navigate, workspaceSlug]);
  
  // If workspace not found, show a friendly error with all available workspaces
  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">Workspace nie znaleziony</h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.
          </p>
          
          {config.workspaces.length > 0 && (
            <div className="mb-4">
              <p className="text-center text-gray-700 mb-2">Dostępne workspaces:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {config.workspaces.map(w => (
                  <Link 
                    key={w.slug}
                    to={`/${w.slug}`} 
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    {w.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Load widgets from template settings - only once via memoization
  const widgets = useMemo(() => {
    return config.templateSettings?.widgets || [];
  }, [config.templateSettings?.widgets]);
  
  return (
    <Suspense fallback={<AppLoading message="Ładowanie layoutu..." />}>
      <AppLayout>
        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-gray-600">{workspace.description}</p>
            )}
          </div>
          
          {/* Scenarios section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Dostępne scenariusze</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaceScenarios.map((scenario) => (
                <div 
                  key={scenario.slug}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleScenarioSelect(scenario.slug)}
                >
                  <div className="flex items-center mb-3">
                    {scenario.icon && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-500">{scenario.icon}</span>
                      </div>
                    )}
                    <h3 className="font-medium text-lg">{scenario.name}</h3>
                  </div>
                  {scenario.description && (
                    <p className="text-gray-600 text-sm mb-3">{scenario.description}</p>
                  )}
                  <div className="mt-2">
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScenarioSelect(scenario.slug);
                      }}
                    >
                      Rozpocznij
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Widgets section */}
          {widgets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Podsumowanie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget, index) => (
                  <WidgetLoader
                    key={`${widget.tplFile}-${index}`}
                    tplDir={config.tplDir || 'default'}
                    widget={widget}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </Suspense>
  );
};

// Widget Loader component with memo to prevent rerenders
const WidgetLoader = React.memo(({ 
  tplDir, 
  widget 
}: {
  tplDir: string;
  widget: any;
}) => {
  // Memoize the widget component to load it only once
  const WidgetComponent = useMemo(() => {
    console.log(`[FlowApp] Ładowanie widgetu: ${widget.tplFile} (WYKONUJE SIĘ TYLKO RAZ)`);
    return lazy(() => 
      import(`./themes/${tplDir}/widgets/${widget.tplFile}`)
        .catch(() => import(`./themes/default/widgets/ErrorWidget`))
    );
  }, [tplDir, widget.tplFile]);
  
  return (
    <Suspense fallback={
      <div className="bg-white rounded-lg shadow-sm p-4 h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <WidgetComponent {...widget} componentName={widget.tplFile} />
    </Suspense>
  );
});

// Scenario Wrapper Component - Redirects to first step
const ScenarioWrapper: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug } = useParams<{ workspaceSlug: string; scenarioSlug: string }>();
  
  // Find scenario to determine first step - only once via memoization
  const scenario = useMemo(() => {
    console.log(`[FlowApp] Znajdowanie scenariusza: ${scenarioSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    return config.scenarios.find(s => s.slug === scenarioSlug);
  }, [config.scenarios, scenarioSlug]);
  
  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">Scenariusz nie znaleziony</h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale scenariusz "{scenarioSlug}" nie istnieje.
          </p>
          <div className="flex justify-center">
            <Link to={`/${workspaceSlug}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Wróć do workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to first step
  return <Navigate to={`/${workspaceSlug}/${scenarioSlug}/0`} replace />;
};

// Scenario With Step Component - Main flow component
const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{ 
    workspaceSlug: string; 
    scenarioSlug: string; 
    stepIndex: string;
  }>();
  const navigate = useNavigate();
  const { currentNodeIndex, setCurrentNodeIndex, reset } = useFlowStore();
  const stepIdx = parseInt(stepIndex || '0', 10);
  const [transitioning, setTransitioning] = useState(false);
  const [prevIndex, setPrevIndex] = useState(stepIdx);
  
  // Znajdź bieżący scenariusz i workspace tylko raz przy montażu komponentu
  const scenario = useMemo(() => {
    console.log(`[FlowApp] Znajdowanie scenariusza: ${scenarioSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    return config.scenarios.find(s => s.slug === scenarioSlug);
  }, [config.scenarios, scenarioSlug]);
  
  const workspace = useMemo(() => {
    console.log(`[FlowApp] Znajdowanie workspace: ${workspaceSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    return config.workspaces.find(w => w.slug === workspaceSlug);
  }, [config.workspaces, workspaceSlug]);
  
  // Calculate once which layout to use and memoize it
  const AppLayout = useMemo(() => {
    const tplDir = config.tplDir || 'default';
    const layoutFile = config.templateSettings?.layoutFile || 'Simple';
    console.log(`[FlowApp] Inicjalizacja layoutu: ${tplDir}/${layoutFile} (WYKONUJE SIĘ TYLKO RAZ)`);
    return preloadLayout(tplDir, layoutFile);
  }, [config.tplDir, config.templateSettings?.layoutFile]);
  
  // Reset flow i synchronizuj z parametrem URL przy montażu - tylko raz
  useEffect(() => {
    console.log(`[FlowApp] Resetowanie flow store dla scenariusza: ${scenarioSlug} (WYKONUJE SIĘ TYLKO RAZ)`);
    reset();
    if (stepIdx !== currentNodeIndex) {
      setCurrentNodeIndex(stepIdx);
    }
  }, [scenarioSlug, reset]);
  
  // Aktualizuj URL gdy currentNodeIndex ulegnie zmianie
  useEffect(() => {
    if (stepIdx !== currentNodeIndex) {
      navigate(`/${workspaceSlug}/${scenarioSlug}/${currentNodeIndex}`, { replace: true });
    }
  }, [currentNodeIndex, navigate, scenarioSlug, stepIdx, workspaceSlug]);
  
  // Obsługa przejść między krokami
  useEffect(() => {
    if (currentNodeIndex !== prevIndex) {
      setTransitioning(true);
      
      // Krótki timeout na animację CSS
      const timer = setTimeout(() => {
        setPrevIndex(currentNodeIndex);
        setTransitioning(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentNodeIndex, prevIndex]);
  
  // If scenario not found
  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">Scenariusz nie znaleziony</h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale scenariusz "{scenarioSlug}" nie istnieje.
          </p>
          
          {config.scenarios.length > 0 && (
            <div className="mb-4">
              <p className="text-center text-gray-700 mb-2">Dostępne scenariusze:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {config.scenarios.map(s => (
                  <Link 
                    key={s.slug}
                    to={`/${workspaceSlug}/${s.slug}`} 
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Link to={`/${workspaceSlug}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Wróć do workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If workspace not found
  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">Workspace nie znaleziony</h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.
          </p>
          
          {config.workspaces.length > 0 && (
            <div className="mb-4">
              <p className="text-center text-gray-700 mb-2">Dostępne workspaces:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {config.workspaces.map(w => (
                  <Link 
                    key={w.slug}
                    to={`/${w.slug}`} 
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    {w.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Get sorted nodes for breadcrumb/progress - compute once
  const { sortedNodes, totalSteps } = useMemo(() => {
    const nodes = [...scenario.nodes].sort((a, b) => a.order - b.order);
    return {
      sortedNodes: nodes,
      totalSteps: nodes.length
    };
  }, [scenario.nodes]);
  
  return (
    <Suspense fallback={<AppLoading message="Ładowanie layoutu..." />}>
      <AppLayout>
        {/* Optional breadcrumb navigation */}
        <div className="bg-gray-50 border-b border-gray-200 mb-6">
          <div className="max-w-6xl mx-auto py-2 px-4">
            <nav className="flex text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">/</span>
              <Link to={`/${workspaceSlug}`} className="hover:text-gray-700">{workspace.name}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{scenario.name}</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700">Krok {currentNodeIndex + 1}</span>
            </nav>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
              <div 
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${((currentNodeIndex + 1) / totalSteps) * 100}%` }} 
              />
            </div>
            <div className="text-sm text-gray-500">
              Krok {currentNodeIndex + 1} / {totalSteps}
            </div>
          </div>
        </div>
        
        {/* Flow engine with transitions */}
        <div className="max-w-6xl mx-auto px-4">
          <div className={`transition-all duration-200 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}>
            <Suspense fallback={
              <div className="p-8 bg-white rounded-lg shadow-md min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Ładowanie zawartości...</p>
                </div>
              </div>
            }>
              {!transitioning && <FlowEngine config={config} scenarioSlug={scenarioSlug} />}
            </Suspense>
          </div>
          
          {/* Loading indicator during transitions */}
          {transitioning && (
            <div className="p-8 bg-white rounded-lg shadow-md min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600">Przechodzenie do kolejnego kroku...</p>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </Suspense>
  );
};

// Błędów brakujący import
import { useCallback } from 'react';