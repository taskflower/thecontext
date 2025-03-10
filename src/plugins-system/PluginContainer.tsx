import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Eye, PieChart } from 'lucide-react';
import { usePluginStore } from './store';

interface PluginContainerProps {
  pluginId: string;
}

export const PluginContainer: React.FC<PluginContainerProps> = ({ pluginId }) => {
  const { plugins, getPluginState } = usePluginStore();
  const plugin = plugins[pluginId];
  
  if (!plugin) {
    return (
      <Card className="w-full p-4 text-center text-red-500 bg-red-50">
        Plugin {pluginId} nie znaleziony
      </Card>
    );
  }
  
  const pluginState = getPluginState(pluginId);
  console.log('Plugin state:', pluginState);
  
  return (
    <Card className="w-full shadow-md border-blue-100">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl font-semibold text-blue-800">
          {plugin.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid grid-cols-3 rounded-none bg-gray-100">
            <TabsTrigger value="view" className="data-[state=active]:bg-white">
              <Eye size={16} className="mr-2" />
              Podgląd
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-white">
              <Settings size={16} className="mr-2" />
              Konfiguracja
            </TabsTrigger>
            <TabsTrigger value="result" className="data-[state=active]:bg-white">
              <PieChart size={16} className="mr-2" />
              Wyniki
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="p-4">
            <plugin.ViewComponent />
          </TabsContent>
          
          <TabsContent value="config" className="p-4">
            <plugin.ConfigComponent />
          </TabsContent>
          
          <TabsContent value="result" className="p-4">
            <plugin.ResultComponent />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};