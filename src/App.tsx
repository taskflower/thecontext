// src/App.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import AppPlugins from './plugins/components/AppPlugins';
import { PluginMarketplace } from './plugins/components/PluginMarketplace';
import { PluginManagerProvider } from './plugins/pluginContext';
import PluginLoaderToast from './plugins/PluginLoader';

function App() {
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  
  return (
    <PluginManagerProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Plugin System Demo</h1>
          <Button 
            variant="outline" 
            onClick={() => setMarketplaceOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Plugin Marketplace
          </Button>
        </header>
        
        <main className="flex-1 p-4">
          <AppPlugins />
        </main>
        
        <PluginMarketplace
          open={marketplaceOpen}
          onClose={() => setMarketplaceOpen(false)}
        />
        
        {/* Add the plugin loader toast to show loading status */}
        <PluginLoaderToast />
      </div>
    </PluginManagerProvider>
  );
}

export default App;