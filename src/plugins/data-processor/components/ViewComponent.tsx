import React, { useState, useEffect } from 'react';
import { DataProcessorPlugin } from '..';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

export const ViewComponent: React.FC = () => {
  const plugin = DataProcessorPlugin.getInstance();
  const config = plugin.getTypedConfig();
  const appStore = plugin.getAppStore();
  
  const [inputData, setInputData] = useState<string>('');
  
  useEffect(() => {
    // Get data from configured source
    if (config.dataSource === 'manual') {
      setInputData(config.inputData);
    } else if (config.dataSource === 'app') {
      // Example: Get data from app store counter
      setInputData(`App counter value: ${appStore.counter}`);
    }
  }, [config, appStore.counter]);
  
  const handleProcess = () => {
    const result = plugin.processData(inputData, config.transformationType);
    plugin.updateResult(result);
  };
  
  return (
    <Card className="w-full border-blue-100">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Dane do przetworzenia:</h4>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 min-h-16 text-sm font-mono">
            {inputData || 'Brak dostępnych danych'}
          </div>
        </div>
        
        <Button 
          onClick={handleProcess} 
          disabled={!inputData}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Play size={16} className="mr-2" />
          Przetwórz dane
        </Button>
      </CardContent>
    </Card>
  );
};