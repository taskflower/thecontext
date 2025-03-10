// src/plugins/data-processor/index.ts

import { DataProcessorConfig } from './types';
import { ConfigComponent } from './components/ConfigComponent';
import { ViewComponent } from './components/ViewComponent';
import { ResultComponent } from './components/ResultComponent';
import { processData } from './utils';
import { PluginInterface } from '@/plugins-system/PluginInterface';

export class DataProcessorPlugin extends PluginInterface {
  private static instance: DataProcessorPlugin;
  
  private constructor() {
    super('data-processor', 'Data Processor');
    
    // Default configuration with proper typing
    this.defaultConfig = {
      dataSource: 'manual',
      inputData: '',
      transformationType: 'uppercase',
    } as DataProcessorConfig;
  }
  
  public static getInstance(): DataProcessorPlugin {
    if (!DataProcessorPlugin.instance) {
      DataProcessorPlugin.instance = new DataProcessorPlugin();
    }
    return DataProcessorPlugin.instance;
  }
  
  // Helper to get typed config
  getTypedConfig(): DataProcessorConfig {
    const state = this.getState();
    return (state?.config || this.defaultConfig) as DataProcessorConfig;
  }
  
  // Process data method
  processData = processData;
  
  // Component references
  ConfigComponent = ConfigComponent;
  ViewComponent = ViewComponent;
  ResultComponent = ResultComponent;
}

// Export singleton instance
export default DataProcessorPlugin.getInstance();