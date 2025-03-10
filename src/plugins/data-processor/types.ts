// src/plugins/data-processor/types.ts

import { PluginConfig } from "@/plugins-system/types";


export interface DataProcessorConfig extends PluginConfig {
  dataSource: 'manual' | 'app';
  inputData: string;
  transformationType: 'uppercase' | 'lowercase' | 'reverse' | 'count';
}