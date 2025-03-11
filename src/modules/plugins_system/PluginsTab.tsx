// src/modules/plugins_system/PluginsTab.tsx
// Uproszczona zakładka pluginów

import React from "react";
import { usePluginStore } from "./pluginStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginContainer } from "./PluginContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScenarioStore } from "../scenarios_module/scenarioStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Komponent do zarządzania integracją węzłów z pluginami
const NodePluginIntegration = () => {
  const { nodes } = useScenarioStore();
  const { plugins, activePlugins } = usePluginStore();
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState('');

  const handleAssignPlugin = () => {
    if (selectedNode && selectedPlugin) {
      useScenarioStore.getState().assignPluginToNode(selectedNode, selectedPlugin);
      setSelectedNode('');
      setSelectedPlugin('');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Przypisz Plugin do Węzła</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Wybierz węzeł</label>
            <Select value={selectedNode} onValueChange={setSelectedNode}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz węzeł" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(nodes).map(nodeId => (
                  <SelectItem key={nodeId} value={nodeId}>{nodeId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Wybierz plugin</label>
            <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz plugin" />
              </SelectTrigger>
              <SelectContent>
                {activePlugins
                  .filter(pluginId => plugins[pluginId]) // Filtruj, aby uwzględnić tylko istniejące pluginy
                  .map(pluginId => (
                    <SelectItem key={pluginId} value={pluginId}>{plugins[pluginId].name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleAssignPlugin} 
          disabled={!selectedNode || !selectedPlugin}
          className="w-full"
        >
          Przypisz Plugin do Węzła
        </Button>
      </CardContent>
    </Card>
  );
};

// Komponent wyświetlający aktywne pluginy
const ActivePlugins = () => {
  const { plugins, activePlugins, deactivatePlugin } = usePluginStore();
  
  // Filtracja aktywnych wtyczek, które rzeczywiście istnieją
  const validActivePlugins = activePlugins.filter(pluginId => plugins[pluginId]);

  if (validActivePlugins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktywne Pluginy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            Brak aktywnych pluginów
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktywne Pluginy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validActivePlugins.map(pluginId => (
            <div key={pluginId} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <div className="font-medium">{plugins[pluginId].name}</div>
                <div className="text-sm text-slate-500">{plugins[pluginId].description}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => deactivatePlugin(pluginId)}
              >
                Dezaktywuj
              </Button>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

// Główna zakładka pluginów
const PluginsTab: React.FC = () => {
  const { plugins, activePlugins } = usePluginStore();
  
  return (
    <div className="space-y-6 mt-6">
      <NodePluginIntegration />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivePlugins />
        
        <Card>
          <CardHeader>
            <CardTitle>Węzły z Pluginami</CardTitle>
          </CardHeader>
          <CardContent>
            <NodePluginsView />
          </CardContent>
        </Card>
      </div>
      
      {activePlugins
        .filter(pluginId => plugins[pluginId]) // Filtruj, aby uwzględnić tylko istniejące pluginy
        .map(pluginId => (
          <PluginContainer key={pluginId} pluginId={pluginId} />
        ))}
    </div>
  );
};

// Komponent wyświetlający węzły z pluginami
const NodePluginsView = () => {
  const { nodes } = useScenarioStore();
  const { plugins } = usePluginStore();
  
  const nodesWithPlugins = Object.entries(nodes)
    .filter(([_, node]) => node.pluginId && plugins[node.pluginId])
    .map(([nodeId, node]) => ({ nodeId, pluginId: node.pluginId! }));
  
  if (nodesWithPlugins.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        Brak węzłów z przypisanymi pluginami
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {nodesWithPlugins.map(({ nodeId, pluginId }) => (
        <div key={nodeId} className="p-3 border rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{nodeId}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-blue-50 border-blue-200">
                  {plugins[pluginId].name}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => useScenarioStore.getState().removePluginFromNode(nodeId)}
            >
              Odłącz
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PluginsTab;