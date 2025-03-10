import React from 'react';
import { PluginContainer } from './PluginContainer';
import { usePluginStore } from './store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

export const PluginsDashboard: React.FC = () => {
  const { getActivePlugins } = usePluginStore();
  const activePlugins = getActivePlugins();
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Active Plugins</CardTitle>
        <CardDescription>Currently running plugin modules</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {activePlugins.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
            <p className="text-gray-500">No active plugins</p>
            <p className="text-sm text-gray-400 mt-2">Activate plugins from the Plugin Manager</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activePlugins.map(({ id }) => (
              <PluginContainer key={id} pluginId={id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};