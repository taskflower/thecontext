// src/plugins/data-processor/components/ConfigComponent.tsx
import React from 'react';
import { DataProcessorPlugin } from '..';
import { DataProcessorConfig } from '../types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const ConfigComponent: React.FC = () => {
  const plugin = DataProcessorPlugin.getInstance();
  const config = plugin.getTypedConfig();
  
  const handleConfigChange = (key: keyof DataProcessorConfig, value: string) => {
    plugin.updateConfig({ [key]: value });
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-source">Data Source</Label>
          <Select 
            value={config.dataSource} 
            onValueChange={(value) => handleConfigChange('dataSource', value as 'manual' | 'app')}
          >
            <SelectTrigger id="data-source" className="w-full">
              <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Input</SelectItem>
              <SelectItem value="app">App Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {config.dataSource === 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="input-data">Input Data</Label>
            <Textarea
              id="input-data"
              value={config.inputData}
              onChange={(e) => handleConfigChange('inputData', e.target.value)}
              placeholder="Enter data to process"
              className="min-h-32"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="transformation-type">Transformation Type</Label>
          <Select 
            value={config.transformationType} 
            onValueChange={(value) => handleConfigChange('transformationType', value as 'uppercase' | 'lowercase' | 'reverse' | 'count')}
          >
            <SelectTrigger id="transformation-type" className="w-full">
              <SelectValue placeholder="Select transformation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uppercase">Convert to Uppercase</SelectItem>
              <SelectItem value="lowercase">Convert to Lowercase</SelectItem>
              <SelectItem value="reverse">Reverse Text</SelectItem>
              <SelectItem value="count">Count Characters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};