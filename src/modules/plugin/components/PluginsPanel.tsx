// src/modules/plugin/components/PluginsPanel.tsx
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Importujemy nowy usePluginStore zamiast starego pluginRegistry i usePluginStore

import { loadPlugins } from "../loader";
import { PluginOptions } from "./PluginOptions";
import { usePluginStore } from "../store";

export const PluginsPanel: React.FC = () => {
  // Używamy nowego hooka usePluginStore
  const { 
    plugins, 
    activePlugins, 
    togglePlugin, 
    setPluginOptions, 
    pluginOptions 
  } = usePluginStore();
  
  // Załaduj pluginy przy pierwszym renderowaniu
  useEffect(() => {
    // Ładujemy pluginy tylko raz
    const pluginsCount = Object.keys(plugins).length;
    if (pluginsCount === 0) {
      loadPlugins();
    }
  }, [plugins]);

  // Konwertujemy obiekt plugins na tablicę do wyświetlenia
  const pluginsList = Object.values(plugins);

  return (
    <div className="p-4">
      <Tabs defaultValue="installed">
        <TabsList className="mb-4">
          <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="installed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pluginsList.length > 0 ? (
              pluginsList.map((plugin) => {
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
                      
                      {/* Wyświetlanie opcji pluginu */}
                      {isActive && plugin.options && plugin.options.length > 0 && (
                        <ScrollArea className="max-h-32">
                          <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-semibold">Plugin Options</h4>
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
              })
            ) : (
              <Card className="col-span-2">
                <CardContent className="p-4 text-center text-muted-foreground">
                  No plugins found or plugins are still loading...
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Settings</CardTitle>
              <CardDescription>
                Global settings for all plugins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Currently, there are no global plugin settings available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};