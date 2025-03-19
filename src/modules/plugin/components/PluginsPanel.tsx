// src/modules/plugin/components/PluginsPanel.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

import { loadPlugins } from "../loader";
import { PluginOptions } from "./PluginOptions";
import { usePluginStore } from "../store";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PluginsPanel: React.FC = () => {
  // Plugin store state
  const { 
    plugins, 
    activePlugins, 
    togglePlugin, 
    setPluginOptions, 
    pluginOptions,
    resetPlugins 
  } = usePluginStore();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load plugins on mount if not already loaded
  useEffect(() => {
    const loadPluginsIfNeeded = async () => {
      const pluginsCount = Object.keys(plugins).length;
      if (pluginsCount === 0) {
        setIsLoading(true);
        try {
          await loadPlugins();
          setError(null);
        } catch (err) {
          setError('Failed to load plugins');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadPluginsIfNeeded();
  }, [plugins]);
  
  // Handle reload button
  const handleReload = async () => {
    setIsLoading(true);
    try {
      await loadPlugins();
      setError(null);
    } catch (err) {
      setError('Failed to reload plugins');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert plugins object to sorted array
  const pluginsList = Object.values(plugins).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="p-4">
      <Tabs defaultValue="installed">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReload}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Reload
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <TabsContent value="installed" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : pluginsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pluginsList.map((plugin) => {
                const isActive = activePlugins.includes(plugin.id);
                
                return (
                  <Card key={plugin.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {plugin.name}
                            <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            v{plugin.version}
                          </CardDescription>
                        </div>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => togglePlugin(plugin.id, checked)}
                        />
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm mb-3">{plugin.description}</p>
                      
                      {isActive && plugin.options && plugin.options.length > 0 && (
                        <ScrollArea className="max-h-64">
                          <div className="space-y-3">
                            <PluginOptions
                              pluginId={plugin.id}
                              value={pluginOptions[plugin.id] || {}}
                              onChange={(options) => setPluginOptions(plugin.id, options)}
                            />
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No plugins found. Try reloading or check the console for errors.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Settings</CardTitle>
              <CardDescription>
                Global settings for all plugins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Reset Plugin Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Deactivate all plugins and reset their options to defaults
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={resetPlugins}
                >
                  Reset All
                </Button>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Active Plugins ({activePlugins.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {activePlugins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active plugins</p>
                  ) : (
                    activePlugins.map(id => {
                      const plugin = plugins[id];
                      return plugin ? (
                        <Badge key={id} variant="secondary">
                          {plugin.name}
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};