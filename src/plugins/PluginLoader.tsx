// src/plugins/PluginLoader.tsx
import { useToast } from '@/hooks/useToast';
import { useEffect, useState, useRef } from 'react';
import { usePluginStore } from './store/pluginStore';
import { Loader2 } from 'lucide-react';

export default function PluginLoaderToast() {
  const { toast } = useToast();
  const [initialLoad, setInitialLoad] = useState(true);
  const notifiedRef = useRef(false);
  
  // Używamy useRef aby uniknąć renderowania przy każdej zmianie
  const isLoading = usePluginStore(state => state.isLoading);
  const pluginCount = usePluginStore(state => 
    Object.keys(state.registeredPlugins).length
  );
  
  // Pokaż komunikat tylko raz po załadowaniu
  useEffect(() => {
    if (initialLoad && !isLoading && pluginCount > 0 && !notifiedRef.current) {
      toast({
        title: "Wtyczki załadowane",
        description: `Pomyślnie załadowano ${pluginCount} wtyczek`,
      });
      notifiedRef.current = true;
      setInitialLoad(false);
    }
  }, [isLoading, pluginCount, toast, initialLoad]);
  
  // Pokaż wskaźnik ładowania tylko podczas początkowego ładowania
  if (initialLoad && isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-background border shadow-md rounded-md p-3 flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Ładowanie wtyczek...</span>
      </div>
    );
  }
  
  return null;
}