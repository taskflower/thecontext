// src/components/AppLayout.tsx
import React from "react";
import { useAppStore } from "@/modules/store";
import { WorkspacesList } from "@/modules/workspaces";
import { ScenariosList } from "@/modules/scenarios";
import { NodesList } from "@/modules/nodes";
import { EdgesList } from "@/modules/edges";
import { FlowGraph } from "@/modules/flow";
import { PluginManager } from "@/modules/plugin/components/PuginManager";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";



export const AppLayout: React.FC = () => {
  const stateVersion = useAppStore((state) => state.stateVersion);

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden" key={stateVersion}>
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r bg-background h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold tracking-tight">Conversation Flow Builder</h1>
          </div>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6 pr-4">
              <Card>
                <CardContent className="p-0">
                  <WorkspacesList />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-0">
                  <ScenariosList />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardContent className="p-0">
                    <NodesList />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-0">
                    <EdgesList />
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 flex-1">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full">
              <FlowGraph />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Plugin Manager */}
      <PluginManager />
    </div>
  );
};