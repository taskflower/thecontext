// PluginLoaderToast.tsx
import { useEffect, useState } from 'react';
import { getAllPlugins } from '@/pages/stepsPlugins/registry';
import { AlertCircle, CheckCircle, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react';

interface PluginLoadState {
  type: string;
  name: string;
  status: 'loading' | 'loaded' | 'error';
  category: string;
  errorMessage?: string;
}

export default function PluginLoaderToast() {
  const [plugins, setPlugins] = useState<PluginLoadState[]>([]);
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const registeredPlugins = getAllPlugins();
    const initialStates: PluginLoadState[] = registeredPlugins.map(plugin => ({
      type: plugin.type,
      name: plugin.name,
      status: 'loading',
      category: plugin.category
    }));
    setPlugins(initialStates);

    // Ustawiamy status wszystkich pluginów na "loaded"
    const updatedPlugins = initialStates.map((plugin): PluginLoadState => ({
      ...plugin,
      status: 'loaded',
      errorMessage: undefined,
    }));
    setPlugins(updatedPlugins);
  }, []);

  const loadedCount = plugins.filter(p => p.status !== 'loading').length;
  const totalCount = plugins.length;
  const overallProgress = totalCount > 0 ? Math.floor((loadedCount / totalCount) * 100) : 0;

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-md shadow-lg overflow-hidden">
      {/* Nagłówek */}
      <div className="px-4 py-3 bg-black text-white flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs font-medium">Ładowanie pluginów</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white text-black">
            {loadedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:text-gray-300"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setVisible(false)}
            className="text-white hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Treść rozwijalna */}
      {!collapsed && (
        <>
          {/* Pasek postępu */}
          <div className="w-full bg-gray-300">
            <div 
              className="h-1 bg-black"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>

          {/* Lista pluginów */}
          <div className="max-h-60 overflow-y-auto p-3 space-y-2">
            {plugins.map(plugin => (
              <div 
                key={plugin.type} 
                className="text-sm border border-black rounded p-2 flex items-center"
              >
                {plugin.status === 'loading' && (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                )}
                {plugin.status === 'loaded' && (
                  <CheckCircle className="h-3 w-3 mr-2" />
                )}
                {plugin.status === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 mr-2" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{plugin.name}</span>
                      <span className="text-xs">{plugin.errorMessage}</span>
                    </div>
                  </>
                )}
                {(plugin.status === 'loaded' || plugin.status === 'loading') && (
                  <span className="text-xs font-medium">{plugin.name}</span>
                )}
              </div>
            ))}
          </div>

          {/* Stopka */}
          <div className="px-4 py-2 bg-black text-xs text-white">
            Załadowano {loadedCount} z {totalCount} pluginów
            {plugins.some(p => p.status === 'error') && (
              <span className="ml-1">(Błędy)</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
