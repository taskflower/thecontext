/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins_system/PluginContainer.tsx
// Uproszczony kontener pluginu

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Eye, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePluginStore } from "./pluginStore";
import { useScenarioStore } from "../scenarios_module/scenarioStore";
import MCard from "@/components/MCard";

interface PluginContainerProps {
  pluginId: string;
  nodeId?: string;
}

export const PluginContainer: React.FC<PluginContainerProps> = ({
  pluginId,
  nodeId,
}) => {
  const { plugins, getPluginState, updatePluginConfig } = usePluginStore();
  const { nodes } = useScenarioStore();

  const plugin = plugins[pluginId];

  if (!plugin) {
    return (
      <Card className="w-full p-4 text-center text-red-500 bg-red-50">
        Plugin {pluginId} not found
      </Card>
    );
  }

  const config =
    nodeId &&
    nodes[nodeId]?.pluginId === pluginId &&
    nodes[nodeId]?.pluginConfig
      ? nodes[nodeId].pluginConfig
      : getPluginState(pluginId)?.config || {};

  const title = nodeId ? `${plugin.name} - ${nodeId}` : plugin.name;

  const handleConfigChange = (updates: Record<string, any>) => {
    if (nodeId) {
      useScenarioStore.getState().updateNodePluginConfig(nodeId, updates);
    }
    updatePluginConfig(pluginId, updates);
  };

  return (
    <MCard
      title={
        <>
          {title}
          {nodeId && (
            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <span>Node:</span>
              <Badge variant="outline" className="text-xs">
                {nodeId}
              </Badge>
            </div>
          )}
        </>
      }
      description={plugin.description}
    >
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid grid-cols-3 rounded-none bg-gray-100">
          <TabsTrigger value="view" className="data-[state=active]:bg-white">
            <Eye size={16} className="mr-2" />
            View
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-white">
            <Settings size={16} className="mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="result" className="data-[state=active]:bg-white">
            <PieChart size={16} className="mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="p-4 border border-dotted">
          <plugin.ViewComponent
            nodeId={nodeId}
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="config" className="p-4 border border-dotted">
          <plugin.ConfigComponent
            nodeId={nodeId}
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="result" className="p-4 border border-dotted">
          <plugin.ResultComponent nodeId={nodeId} config={config} />
        </TabsContent>
      </Tabs>
    </MCard>
  );
};
