// src/plugins-system/PluginManager.tsx
import { useState } from 'react';
import { usePluginStore } from './store';
import { loadPlugin } from './loadPlugin';
import { PluginInterface } from './PluginInterface';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Play, Square, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PluginManager: React.FC = () => {
  const { 
    plugins, 
    activePlugins, 
    registerPlugin, 
    unregisterPlugin,
    activatePlugin,
    deactivatePlugin
  } = usePluginStore();
  
  const [pluginUrl, setPluginUrl] = useState('');
  const [installError, setInstallError] = useState<string | null>(null);
  
  const handleInstallPlugin = async () => {
    if (!pluginUrl) return;
    setInstallError(null);
    
    try {
      const pluginModule = await loadPlugin(pluginUrl);
      
      if (pluginModule instanceof PluginInterface) {
        registerPlugin(pluginModule.id, pluginModule);
        setPluginUrl('');
      } else {
        setInstallError('Invalid plugin format');
      }
    } catch (error) {
      setInstallError(`Failed to install plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold">Plugin Manager</CardTitle>
        <CardDescription>Install, activate, and manage plugins</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Install New Plugin</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={pluginUrl}
              onChange={(e) => setPluginUrl(e.target.value)}
              placeholder="Enter plugin URL"
              className="flex-1"
            />
            <Button onClick={handleInstallPlugin}>Install</Button>
          </div>
          
          {installError && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{installError}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Installed Plugins</h3>
          
          {Object.entries(plugins).length === 0 ? (
            <div className="text-gray-500 italic p-4 text-center border border-dashed rounded-md">
              No plugins installed
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(plugins).map(([id, plugin]) => (
                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{plugin.name}</span>
                    <Badge variant={activePlugins.includes(id) ? "default" : "secondary"} className={activePlugins.includes(id) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {activePlugins.includes(id) ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {activePlugins.includes(id) ? (
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => deactivatePlugin(id)}
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      >
                        <Square size={14} className="mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => activatePlugin(id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Play size={14} className="mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => unregisterPlugin(id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X size={14} className="mr-1" />
                      Uninstall
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};