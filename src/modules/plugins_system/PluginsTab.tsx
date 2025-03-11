/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/plugins_system/PluginsTab.tsx
import React, { useState } from "react";
import { usePluginStore } from "./pluginStore";
import { PluginContainer } from "./PluginContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScenarioStore } from "../scenarios_module/scenarioStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";

// Plugin Dialog Component
const PluginPreviewDialog = ({ 
  isOpen, 
  onClose, 
  pluginId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  pluginId: string 
}) => {
  if (!pluginId) return null;
  
  return (
    <MDialog 
      isOpen={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      title="Plugin Preview"
      maxWidth="sm:max-w-3xl"
    >
      <div className="mt-4">
        <PluginContainer pluginId={pluginId} />
      </div>
    </MDialog>
  );
};

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
    <MCard 
      title="Przypisz Plugin do Węzła"
      description=""
      className="mb-6"
    >
      <div className="space-y-4">
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
                  .filter(pluginId => plugins[pluginId]) 
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
      </div>
    </MCard>
  );
};

const ActivePlugins = () => {
  const { plugins, activePlugins, deactivatePlugin } = usePluginStore();
  const validActivePlugins = activePlugins.filter(pluginId => plugins[pluginId]);
  const [previewPluginId, setPreviewPluginId] = useState<string | null>(null);

  if (validActivePlugins.length === 0) {
    return (
      <MCard
        title="Aktywne Pluginy"
        description=""
      >
        <div className="text-center py-6 text-slate-500">
          Brak aktywnych pluginów
        </div>
      </MCard>
    );
  }

  return (
    <>
      <MCard
        title="Aktywne Pluginy"
        description=""
      >
        <div className="space-y-4">
          {validActivePlugins.map(pluginId => (
            <div key={pluginId} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <div className="font-medium">{plugins[pluginId].name}</div>
                <div className="text-sm text-slate-500">{plugins[pluginId].description}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPreviewPluginId(pluginId)}
                >
                  <Eye size={16} className="mr-2" />
                  Podgląd
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => deactivatePlugin(pluginId)}
                >
                  Dezaktywuj
                </Button>
              </div>
            </div>
          ))}
        </div>
      </MCard>
      
      <PluginPreviewDialog 
        isOpen={!!previewPluginId} 
        onClose={() => setPreviewPluginId(null)} 
        pluginId={previewPluginId || ''} 
      />
    </>
  );
};

const NodePluginsView = () => {
  const { nodes } = useScenarioStore();
  const { plugins } = usePluginStore();
  const [previewPluginId, setPreviewPluginId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  
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
  
  const handlePreviewClick = (nodeId: string, pluginId: string) => {
    setPreviewNodeId(nodeId);
    setPreviewPluginId(pluginId);
  };
  
  return (
    <>
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePreviewClick(nodeId, pluginId)}
                >
                  <Eye size={16} className="mr-2" />
                  Podgląd
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => useScenarioStore.getState().removePluginFromNode(nodeId)}
                >
                  Odłącz
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {previewPluginId && previewNodeId && (
        <MDialog 
          isOpen={!!previewPluginId} 
          onOpenChange={(open) => !open && (setPreviewPluginId(null), setPreviewNodeId(null))}
          title="Podgląd Pluginu w Węźle"
          maxWidth="sm:max-w-3xl"
        >
          <div className="mt-4">
            <PluginContainer pluginId={previewPluginId} nodeId={previewNodeId} />
          </div>
        </MDialog>
      )}
    </>
  );
};

const PluginsTab: React.FC = () => {
  return (
    <div className="space-y-6 mt-6">
      <NodePluginIntegration />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivePlugins />
        <MCard
          title="Węzły z Pluginami"
          description=""
        >
          <NodePluginsView />
        </MCard>
      </div>
      
      {/* Usunięto wyświetlanie pluginów bezpośrednio w zakładce */}
    </div>
  );
};

export default PluginsTab;