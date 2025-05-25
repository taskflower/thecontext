// src/ngn2/cre.ts - Clean API exports
export { Router } from './router/Router';
export { 
  useStore, 
  useConfig, 
  useSchema, 
  useExperiments, 
  useLlm 
} from './hooks';
export { configManager } from './config/ConfigManager';
export { getStoreManager } from './store/StoreManager';

// For backward compatibility, if needed
export { type StoreState } from './store/StoreManager';
export { type ConfigType } from './config/ConfigManager';