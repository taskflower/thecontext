import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { FlowEngine } from './core/engine';
import { useFlowStore } from './core/context';
import type { AppConfig } from './core/types';
import { AuthProvider } from './hooks';

// Preload Layout - This ensures we only load it once
const preloadLayout = (tplDir: string, layoutFile: string) => {
  const Layout = lazy(() => 
    import(`./themes/${tplDir}/layouts/${layoutFile}`)
      .catch(() => import('./themes/default/layouts/Simple'))
  );
  
  // Return a component that will reuse the same Layout instance
  return React.memo(({ children }: { children: React.ReactNode }) => (
    <Layout>{children}</Layout>
  ));
};

// This is our core application logic
export const App: React.FC<{ 
  configUrl?: string;
  initialConfig?: AppConfig;
}> = ({ configUrl = '/api/config', initialConfig }) => {
  const [config, setConfig] = useState<AppConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useFlowStore();
  const layoutRef = useRef<React.ComponentType<{children: React.ReactNode}> | null>(null);
  
  // Load configuration
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
  
  // Reset state when configuration changes
  useEffect(() => {
    if (config) reset();
  }, [config, reset]);
  
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
  
  // Create or reuse the layout component
  if (!layoutRef.current) {
    const tplDir = config.tplDir || 'default';
    const layoutFile = config.templateSettings?.layoutFile || 'Simple';
    layoutRef.current = preloadLayout(tplDir, layoutFile);
  }
  
  // Get the current Layout component
  const AppLayout = layoutRef.current;
  
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-center text-gray-700">Ładowanie aplikacji...</p>
          </div>
        </div>
      }>
        <AppLayout>
          <StableFlowEngine config={config} />
        </AppLayout>
      </Suspense>
    </AuthProvider>
  );
};

// Component that ensures stable step transitions
const StableFlowEngine: React.FC<{ 
  config: AppConfig; 
  scenarioSlug?: string;
}> = ({ config, scenarioSlug }) => {
  const { currentNodeIndex } = useFlowStore();
  const [prevIndex, setPrevIndex] = useState(currentNodeIndex);
  const [transitioning, setTransitioning] = useState(false);
  
  // Handle step transitions
  useEffect(() => {
    if (currentNodeIndex !== prevIndex) {
      setTransitioning(true);
      
      // Short timeout to allow for CSS transition
      const timer = setTimeout(() => {
        setPrevIndex(currentNodeIndex);
        setTransitioning(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentNodeIndex, prevIndex]);
  
  return (
    <>
      {/* Active step content - fades out when transitioning */}
      <div 
        className={`transition-all duration-200 ${
          transitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
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
      
      {/* We only show a loading indicator during transitions */}
      {transitioning && (
        <div className="p-8 bg-white rounded-lg shadow-md min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Przechodzenie do kolejnego kroku...</p>
          </div>
        </div>
      )}
    </>
  );
};